package com.example.goweb_spring.model;


import com.example.goweb_spring.dto.GameRoomDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomEvent {
    private String action;
    private String userId;
    private GameRoomDTO gameRoom;
}
