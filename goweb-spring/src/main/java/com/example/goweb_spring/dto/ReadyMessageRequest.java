package com.example.goweb_spring.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadyMessageRequest {
    private String roomId;
    private String userId;
}
