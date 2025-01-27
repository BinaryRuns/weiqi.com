package com.example.goweb_spring.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomEventResponse {
    private String action;
    private String userId;
    private GameRoomResponse gameRoom;
}
