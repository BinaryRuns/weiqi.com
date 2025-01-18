package com.example.goweb_spring.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "games")
public class GameEntity {

    @Id
    @GeneratedValue
    private UUID gameId;

    @Column(nullable = false)
    private UUID blackPlayerId;

    @Column(nullable = false)
    private UUID whitePlayerId;

    @Column(nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'ongoing'")
    private String status;

    @Column(columnDefinition = "VARCHAR(50)")
    private String result;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 19")
    private int boardSize;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters...
}
