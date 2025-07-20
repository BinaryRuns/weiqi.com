package com.example.goweb_spring.dto;

import com.example.goweb_spring.dto.enums.TimeControl;
import com.example.goweb_spring.model.Player;
import com.example.goweb_spring.model.RoomStatus;
import lombok.Data;

import java.time.Instant;
import java.util.Set;

@Data
public class RoomListResponse {
    private String roomId;
    private String roomName;
    private int boardSize;
    private TimeControl timeControl;
    private RoomStatus status;
    private int currentPlayers;
    private int maxPlayers;
    private int spectatorCount;
    private boolean allowSpectators;
    private String creatorId;
    private String description;
    private boolean isPublic;
    private boolean ranked;
    private Instant createdAt;
    private Instant startedAt;
    private Set<Player> players;
    private String currentPlayerColor;
    
    public RoomListResponse(String roomId, String roomName, int boardSize, TimeControl timeControl,
                           RoomStatus status, int currentPlayers, int maxPlayers, int spectatorCount,
                           boolean allowSpectators, String creatorId, String description, boolean isPublic,
                           boolean ranked, Instant createdAt, Instant startedAt, Set<Player> players,
                           String currentPlayerColor) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.boardSize = boardSize;
        this.timeControl = timeControl;
        this.status = status;
        this.currentPlayers = currentPlayers;
        this.maxPlayers = maxPlayers;
        this.spectatorCount = spectatorCount;
        this.allowSpectators = allowSpectators;
        this.creatorId = creatorId;
        this.description = description;
        this.isPublic = isPublic;
        this.ranked = ranked;
        this.createdAt = createdAt;
        this.startedAt = startedAt;
        this.players = players;
        this.currentPlayerColor = currentPlayerColor;
    }
}