package com.example.goweb_spring.services;

import com.example.goweb_spring.dto.UserSettingsDto;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.entities.UserSettingsEntity;
import com.example.goweb_spring.mapper.UserSettingsMapper;
import com.example.goweb_spring.repositories.UserRepository;
import com.example.goweb_spring.repositories.UserSettingsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserSettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;
    private final UserSettingsMapper userSettingsMapper;

    public UserSettingsService(UserSettingsRepository userSettingsRepository,
                               UserRepository userRepository,
                               UserSettingsMapper userSettingsMapper) {
        this.userSettingsRepository = userSettingsRepository;
        this.userRepository = userRepository;
        this.userSettingsMapper = userSettingsMapper;
    }

    /**
     * Retrieves the user settings as a DTO for the given user.
     * The mapper pulls core user fields (username, email) from the related UserEntity.
     *
     * @param supabaseUserId the Supabase User ID
     * @return a DTO containing the settings
     */
    @Transactional
    public UserSettingsDto getSettingsForUser(String supabaseUserId) {
        // First retrieve the user by Supabase ID
        UserEntity user = userRepository.findBySupabaseUserId(supabaseUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with Supabase ID: " + supabaseUserId));

        // Find or create user settings
        UserSettingsEntity entity = userSettingsRepository.findByUser(user)
                .orElseGet(() -> {
                    // Create default settings if not found
                    UserSettingsEntity defaultSettings = createDefaultUserSettings(user);
                    return userSettingsRepository.save(defaultSettings);
                });
                
        return userSettingsMapper.toDto(entity);
    }
    
    /**
     * Creates default user settings for a user
     * 
     * @param user the user entity
     * @return a new UserSettingsEntity with default values
     */
    private UserSettingsEntity createDefaultUserSettings(UserEntity user) {
        UserSettingsEntity settings = new UserSettingsEntity();
        settings.setUser(user);
        
        // Set default values
        settings.setAvatarUrl(user.getAvatarUrl()); // Use avatar from user if available
        settings.setBio("");
        
        // Game Preferences defaults
        settings.setBoardTheme("classic");
        settings.setStoneTheme("classic");
        settings.setSoundEffects(true);
        settings.setTimeControl("standard");
        settings.setAiAssistance(true);
        
        // Notification defaults
        settings.setEmailNotifications(true);
        settings.setSmsNotifications(false);
        settings.setInAppNotifications(true);
        
        // Matchmaking defaults
        settings.setDisplayRatings(true);
        settings.setMatchmakingFilters("");
        
        // Display defaults
        settings.setTheme("dark");
        settings.setFontSize("default");
        settings.setAccessibilityOptions("");
        settings.setLanguage("en");
        settings.setTimezone("UTC");
        
        // Privacy defaults
        settings.setTwoFactor(false);
        settings.setLoginAlerts(true);
        settings.setBlockedUsers("");
        
        // Advanced defaults
        settings.setGameHistory("");
        settings.setApiKey("");
        settings.setBetaFeatures(false);
        
        return settings;
    }

    /**
     * Updates both the core user profile (username, email) and extended user settings.
     * Extended settings are updated via the mapper's update method.
     * The update is executed within a single transaction for consistency.
     *
     * @param supabaseUserId the Supabase User ID
     * @param settings the DTO containing the new settings values
     * @throws EntityNotFoundException if the user or user settings are not found
     */
    @Transactional
    public void updateUserSettings(String supabaseUserId, UserSettingsDto settings) {
        // Update core user account fields from UserEntity
        UserEntity user = userRepository.findBySupabaseUserId(supabaseUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with Supabase ID: " + supabaseUserId));

        if (settings.getUsername() != null && !settings.getUsername().isBlank()) {
            user.setUsername(settings.getUsername().trim());
        }
        if (settings.getEmail() != null && !settings.getEmail().isBlank()) {
            user.setEmail(settings.getEmail().trim());
        }
        
        // Update last synced time
        user.setLastSyncedAt(LocalDateTime.now());
        userRepository.save(user);

        // Find or create user settings
        UserSettingsEntity userSettings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> {
                    // Create default settings if not found
                    UserSettingsEntity defaultSettings = createDefaultUserSettings(user);
                    return userSettingsRepository.save(defaultSettings);
                });

        // Update the fields from the DTO
        if (settings.getAvatarUrl() != null) {
            userSettings.setAvatarUrl(settings.getAvatarUrl());
        }
        if (settings.getBio() != null) {
            userSettings.setBio(settings.getBio());
        }
        // Game preferences
        if (settings.getBoardTheme() != null) {
            userSettings.setBoardTheme(settings.getBoardTheme());
        }
        if (settings.getStoneTheme() != null) {
            userSettings.setStoneTheme(settings.getStoneTheme());
        }
        if (settings.getSoundEffects() != null) {
            userSettings.setSoundEffects(settings.getSoundEffects());
        }
        if (settings.getTimeControl() != null) {
            userSettings.setTimeControl(settings.getTimeControl());
        }
        if (settings.getAiAssistance() != null) {
            userSettings.setAiAssistance(settings.getAiAssistance());
        }
        // Other settings can be updated similarly as needed
        
        userSettingsRepository.save(userSettings);
    }
    
    /**
     * Creates or updates user profile data from Supabase authentication info.
     * This should be called after successful authentication/registration via Supabase.
     * 
     * @param supabaseUserId the Supabase User ID
     * @param email the user's email from Supabase
     * @param avatarUrl the user's avatar URL (if available)
     * @return the created or updated UserEntity
     */
    @Transactional
    public UserEntity syncUserFromSupabase(String supabaseUserId, String email, String avatarUrl) {
        // Check if user already exists in our database
        UserEntity user = userRepository.findBySupabaseUserId(supabaseUserId)
                .orElseGet(() -> {
                    // Create a new user if not found
                    UserEntity newUser = new UserEntity();
                    newUser.setSupabaseUserId(supabaseUserId);
                    newUser.setEmail(email);
                    // Generate a default username based on email prefix
                    String defaultUsername = email.split("@")[0] + "-" + supabaseUserId.substring(0, 6);
                    newUser.setUsername(defaultUsername);
                    newUser.setSkillLevel("beginner"); // Default skill level
                    return newUser;
                });
        
        // Update fields that might have changed in Supabase
        user.setEmail(email);
        user.setAvatarUrl(avatarUrl);
        user.setLastSyncedAt(LocalDateTime.now());
        
        // Save the user
        UserEntity savedUser = userRepository.save(user);
        
        // Ensure user settings exist
        userSettingsRepository.findByUser(savedUser)
            .orElseGet(() -> {
                UserSettingsEntity defaultSettings = createDefaultUserSettings(savedUser);
                return userSettingsRepository.save(defaultSettings);
            });
        
        return savedUser;
    }
}
