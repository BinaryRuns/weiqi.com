package com.example.goweb_spring.services;

import com.example.goweb_spring.dto.TokenResponse;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.entities.UserOAuthEntity;
import com.example.goweb_spring.model.ProviderUserInfo;
import com.example.goweb_spring.repositories.UserOAuthRepository;
import com.example.goweb_spring.repositories.UserRepository;
import com.example.goweb_spring.utils.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.github.javafaker.Faker;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtUtil jwtUtil;
    private final UserOAuthRepository userOAuthRepository;



    public AuthService(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder, JwtUtil jwtUtil, UserOAuthRepository userOAuthRepository) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jwtUtil = jwtUtil;
        this.userOAuthRepository = userOAuthRepository;
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

    /**
     * Logs in or registers a user via OAuth.
     * It merges accounts based on the verified email.
     *
     * @param userInfo       The user info returned by the OAuth provider.
     * @param provider       The provider name (e.g., "google", "github").
     * @param providerUserId The unique ID provided by the OAuth provider.
     * @return A TokenResponse containing the generated tokens.
     */
    public TokenResponse loginOrRegisterOAuthUser(ProviderUserInfo userInfo, String provider, String providerUserId) {
        // Normalize the email
        String normalizedEmail = userInfo.getEmail().trim().toLowerCase();

        // 1. Check if there is an existing link for this provider and providerUserId.
        Optional<UserOAuthEntity> optionalLink = userOAuthRepository.findByProviderAndProviderUserId(provider, providerUserId);
        UserEntity user;

        if (optionalLink.isPresent()) {
            // The user has already linked with this provider.
            user = optionalLink.get().getUser();
        } else {
            // 2. No linking record: find or create user by email.
            user = findOrCreateUserByEmail(normalizedEmail, userInfo);
            // 3. Create and save a linking record.
            createUserOAuthLink(user, provider, providerUserId);
        }

        // 4. Generate tokens for the user.
        String accessToken = jwtUtil.generateToken(user.getUserId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId(), user.getUsername());
        return new TokenResponse(accessToken, refreshToken);
    }

    /**
     * Finds an existing user by normalized email or creates a new one.
     */
    private UserEntity findOrCreateUserByEmail(String normalizedEmail, ProviderUserInfo userInfo) {
        Optional<UserEntity> optionalUser = userRepository.findByEmail(normalizedEmail);
        if (optionalUser.isPresent()) {
            return optionalUser.get();
        } else {
            UserEntity user = new UserEntity();
            user.setEmail(normalizedEmail);
            user.setUsername(generateUniqueUsername());
            // Set a dummy password for OAuth users.
            user.setPasswordHash(UUID.randomUUID().toString());
            user.setSkillLevel("Unknown");
            return userRepository.save(user);
        }
    }

    /**
     * Generates a unique username using Java Faker.
     */
    private String generateUniqueUsername() {
        Faker faker = new Faker(new Locale("en", "US"));
        String username;
        int maxAttempts = 10; // Maximum number of attempts before fallback
        int attempt = 0;

        do {
            String word1 = faker.hipster().word().replaceAll("\\s+", "");
            String word2 = faker.hipster().word().replaceAll("\\s+", "");
            int number = faker.number().numberBetween(0, 10000);
            // Combine the words with hyphens and convert to lower case (optional)
            username = String.format("%s-%s-%d", word1, word2, number).toLowerCase();
            attempt++;
        } while (userRepository.findByUsername(username).isPresent() && attempt < maxAttempts);

        // Fallback: if still not unique after maxAttempts, generate a UUID-based username.
        if (userRepository.findByUsername(username).isPresent()) {
            username = "user-" + UUID.randomUUID().toString().substring(0, 8);
        }

        return username;
    }

    /**
     * Creates and saves a linking record for the given user, provider, and provider user ID.
     */
    private void createUserOAuthLink(UserEntity user, String provider, String providerUserId) {
        UserOAuthEntity link = new UserOAuthEntity();
        link.setProvider(provider);
        link.setProviderUserId(providerUserId);
        link.setUser(user);
        userOAuthRepository.save(link);
    }
}
