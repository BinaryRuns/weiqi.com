package com.example.goweb_spring.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProviderUserInfo {
    private String email;
    private String name;
    private String providerUserId; // add this field
}
