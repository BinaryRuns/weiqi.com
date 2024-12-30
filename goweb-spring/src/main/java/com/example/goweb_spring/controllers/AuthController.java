package com.example.goweb_spring.controllers;

import com.example.goweb_spring.dto.TokenResponse;
import com.example.goweb_spring.dto.User;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.repositories.UserRepository;
import com.example.goweb_spring.services.AuthService;
import com.example.goweb_spring.utils.JwtUtil;
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
    private final UserRepository userRepository;
    private final AuthService authService;

    public AuthController(JwtUtil jwtUtil, UserRepository userRepository, AuthService authService) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.authService = authService;
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


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            UserEntity newUser = authService.registerUser(
                    user.getUsername(),
                    user.getPassword(),
                    user.getSkillLevel(),
                    user.getEmail()
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
