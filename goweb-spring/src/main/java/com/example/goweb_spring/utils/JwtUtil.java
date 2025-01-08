package com.example.goweb_spring.utils;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    // Temp way of storing secretkey
    private final String secretKey = "rEF8a6zRaGaRbgAqSncE5elZ997r24KUAJyAuDKy8Hc=";
    private final Key SECRET_KEY = Keys.hmacShaKeyFor(secretKey.getBytes());
    private final long EXPIRATION_TIME = 1000 * 60 * 15; // 15 minutes
    private final long REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 7; // 7 days


    public String generateToken(UUID userId, String username) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId)) // userId as subject
                .claim("username", username) // Additional claims
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }


    // Refresh token with existing token
    public String generateRefreshToken(UUID userId, String username, Date expirationDate) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("username", username)
                .setIssuedAt(new Date())
                .setExpiration(expirationDate)
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }


    // New refresh token
    public String generateRefreshToken(UUID userId, String username) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("username", username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public UUID extractUserId(String token) {
        try {
            // Parse the token and extract the "sub" claim as the user ID
            String userIdString = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY) // Use your secret key
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject(); // Get the "sub" (subject) claim

            // Convert the extracted user ID from String to long
            return UUID.fromString(userIdString);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid or Malformed Token", e);
        }
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public Date extractExpiration(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJwt(token)
                .getBody()
                .getExpiration();

        return expiration.before(new Date());
    }
}
