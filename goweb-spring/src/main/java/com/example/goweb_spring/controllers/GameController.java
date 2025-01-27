package com.example.goweb_spring.controllers;

import com.example.goweb_spring.dto.ReadyMessageRequest;
import com.example.goweb_spring.model.ChatMessage;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.model.JoinRoomMessage;
import com.example.goweb_spring.model.MoveMessage;
import com.example.goweb_spring.services.GameRoomService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;


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


    /**
     * Handles Player Ready Request
     * @param messageRequest
     */
    @MessageMapping("/game.ready")
    public void handlePlayerReady(ReadyMessageRequest messageRequest) {
        String roomId = messageRequest.getRoomId();
        String userId = messageRequest.getUserId();


        // handle player ready
        gameRoomService.handlePlayerReady(roomId, userId);
    }

    /**
     * Handles messages sent to /app/chat.sendMessage/{roomId}
     * Broadcasts the message to /topic/game/{roomId}
     */
    @MessageMapping("/game.sendMessage/{roomId}")
    @SendTo("/topic/game/{roomId}/chat")
    public ChatMessage handleChatMessage(@Payload ChatMessage chatMessage,  @DestinationVariable("roomId") String roomId) {
        return chatMessage;
    }


    /**
     * Handles message sent to /app/game.move
     * Processes a stone placement move and broadcasts the updated game state
     */
    @MessageMapping("/game.move")
    public void handleMove(@Payload MoveMessage moveMessage) {
        try {
            System.out.println("Received move message: " + moveMessage);
            gameRoomService.placeStone(
                    moveMessage.getRoomId(),
                    moveMessage.getUserId(),
                    moveMessage.getX(),
                    moveMessage.getY()
            );
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    @MessageMapping("/game.resign")
    public void handleResign(@Payload JoinRoomMessage resignMessage) {
        gameRoomService.resign(resignMessage.getRoomId(), resignMessage.getUserId());
    }

}
