package com.example.goweb_spring.services;

import com.example.goweb_spring.dto.UserSettingsDto;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.entities.UserSettingsEntity;
import com.example.goweb_spring.mapper.UserSettingsMapper;
import com.example.goweb_spring.repositories.UserRepository;
import com.example.goweb_spring.repositories.UserSettingsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserSettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserSettingsMapper userSettingsMapper;

    public UserSettingsService(UserSettingsRepository userSettingsRepository,
                               UserRepository userRepository,
                               BCryptPasswordEncoder passwordEncoder,
                               UserSettingsMapper userSettingsMapper) {
        this.userSettingsRepository = userSettingsRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userSettingsMapper = userSettingsMapper;
    }

    /**
     * Retrieves the user settings as a DTO for the given user.
     * The mapper pulls core user fields (username, email) from the related UserEntity.
     *
     * @param user the UserEntity
     * @return a DTO containing the settings
     */
    public UserSettingsDto getSettingsForUser(UUID userId) {

        // First retrieve the user by UUID.
        UserEntity user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        UserSettingsEntity entity = userSettingsRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Settings not found for user: " + user.getId()));
        return userSettingsMapper.toDto(entity);
    }

    /**
     * Updates both the core user profile (username, email, password) and extended user settings.
     * Extended settings are updated via the mapper's update method.
     * The update is executed within a single transaction for consistency.
     *
     * @param userId   the UUID of the user
     * @param settings the DTO containing the new settings values
     * @throws EntityNotFoundException if the user or user settings are not found
     */
    @Transactional
    public void updateUserSettings(UUID userId, UserSettingsDto settings) {

        // Update core user account fields from UserEntity
        UserEntity user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        if (settings.getUsername() != null && !settings.getUsername().isBlank()) {
            user.setUsername(settings.getUsername().trim());
        }
        if (settings.getEmail() != null && !settings.getEmail().isBlank()) {
            user.setEmail(settings.getEmail().trim());
        }
        if (settings.getPassword() != null && !settings.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(settings.getPassword()));
        }
        userRepository.save(user);

        // Update extended settings via the mapper
        UserSettingsEntity userSettings = userSettingsRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Settings not found for user: " + user.getId()));

        // This call will update the fields of userSettings with values from the DTO.
//        userSettingsMapper.updateEntityFromDto(settings, userSettings);

        userSettingsRepository.save(userSettings);
    }
}
