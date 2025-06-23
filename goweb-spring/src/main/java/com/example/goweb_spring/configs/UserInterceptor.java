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

@Component
public class UserInterceptor extends DefaultHandshakeHandler {
    private static final Logger logger = LoggerFactory.getLogger(UserInterceptor.class);
    private final Key jwtKey;

    public UserInterceptor(@Value("${supabase.jwt.secret}") String jwtSecret) {
        try {
            byte[] keyBytes;

            if (jwtSecret != null && !jwtSecret.isEmpty()) {
                // Supabase exposes the JWT secret as a Base64-encoded string. Attempt to decode first.
                try {
                    keyBytes = Base64.getDecoder().decode(jwtSecret);
                    logger.info("WebSocket: Interpreting Supabase JWT secret as Base64 ({} bytes)", keyBytes.length);
                } catch (IllegalArgumentException ex) {
                    // If it is not valid Base64, fall back to using the raw bytes
                    logger.info("WebSocket: JWT secret doesn't appear to be Base64 – using raw bytes");
                    keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
                }
            } else {
                logger.warn("WebSocket: Supabase JWT secret missing - WebSocket auth will fail");
                keyBytes = "missing_jwt_secret".getBytes(StandardCharsets.UTF_8);
            }

            this.jwtKey = Keys.hmacShaKeyFor(keyBytes);
            logger.info("Successfully initialized Supabase JWT key for WebSocket authentication");
        } catch (Exception e) {
            logger.error("Failed to initialize JWT key for WebSocket: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize JWT key for WebSocket", e);
        }
    }

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            // Get the token from query parameters (format: ?token=xxx)
            String query = request.getURI().getQuery();
            if (query == null) {
                logger.debug("WebSocket connection attempt without query parameters");
                return null;
            }
            
            String[] queryParams = query.split("&");
            String token = null;
            
            for (String param : queryParams) {
                if (param.startsWith("token=")) {
                    token = param.substring(6); // Remove "token=" prefix
                    break;
                }
            }
            
            if (token == null || token.isEmpty()) {
                logger.debug("WebSocket connection attempt without token parameter");
                return null;
            }
            
            // Parse and validate the Supabase token
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            // Extract user ID from token subject
            String userId = claims.getSubject();
            if (userId != null) {
                logger.info("WebSocket authenticated for user: {}", userId);
                return new UserPrincipal(userId);
            }
        } catch (JwtException e) {
            logger.warn("WebSocket connection with invalid token: {}", e.getMessage());
        }
        
        return null;
    }
}
