package com.example.goweb_spring.filters;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collections;

@Component
public class SupabaseAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(SupabaseAuthenticationFilter.class);
    private final Key jwtKey;

    public SupabaseAuthenticationFilter(@Value("${supabase.jwt.secret}") String jwtSecret) {
        try {
            // The key insight: Use Supabase JWT secret directly without decoding
            // This works because Supabase's JWT secret is already in the correct format
            this.jwtKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            logger.info("Successfully initialized Supabase JWT key");
        } catch (Exception e) {
            logger.error("Failed to initialize JWT key: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize JWT key", e);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip token validation for specific paths
        if (isPermittedPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Validate token and extract user ID (subject)
            Claims claims = parseSupabaseToken(token);
            String userId = claims.getSubject();
            
            // Create authentication object
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            
            // Set authentication in context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            logger.debug("Successfully authenticated Supabase user ID: {}", userId);
            
        } catch (JwtException e) {
            // Invalid token - do not set authentication
            logger.warn("Authentication failed: {} for path: {}", e.getMessage(), path);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
    
    private Claims parseSupabaseToken(String token) throws JwtException {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(jwtKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            throw e;
        }
    }
    
    private boolean isPermittedPath(String path) {
        return path.startsWith("/ws") || 
               path.startsWith("/api/usersettings/");
    }
} 