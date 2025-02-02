package com.example.goweb_spring.controllers;

import com.example.goweb_spring.dto.GoogleTokenRequest;
import com.example.goweb_spring.dto.TokenResponse;
import com.example.goweb_spring.dto.User;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.model.GoogleUser;
import com.example.goweb_spring.services.AuthService;
import com.example.goweb_spring.services.oauth.GoogleOAuthService;
import com.example.goweb_spring.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;

    public AuthController(JwtUtil jwtUtil,  AuthService authService, GoogleOAuthService googleOAuthService) {
        this.jwtUtil = jwtUtil;
        this.authService = authService;
        this.googleOAuthService = googleOAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            TokenResponse tokens = authService.loginUser(user.getUsername(), user.getPassword());

            // Set Refresh Token in an HttpOnly Cookie
            ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", tokens.getRefreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .path("/api/auth/refresh")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                    .body(new TokenResponse(tokens.getAccessToken(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            UserEntity newUser = authService.registerUser(
                    user.getUsername(),
                    user.getEmail(),
                    user.getPassword(),
                    user.getSkillLevel()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully: " + newUser.getUsername());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        try {
            TokenResponse tokenResponse = authService.refreshToken(refreshToken);

            // Set the new refresh token in an HTTP-only cookie
            ResponseCookie cookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .path("/api/auth/refresh")
                    .maxAge(7 * 24 * 60 * 60) // 7 days
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new TokenResponse(tokenResponse.getAccessToken(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/api/auth/refresh")
                .maxAge(0) // Remove the cookie immediately
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body("Logged out successfully");
    }


    @PostMapping("/oauth")
    public ResponseEntity<?> oauth(@RequestBody GoogleTokenRequest request, HttpServletResponse response) {
        GoogleUser googleUser = googleOAuthService.verifyToken(request.getIdToken());
        if (googleUser == null) {
            return ResponseEntity.status(401).body("Invalid Google token");
        }

        TokenResponse tokenResponse = authService.loginOrRegisterGoogleUser(googleUser, response);

        // Set the new refresh token in an HTTP-only cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new TokenResponse(tokenResponse.getAccessToken(), null));
    }
}
