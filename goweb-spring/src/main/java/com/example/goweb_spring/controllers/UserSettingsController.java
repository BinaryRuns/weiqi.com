package com.example.goweb_spring.controllers;


import com.example.goweb_spring.dto.UserSettingsDto;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.services.UserSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user/settings")
public class UserSettingsController {

    private final UserSettingsService userSettingsService;

    public UserSettingsController(UserSettingsService userSettingsService) {
        this.userSettingsService = userSettingsService;
    }

    /**
     * GET /api/user/settings/{userId}
     * Retrieves the composite user settings for the given userId.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserSettingsDto> getUserSettings(@PathVariable UUID userId) {
        UserSettingsDto dto = userSettingsService.getSettingsForUser(userId);
        return ResponseEntity.ok(dto);
    }

    /**
     * PUT /api/user/settings/{userId}
     * Updates both core user data and extended settings for the given userId.
     */
    @PutMapping("/{userId}")
    public ResponseEntity<String> updateUserSettings(@PathVariable UUID userId,
                                                     @RequestBody UserSettingsDto dto) {
        userSettingsService.updateUserSettings(userId, dto);
        return ResponseEntity.ok("User settings updated successfully.");
    }
}
