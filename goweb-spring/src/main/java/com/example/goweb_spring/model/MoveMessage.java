package com.example.goweb_spring.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MoveMessage {
    private String roomId;
    private String userId;
    private int x;
    private int y;
}
