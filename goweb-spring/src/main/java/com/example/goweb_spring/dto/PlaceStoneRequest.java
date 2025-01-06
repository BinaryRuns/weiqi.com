package com.example.goweb_spring.dto;

import lombok.Data;

@Data
public class PlaceStoneRequest {
    private String roomId;
    private int x;
    private int y;
    private String color; // "black" or "white"
}