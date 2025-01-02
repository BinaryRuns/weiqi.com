package com.example.goweb_spring.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefix for messages bound for @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");
        // Enable a simple in-memory broker with destination prefixes /topic and /queue
        registry.enableSimpleBroker("/topic", "/queue");
        // Set user destination prefix for user-specific messaging
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the WebSocket endpoint with SockJS fallback and allowed origins
        registry.addEndpoint("/ws/game")
                .setAllowedOriginPatterns("*") // Restrict in production
                .withSockJS();
    }
}