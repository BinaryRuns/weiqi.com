package com.example.goweb_spring.services;

import com.example.goweb_spring.dto.UserSettingsDto;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.entities.UserSettingsEntity;
import com.example.goweb_spring.mapper.UserSettingsMapper;
import com.example.goweb_spring.repositories.UserRepository;
import com.example.goweb_spring.repositories.UserSettingsRepository;
import com.example.goweb_spring.services.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserSettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;
    private final UserSettingsMapper userSettingsMapper;
    private final UserService userService;

    public UserSettingsService(UserSettingsRepository userSettingsRepository,
                               UserRepository userRepository,
                               UserSettingsMapper userSettingsMapper,
                               @Lazy UserService userService) {
        this.userSettingsRepository = userSettingsRepository;
        this.userRepository = userRepository;
        this.userSettingsMapper = userSettingsMapper;
        this.userService = userService;
    }

    /**
     * Retrieves the user settings as a DTO for the given user.
     * The mapper pulls core user fields (username, email) from the related UserEntity.
     *
     * @param supabaseUserId the Supabase User ID
     * @return a DTO containing the settings
     * @throws EntityNotFoundException if the user is not found
     */
    public UserSettingsDto getSettingsForUser(String supabaseUserId) {
        // First retrieve the user and their settings in one go.
        UserEntity user = userRepository.findBySupabaseUserIdWithSettings(supabaseUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with Supabase ID: " + supabaseUserId));

        // Find or create settings
        UserSettingsEntity entity = user.getUserSettings();
        if (entity == null) {
            entity = findOrCreateDefaultSettings(user);
        }
                
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
     * Updates user settings.
     * Core user profile fields (username, email) are updated via UserService.
     * Extended settings are updated via the mapper's update method.
     * The update is executed within a single transaction for consistency.
     *
     * @param supabaseUserId the Supabase User ID
     * @param settings the DTO containing the new settings values
     * @throws EntityNotFoundException if the user or user settings are not found
     */
    @Transactional
    public void updateUserSettings(String supabaseUserId, UserSettingsDto settings) {
        // First, update core user profile fields using the UserService
        if (settings.getUsername() != null || settings.getEmail() != null) {
            userService.updateUserProfile(
                supabaseUserId, 
                settings.getUsername(), 
                settings.getEmail(), 
                null,  // avatarUrl not updated through this path
                null   // skillLevel not updated through this path
            );
        }
        
        // Get the user for settings update
        UserEntity user = userRepository.findBySupabaseUserId(supabaseUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with Supabase ID: " + supabaseUserId));

        // Find or create user settings
        UserSettingsEntity userSettings = findOrCreateDefaultSettings(user);

        // Use the mapper to update all fields from the DTO to the entity
        userSettingsMapper.updateEntityFromDto(settings, userSettings);
        
        userSettingsRepository.save(userSettings);
    }
    
    /**
     * Finds user settings for a given user, creating them with default values if they don't exist.
     * This method is intended to be called after a user has been created or confirmed to exist.
     *
     * @param user The user for whom to find or create settings.
     * @return The existing or newly created UserSettingsEntity.
     */
    @Transactional
    public UserSettingsEntity findOrCreateDefaultSettings(UserEntity user) {
        return userSettingsRepository.findByUser(user)
            .orElseGet(() -> {
                UserSettingsEntity defaultSettings = createDefaultUserSettings(user);
                return userSettingsRepository.save(defaultSettings);
            });
    }
}
