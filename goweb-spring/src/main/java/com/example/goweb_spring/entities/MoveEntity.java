package com.example.goweb_spring.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "moves")
public class MoveEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long moveId;

    @ManyToOne
    @JoinColumn(name = "game_id", nullable = false)
    private GameEntity game;

    @Column(nullable = false)
    private int moveNumber;

    @Column(nullable = false, length = 1)
    private char player; // 'B' or 'W'

    @Column(nullable = false)
    private int x; // Row (0-indexed)

    @Column(nullable = false)
    private int y; // Column (0-indexed)

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters...
}
