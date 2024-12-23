package com.example.goweb_spring.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for APIs
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Allow unrestricted access to all routes
                )
                .httpBasic(httpBasic -> httpBasic.disable()) // Disable HTTP Basic login
                .formLogin(formLogin -> formLogin.disable()); // Disable form-based login
        return http.build();
    }
}
