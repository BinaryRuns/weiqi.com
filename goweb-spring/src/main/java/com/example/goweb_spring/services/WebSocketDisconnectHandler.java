package com.example.goweb_spring.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketDisconnectHandler implements ApplicationListener<SessionDisconnectEvent> {

    private final GameRoomService gameRoomService;
    private final MatchMakingService matchMakingService;
    private static final Logger logger = LoggerFactory.getLogger(WebSocketDisconnectHandler.class);

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
        logger.info("WebSocket session disconnected: {}, User ID: {}", sessionId, userId);
        
        if (userId != null) {
            // Handle matchmaking queue cleanup - remove the player from any queue they might be in
            try {
                matchMakingService.removePlayerById(userId);
                logger.info("Removed player {} from matchmaking queue due to disconnect", userId);
            } catch (Exception e) {
                logger.error("Error removing player {} from matchmaking queue: {}", userId, e.getMessage());
            }
            
            // Handle game room disconnection - attempt to find any active rooms with this user
            // and call leaveRoom to clean up game state properly
            try {
                // Create a final copy of userId for use in lambda
                final String finalUserId = userId;
                // Find all game rooms with this user and have them leave
                gameRoomService.getAvailableRooms().forEach(room -> {
                    if (room.getPlayers().stream().anyMatch(player -> player.getUserId().equals(finalUserId))) {
                        try {
                            gameRoomService.leaveRoom(room.getRoomId(), finalUserId);
                            logger.info("Player {} removed from game room {} due to disconnect", finalUserId, room.getRoomId());
                        } catch (Exception e) {
                            logger.error("Error removing player {} from game room {}: {}", finalUserId, room.getRoomId(), e.getMessage());
                        }
                    }
                });
            } catch (Exception e) {
                logger.error("Error handling game room cleanup for user {}: {}", userId, e.getMessage());
            }
        }
    }
}
