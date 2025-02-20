package com.example.goweb_spring.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_settings")
@Data
@NoArgsConstructor
public class UserSettingsEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to the main user table (each user has one settings record)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;


    // Profile & Account Settings (for additional info not in UserEntity)
    @Column(length = 512)
    private String avatarUrl;

    @Column(length = 1024)
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
    private String theme;               // e.g., "light" or "dark"
    private String fontSize;            // e.g., "default", "large", "small"
    private String accessibilityOptions;
    private String language;
    private String timezone;

    // Privacy & Security Settings
    private Boolean twoFactor;
    private Boolean loginAlerts;
    @Column(length = 1024)
    private String blockedUsers;  // could store comma-separated userIds or JSON

    // Advanced Settings
    @Column(length = 2048)
    private String gameHistory;   // Could be a JSON string or reference
    private String apiKey;
    private Boolean betaFeatures;

}
