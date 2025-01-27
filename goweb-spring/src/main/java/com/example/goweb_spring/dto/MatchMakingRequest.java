package com.example.goweb_spring.dto;


import com.example.goweb_spring.dto.enums.BoardSize;
import com.example.goweb_spring.dto.enums.TimeControl;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor

public class MatchMakingRequest {
    private final String userId;
    private final int rating;
    private final BoardSize boardSize;
    private final TimeControl timeControl;
}
