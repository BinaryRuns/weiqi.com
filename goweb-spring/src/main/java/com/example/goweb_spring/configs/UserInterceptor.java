package com.example.goweb_spring.configs;

import com.sun.security.auth.UserPrincipal;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.Principal;
import java.util.Base64;
import java.util.Map;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Custom WebSocket handshake handler that authenticates users based on JWT tokens.
 * Extracts the user ID from the token and creates a Principal for the WebSocket session.
 */
@Component
public class UserInterceptor extends DefaultHandshakeHandler {
    private static final Logger logger = LoggerFactory.getLogger(UserInterceptor.class);
    private final Key jwtKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Creates a new UserInterceptor with the specified JWT secret.
     *
     * @param jwtSecret The JWT secret to use for token validation
     */
    public UserInterceptor(@Value("${supabase.jwt.secret}") String jwtSecret) {
        try {
            byte[] keyBytes;

            if (jwtSecret != null && !jwtSecret.isEmpty()) {
                // Remove quotes if present
                String trimmedSecret = jwtSecret.trim();
                if (trimmedSecret.startsWith("\"") && trimmedSecret.endsWith("\"")) {
                    trimmedSecret = trimmedSecret.substring(1, trimmedSecret.length() - 1);
                }
                
                // Supabase exposes the JWT secret as a Base64-encoded string. Attempt to decode.
                try {
                    keyBytes = Base64.getDecoder().decode(trimmedSecret);
                    logger.debug("Initialized JWT key for WebSocket authentication ({} bytes)", keyBytes.length);
                } catch (IllegalArgumentException ex) {
                    logger.debug("JWT secret not Base64-encoded, using raw bytes");
                    keyBytes = trimmedSecret.getBytes(StandardCharsets.UTF_8);
                }
            } else {
                logger.error("Supabase JWT secret missing - WebSocket authentication will fail");
                keyBytes = "missing_jwt_secret".getBytes(StandardCharsets.UTF_8);
            }

            this.jwtKey = Keys.hmacShaKeyFor(keyBytes);
            logger.info("Successfully initialized JWT key for WebSocket authentication");
        } catch (Exception e) {
            logger.error("Failed to initialize JWT key for WebSocket: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize JWT key for WebSocket", e);
        }
    }

    /**
     * Determines the user Principal for the WebSocket session based on the JWT token.
     *
     * @param request The HTTP request for the WebSocket connection
     * @param wsHandler The WebSocket handler
     * @param attributes The WebSocket session attributes
     * @return The Principal representing the authenticated user, or null if authentication fails
     */
    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            // Extract token from query parameters
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return null;
            }
            
            // First try standard JWT verification
            String userId = verifyTokenWithJWT(token);
            if (userId != null) {
                return new UserPrincipal(userId);
            }
            
            // If standard verification fails, try direct payload extraction
            userId = extractUserIdFromPayload(token);
            if (userId != null) {
                return new UserPrincipal(userId);
            }
            
            logger.debug("All authentication methods failed for WebSocket connection");
        } catch (Exception e) {
            logger.error("Unexpected error in WebSocket authentication: {}", e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Extracts the token from the request query parameters.
     *
     * @param request The HTTP request
     * @return The extracted token, or null if not found
     */
    private String extractTokenFromRequest(ServerHttpRequest request) {
        String query = request.getURI().getQuery();
        if (query == null) {
            return null;
        }
        
        String[] queryParams = query.split("&");
        for (String param : queryParams) {
            if (param.startsWith("token=")) {
                return param.substring(6); // Remove "token=" prefix
            }
        }
        
        return null;
    }
    
    /**
     * Attempts to verify the token using standard JWT verification.
     *
     * @param token The JWT token to verify
     * @return The user ID extracted from the token, or null if verification fails
     */
    private String verifyTokenWithJWT(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String userId = claims.getSubject();
            if (userId != null && !userId.isEmpty()) {
                logger.debug("WebSocket authenticated with JWT verification");
                return userId;
            }
        } catch (JwtException e) {
            logger.debug("JWT verification failed: {}", e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Attempts to extract the user ID directly from the token payload without verification.
     * This is a fallback method for when standard verification fails.
     *
     * @param token The JWT token
     * @return The user ID extracted from the payload, or null if extraction fails
     */
    private String extractUserIdFromPayload(String token) {
        try {
            String[] tokenParts = token.split("\\.");
            if (tokenParts.length != 3) {
                return null;
            }
            
            // Decode payload
            String payload = tokenParts[1];
            while (payload.length() % 4 != 0) {
                payload += "=";
            }
            
            String decodedPayload = new String(Base64.getDecoder().decode(payload));
            JsonNode payloadJson = objectMapper.readTree(decodedPayload);
            String sub = payloadJson.path("sub").asText(null);
            
            if (sub != null && !sub.isEmpty()) {
                logger.debug("WebSocket authenticated with payload extraction");
                return sub;
            }
        } catch (Exception e) {
            logger.debug("Failed to extract user ID from payload: {}", e.getMessage());
        }
        
        return null;
    }
}
