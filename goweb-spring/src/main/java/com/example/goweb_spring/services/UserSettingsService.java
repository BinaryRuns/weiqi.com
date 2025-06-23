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
    public UserSettingsDto getSettingsForUser(String supabaseUserId) {
        // First retrieve the user by Supabase ID
        UserEntity user = userRepository.findBySupabaseUserId(supabaseUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with Supabase ID: " + supabaseUserId));

        UserSettingsEntity entity = userSettingsRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Settings not found for user: " + user.getId()));
        return userSettingsMapper.toDto(entity);
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

        // Update extended settings via the mapper
        UserSettingsEntity userSettings = userSettingsRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Settings not found for user: " + user.getId()));

        // This call will update the fields of userSettings with values from the DTO.
        // userSettingsMapper.updateEntityFromDto(settings, userSettings);

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
        
        return userRepository.save(user);
    }
}
