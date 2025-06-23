package com.example.goweb_spring.dto;

import lombok.Data;

@Data
public class UserSettingsDto {
    // Fields for UserEntity (profile & account) - managed via Supabase auth
    private String username;     // Display name (can differ from Supabase auth name)
    private String email;        // Read-only, synced from Supabase
    private String supabaseUserId; // Read-only, the Supabase auth user ID
    
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
