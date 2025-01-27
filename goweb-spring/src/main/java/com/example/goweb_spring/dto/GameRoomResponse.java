package com.example.goweb_spring.dto;

import com.example.goweb_spring.dto.enums.TimeControl;
import com.example.goweb_spring.model.Player;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
public class GameRoomResponse {
    private String roomId;
    private String roomName;
    private int maxPlayers;
    private int currentPlayers;
    private Set<Player> players;
    private int boardSize;
    private List<List<String>> stones; // "black", "white", or null
    private int blackTime;
    private int whiteTime;
    private TimeControl timeControl;
    private String currentPlayerColor;
}