package com.example.goweb_spring.services;

import com.example.goweb_spring.dto.webhook.supabase.SupabaseInsertPayload.UserRecord;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.entities.UserSettingsEntity;
import com.example.goweb_spring.repositories.UserRepository;
import com.example.goweb_spring.services.UserSettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Service for user-related operations.
 * This service centralizes user creation logic for both direct API calls and webhooks.
 */
@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;
    private final UserSettingsService userSettingsService;
    
    public UserService(UserRepository userRepository, @Lazy UserSettingsService userSettingsService) {
        this.userRepository = userRepository;
        this.userSettingsService = userSettingsService;
    }
    
    /**
     * Creates a user from the Supabase webhook payload, including default settings.
     * This method is transactional to ensure both user and settings are created together.
     * 
     * @param userRecord The user data from the Supabase webhook
     * @return The created UserEntity or null if creation failed
     */
    @Transactional
    public UserEntity createUserFromWebhook(UserRecord userRecord) {
        String supabaseUserId = userRecord.getId();
        String email = userRecord.getEmail();
        String baseUsername = email.split("@")[0];
        
        // Extract avatar URL from user metadata if available
        String avatarUrl = null;
        if (userRecord.getRawUserMetaData() != null && userRecord.getRawUserMetaData().containsKey("avatar_url")) {
            avatarUrl = (String) userRecord.getRawUserMetaData().get("avatar_url");
        }
        
        // Create the user using the consolidated method
        UserEntity createdUser = createUser(supabaseUserId, email, baseUsername, avatarUrl, "beginner");
        
        if (createdUser != null) {
            logger.info("User successfully created from webhook: {}", createdUser.getUsername());
        }
        
        return createdUser;
    }
    
    /**
     * Creates a user from direct API request data.
     * 
     * @param userData The user data from the API request
     * @param supabaseUserId The authenticated Supabase user ID
     * @return The created UserEntity or null if creation failed
     */
    public UserEntity createUserFromRequest(Map<String, Object> userData, String supabaseUserId) {
        String email = (String) userData.get("email");
        String username = (String) userData.get("username");
        String avatarUrl = (String) userData.get("avatarUrl");
        String skillLevel = (String) userData.getOrDefault("skillLevel", "beginner");
        
        // Validate required fields
        if (email == null || email.isEmpty()) {
            logger.error("Email is required for user creation");
            return null;
        }
        
        // Create the user using the consolidated method
        UserEntity createdUser = createUser(supabaseUserId, email, username, avatarUrl, skillLevel);
        
        if (createdUser != null) {
            logger.info("User successfully created from request: {}", createdUser.getUsername());
        }
        
        return createdUser;
    }
  
    /**
     * Core method for creating a new user with consistent logic.
     * This private method consolidates the common user creation logic used by both
     * createUserFromWebhook and createUserFromRequest.
     *
     * @param supabaseUserId The Supabase user ID
     * @param email The user's email
     * @param username The preferred username (can be null)
     * @param avatarUrl The user's avatar URL (can be null)
     * @param skillLevel The user's skill level (defaults to "beginner" if null)
     * @return The created and saved UserEntity, or null if creation failed
     */
    private UserEntity createUser(String supabaseUserId, String email, String username, 
                                 String avatarUrl, String skillLevel) {
        // Check if user already exists
        Optional<UserEntity> existingUser = userRepository.findBySupabaseUserId(supabaseUserId);
        if (existingUser.isPresent()) {
            logger.warn("User already exists with Supabase ID: {}", supabaseUserId);
            return existingUser.get();
        }
        
        // Check for email conflicts
        Optional<UserEntity> existingUserByEmail = userRepository.findByEmail(email);
        if (existingUserByEmail.isPresent()) {
            logger.warn("User with email {} already exists with different Supabase ID: {} vs {}", 
                email, existingUserByEmail.get().getSupabaseUserId(), supabaseUserId);
            return null;
        }
        
        // Generate a unique username
        String finalUsername = generateUniqueUsername(username, supabaseUserId);
        
        // Create new user entity
        UserEntity newUser = new UserEntity();
        newUser.setSupabaseUserId(supabaseUserId);
        newUser.setEmail(email);
        newUser.setUsername(finalUsername);
        newUser.setAvatarUrl(avatarUrl);
        newUser.setSkillLevel(skillLevel != null ? skillLevel : "beginner");
        
        try {
            // Save the user first
            UserEntity savedUser = userRepository.save(newUser);
            
            // Create default settings for the user
            userSettingsService.findOrCreateDefaultSettings(savedUser);
            logger.info("User successfully created: {}", savedUser.getUsername());
            return savedUser;
        } catch (Exception e) {
            logger.error("Error creating user: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Updates the core user profile fields (username, email, etc.).
     * This method should be used for updating profile data separate from settings.
     *
     * @param supabaseUserId The Supabase User ID
     * @param username The new username (can be null if not changing)
     * @param email The new email (can be null if not changing)
     * @param avatarUrl The new avatar URL (can be null if not changing)
     * @param skillLevel The new skill level (can be null if not changing)
     * @return The updated UserEntity or null if the user was not found
     */
    @Transactional
    public UserEntity updateUserProfile(String supabaseUserId, String username, String email, 
                                       String avatarUrl, String skillLevel) {
        // Find the user
        UserEntity user = userRepository.findBySupabaseUserId(supabaseUserId).orElse(null);
        if (user == null) {
            logger.warn("Cannot update user profile - user not found with Supabase ID: {}", supabaseUserId);
            return null;
        }
        
        // Update fields only if provided
        if (username != null && !username.isBlank()) {
            user.setUsername(username.trim());
        }
        
        if (email != null && !email.isBlank()) {
            user.setEmail(email.trim());
        }
        
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        
        if (skillLevel != null && !skillLevel.isBlank()) {
            user.setSkillLevel(skillLevel);
        }
        
        // Update last synced time
        user.setLastSyncedAt(LocalDateTime.now());
        
        // Save and return the updated user
        UserEntity savedUser = userRepository.save(user);
        logger.info("User profile updated: {}", savedUser.getUsername());
        return savedUser;
    }

    public String generateUniqueUsername(String baseUsername, String supabaseUserId) {
        // If no username provided, use the first part of the Supabase ID
        String username = (baseUsername == null || baseUsername.isEmpty()) ? 
                "user_" + supabaseUserId.substring(0, 8) : baseUsername;
        
        // Clean the username (remove special characters, limit length)
        username = username.replaceAll("[^a-zA-Z0-9_]", "").toLowerCase();
        if (username.length() > 20) {
            username = username.substring(0, 20);
        }
        
        // Check if the username is unique
        if (userRepository.findByUsername(username).isEmpty()) {
            return username;
        }
        
        // If not unique, append a random suffix
        int suffix = 1;
        String newUsername;
        do {
            newUsername = username + suffix;
            suffix++;
        } while (userRepository.findByUsername(newUsername).isPresent());
        
        return newUsername;
    }
}