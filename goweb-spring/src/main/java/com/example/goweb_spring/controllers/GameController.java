package com.example.goweb_spring.controllers;

import com.example.goweb_spring.model.ChatMessage;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.model.JoinRoomMessage;
import com.example.goweb_spring.services.GameRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;


/**
 * WebSocket Controller for handling game-related messaging.
 */

@Controller
public class GameController {


    private final GameRoomService gameRoomService;

    public GameController(GameRoomService gameRoomService) {
        this.gameRoomService = gameRoomService;
    }

    /**
     * Handles messages sent to /app/game.join
     * Allows a user to join a game room.
     */
    @MessageMapping("/game.join")
    public void joinRoom(@Payload JoinRoomMessage joinRoomMessage) {
        try {
            gameRoomService.joinRoom(joinRoomMessage.getRoomId(), joinRoomMessage.getUserId());
        } catch (Exception e) {
            // Handle exception(e.g send error message back to client)
            e.printStackTrace();
        }
    }

    @MessageMapping("/game.leave")
    public void leaveRoom(@Payload JoinRoomMessage leaveRoomMessage, @DestinationVariable("roomId") String roomId) {
        try {
             gameRoomService.leaveRoom(leaveRoomMessage.getRoomId(), leaveRoomMessage.getUserId());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Handles messages sent to /app/chat.sendMessage
     * Broadcasts the message to /topic/game/{roomId}
     */
    @MessageMapping("/game.sendMessage/{roomId}")
    @SendTo("/topic/game/{roomId}")

    public ChatMessage sendMessage(@Payload ChatMessage chatMessage,  @DestinationVariable("roomId") String roomId) {
        return chatMessage;
    }
}
