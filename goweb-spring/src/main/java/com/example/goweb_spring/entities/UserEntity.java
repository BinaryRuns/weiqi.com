package com.example.goweb_spring.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    // Supabase user ID (changed from UUID to String to match Supabase's format)
    @Column(nullable = false, unique = true, updatable = false, length = 36)
    private String supabaseUserId;

    // Username can be set separately from Supabase's auth info
    @Column(nullable = false, unique = true)
    private String username;

    // Email from Supabase auth
    @Column(nullable = false, unique = true)
    private String email;

    // User profile/avatar URL (often provided by auth providers)
    @Column(nullable = true)
    private String avatarUrl;

    // Record creation timestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // User's self-reported skill level for matchmaking
    @Column(nullable = false)
    private String skillLevel;

    // Last time the user data was synced with Supabase
    @Column(nullable = false)
    private LocalDateTime lastSyncedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.lastSyncedAt = now;
    }
}
