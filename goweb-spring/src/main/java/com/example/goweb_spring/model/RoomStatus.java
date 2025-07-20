package com.example.goweb_spring.model;

public enum RoomStatus {
    WAITING,    // Room created, waiting for players
    IN_GAME,    // Game is actively being played
    FINISHED    // Game has ended
}