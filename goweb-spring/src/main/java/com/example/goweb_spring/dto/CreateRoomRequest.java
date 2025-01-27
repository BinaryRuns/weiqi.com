package com.example.goweb_spring.dto;


import com.example.goweb_spring.dto.enums.TimeControl;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {
    private String roomName;
    private int maxPlayers;
    private int boardSize;
    private TimeControl timeControl;
}

