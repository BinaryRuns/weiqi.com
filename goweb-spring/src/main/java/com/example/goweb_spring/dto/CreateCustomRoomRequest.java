package com.example.goweb_spring.dto;

import com.example.goweb_spring.dto.enums.BoardSize;
import com.example.goweb_spring.dto.enums.TimeControl;
import lombok.Data;

@Data
public class CreateCustomRoomRequest {
    private String roomName;
    private BoardSize boardSize;
    private TimeControl timeControl;
    private String description;
    private String password;
    private boolean isPublic = true;
    private boolean allowSpectators = true;
    private boolean ranked = false;
}