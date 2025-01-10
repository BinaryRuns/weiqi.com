package com.example.goweb_spring.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MatchMakingRequest {
    private final String userId;
    private final int boardSize;
    private final TimeControl timeControl;
}
