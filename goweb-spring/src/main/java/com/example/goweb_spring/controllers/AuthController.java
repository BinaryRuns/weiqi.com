package com.example.goweb_spring.controllers;

import com.example.goweb_spring.dto.TokenResponse;
import com.example.goweb_spring.dto.User;
import com.example.goweb_spring.utils.JwtUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        // Dummy Authentication, need to set up database later on

        if ("admin@gmail.com".equals(user.getUsername()) && "password".equals(user.getPassword())) {
            String accessToken = jwtUtil.generateToken(user.getUsername());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

            // Set Refresh Token in an HttpOnly Cookie
            ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/api/auth/refresh")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                    .body(new TokenResponse(accessToken, null));

        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Password or Username");
        }
    }


    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "refreshToken", required = false) String refreshToken) {

        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or Expired Refresh Token");
        }

        String username = jwtUtil.extractUsername(refreshToken);
        String newAccessToken = jwtUtil.generateToken(username);
        String newRefreshToken = jwtUtil.generateRefreshToken(username);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .build();


        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new TokenResponse(newAccessToken, null));
    }
}
