package com.example.goweb_spring.services;

import com.example.goweb_spring.dto.TokenResponse;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.model.GoogleUser;
import com.example.goweb_spring.repositories.UserRepository;
import com.example.goweb_spring.utils.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtUtil jwtUtil;

    private static final String CLIENT_ID = "532310787557-tqb0gnir6s3l7udsc2klrf4e86kjb9t7.apps.googleusercontent.com";

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public UserEntity registerUser(String username, String email, String password, String skillLevel) {

        // check if user exist
        if(userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("User already exists");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        String hashedPassword = bCryptPasswordEncoder.encode(password);
        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);
        user.setSkillLevel(skillLevel);

        return userRepository.save(user);
    }
    

    public TokenResponse loginUser(String username, String password) {

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username"));

        // validates the password
        if(!bCryptPasswordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid password");
        }

        String accessToken = jwtUtil.generateToken(user.getUserId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId(),username);

        return new TokenResponse(accessToken, refreshToken);
    }

    public TokenResponse refreshToken(String refreshToken) {
        // Validate the refresh token
        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid or Expired Refresh Token");
        }

        // Extract user ID, username and expiration from the refresh token
        UUID userId = jwtUtil.extractUserId(refreshToken);
        String username = jwtUtil.extractUsername(refreshToken);
        Date originalExpiration = jwtUtil.extractExpiration(refreshToken);

        // Verify user exists in the database
        UserEntity user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Generate new access and refresh tokens
        String newAccessToken = jwtUtil.generateToken(user.getUserId(), user.getUsername());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getUserId(), user.getUsername(), originalExpiration);

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    public TokenResponse loginOrRegisterGoogleUser(GoogleUser googleUser, HttpServletResponse response) {
        Optional<UserEntity> optionalUser = userRepository.findByEmail(googleUser.getEmail());
        UserEntity user;
        if(optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            user = new UserEntity();
            user.setEmail(googleUser.getEmail());
            user.setUsername(googleUser.getName() != null ? googleUser.getName() : googleUser.getEmail());

            // For social login, set a dummy password
            user.setPasswordHash(UUID.randomUUID().toString());
            user.setSkillLevel("Unknown");
            user = userRepository.save(user);
        }

        String accessToken = jwtUtil.generateToken(user.getUserId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId(), user.getUsername());

        return new TokenResponse(accessToken, refreshToken);
    }
}
