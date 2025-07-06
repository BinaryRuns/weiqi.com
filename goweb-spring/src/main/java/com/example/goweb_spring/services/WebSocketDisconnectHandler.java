package com.example.goweb_spring.services;

import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketDisconnectHandler implements ApplicationListener<SessionDisconnectEvent> {

    private final GameRoomService gameRoomService;
    private final MatchMakingService matchMakingService;

    public WebSocketDisconnectHandler(GameRoomService gameRoomService, MatchMakingService matchMakingService) {
        this.gameRoomService = gameRoomService;
        this.matchMakingService = matchMakingService;
    }

    @Override
    public void onApplicationEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        
        // Get the user principal (user ID) from the session
        String userId = null;
        if (accessor.getUser() != null) {
            userId = accessor.getUser().getName();
        }

        // Handle timer stop or cleanup logic here
        System.out.println("WebSocket session disconnected: " + sessionId + ", User ID: " + userId);
        
        
        // Handle matchmaking queue cleanup - remove the player from any queue they might be in
        if (userId != null) {
            matchMakingService.removePlayerById(userId);
            System.out.println("Removed player " + userId + " from matchmaking queue due to disconnect");
        }
    }
}
