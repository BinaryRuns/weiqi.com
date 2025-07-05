package com.example.goweb_spring.controllers;

import com.example.goweb_spring.annotations.RequiresAuthentication;
import com.example.goweb_spring.dto.UserSettingsDto;
import com.example.goweb_spring.services.UserSettingsService;
import com.example.goweb_spring.utils.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/settings")
@RequiresAuthentication
public class UserSettingsController {

    private final UserSettingsService userSettingsService;
    private final SecurityUtils securityUtils;

    public UserSettingsController(UserSettingsService userSettingsService, SecurityUtils securityUtils) {
        this.userSettingsService = userSettingsService;
        this.securityUtils = securityUtils;
    }

    /**
     * GET /api/user/settings
     * Retrieves the composite user settings for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<UserSettingsDto> getUserSettings() {
        String userId = securityUtils.requireUserId();
        UserSettingsDto dto = userSettingsService.getSettingsForUser(userId);
        return ResponseEntity.ok(dto);
    }

    /**
     * PUT /api/user/settings
     * Updates both core user data and extended settings for the authenticated user.
     */
    @PutMapping
    public ResponseEntity<String> updateUserSettings(@RequestBody UserSettingsDto dto) {
        String userId = securityUtils.requireUserId();
        userSettingsService.updateUserSettings(userId, dto);
        return ResponseEntity.ok("User settings updated successfully.");
    }
}
