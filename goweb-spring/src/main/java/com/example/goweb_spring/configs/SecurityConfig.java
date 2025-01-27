package com.example.goweb_spring.configs;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.example.goweb_spring.filters.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for APIs
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // Allow public access to auth endpoints
                        .requestMatchers("/api/game/**").authenticated()
                        .requestMatchers("/ws/**").permitAll() // Allow all websocket endpoints
                        .anyRequest().permitAll() // Secure all other endpoints
                )
                .addFilterBefore(jwtAuthenticationFilter,  UsernamePasswordAuthenticationFilter.class) // Add JWT filter
                .httpBasic(httpBasic -> httpBasic.disable()) // Disable HTTP Basic login
                .formLogin(formLogin -> formLogin.disable()); // Disable form-based login

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}