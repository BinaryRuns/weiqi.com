package com.example.goweb_spring.dto;


import lombok.Data;

@Data
public class UserSettingsDto {
    // Fields for UserEntity (profile & account)
    private String username;
    private String email;
    private String password; // plain text; to be hashed
    // Optionally include other profile-specific fields here

    // Fields for UserSettingsEntity (other settings)
    private String avatarUrl;
    private String bio;

    // Game Preferences
    private String boardTheme;
    private String stoneTheme;
    private Boolean soundEffects;
    private String timeControl;
    private Boolean aiAssistance;

    // Notification Settings
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean inAppNotifications;

    // Matchmaking Settings
    private Boolean displayRatings;
    private String matchmakingFilters;

    // Display & Accessibility Settings
    private String theme;       // "light" or "dark"
    private String fontSize;
    private String accessibilityOptions;
    private String language;
    private String timezone;

    // Privacy & Security Settings
    private Boolean twoFactor;
    private Boolean loginAlerts;
    private String blockedUsers;

    // Advanced Settings
    private String gameHistory;
    private String apiKey;
    private Boolean betaFeatures;
}
