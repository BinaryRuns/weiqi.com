package com.example.goweb_spring.services;


import com.example.goweb_spring.dto.*;
import com.example.goweb_spring.dto.enums.TimeControl;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.exceptions.RoomNotFoundException;
import com.example.goweb_spring.exceptions.UserNotFoundException;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.model.Player;
import com.example.goweb_spring.dto.RoomEventResponse;
import com.example.goweb_spring.repositories.GameRoomRepository;
import com.example.goweb_spring.repositories.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.messaging.simp.user.SimpUserRegistry;

@Service
public class GameRoomService {
    private final GameRoomRepository gameRoomRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final UserRepository userRepository;
    private final GameTimerService gameTimerService;

    public GameRoomService(
            GameRoomRepository gameRoomRepository, 
            SimpMessagingTemplate simpMessagingTemplate, 
            UserRepository userRepository, 
            SimpUserRegistry simpUserRegistry,
            GameTimerService gameTimerService) {
        this.gameRoomRepository = gameRoomRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.userRepository = userRepository;
        this.gameTimerService = gameTimerService;
    }

    /**
     * Creates the game room
     *
     * @param boardSize
     * @param timeControl
     * @param playerIds
     * @return
     */
    public GameRoom createGameSession(int boardSize, TimeControl timeControl, List<String> playerIds) {
        GameRoom gameRoom = new GameRoom("New Game", 2, boardSize, timeControl);

        // Persist the new game room before joining players
        // This ensures joinRoom can find the room
        gameRoomRepository.save(gameRoom);

        for (String playerId : playerIds) {
            // Reuse joinRoom logic, but you may need to adapt it
            // since joinRoom takes roomId and userId.
            joinRoom(gameRoom.getRoomId(), playerId);
        }

        return gameRoom;
    }

    /**
     * Retrieves all available game rooms that are not full.
     *
     * @return Iterable of available GameRooms.
     */
    public Iterable<GameRoom> getAvailableRooms() {
        return gameRoomRepository.findAll();
    }


    /**
     * Controller Endpoint to handle Player Ready Request
     * @param roomId
     * @param userId
     */
    public void handlePlayerReady(String roomId, String userId) {
        GameRoom gameRoom = gameRoomRepository.findById(roomId).
                orElseThrow(() -> new RoomNotFoundException(roomId));

        // Mark player as ready
        gameRoom.markPlayerReady(userId);
        gameRoomRepository.save(gameRoom);

        if (gameRoom.allPlayersReady()) {
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                    new RoomEventResponse("INITIAL_STATE", "system", convertToDTO(gameRoom))
            );
        }
    }


    /**
     * Allows a user to join a game room.
     *
     * @param roomId The ID of the room to join.
     * @param userId The ID of the user joining.
     * @throws RuntimeException if the room is full or does not exist.
     */
    public void joinRoom(String roomId, String userId) {

        GameRoom gameRoom = gameRoomRepository.findById(roomId).orElse(null);

        if (gameRoom == null) {
            System.out.println("Room not found");
            // Notify the user via WebSocket about the error
            sendErrorToUser(userId, "ROOM_NOT_FOUND", "Room with ID " + roomId + " does not exist.");
            return;
        }

        // Check if the user is already in the room
        if (gameRoom.getPlayers().stream().anyMatch(p -> p.getUserId().equals(userId))) {
            System.out.println("User is already in the room");
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                    new RoomEventResponse("INITIAL_STATE", userId, convertToDTO(gameRoom)));
            return;
        }

        if (gameRoom.isFull()) {
            throw new IllegalStateException("Room is full");
        }

        // Get user
        try {
            System.out.println("Looking up user with Supabase ID: " + userId);
            UserEntity user = userRepository.findBySupabaseUserId(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
            
            System.out.println("Found user: " + user.getUsername() + " with email: " + user.getEmail());
            
            // add to redis and save
            gameRoom.addPlayer(userId, user.getUsername());
            gameRoomRepository.save(gameRoom);
            System.out.println("Successfully added user " + user.getUsername() + " to room " + roomId);
        } catch (UserNotFoundException e) {
            System.err.println("ERROR: " + e.getMessage());
            System.err.println("This likely means the user has authenticated with Supabase but doesn't exist in the backend database");
            System.err.println("Make sure user sync is working properly and users are created in the database");
            sendErrorToUser(userId, "USER_NOT_FOUND", e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error adding user to game room: " + e.getMessage());
            e.printStackTrace();
            sendErrorToUser(userId, "UNEXPECTED_ERROR", "An error occurred while joining the room");
        }
    }

    /**
     * Allows a user to leave a game room.
     *
     * @param roomId The ID of the room to leave.
     * @param userId The ID of the user leaving.
     * @throws RuntimeException if the room does not exist.
     */
    public void leaveRoom(String roomId, String userId) {
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room does not exist"));

        System.out.println("Leaving GameRoom: -----------------------------------------------");

        gameRoom.removePlayer(userId);
        gameRoomRepository.save(gameRoom);

        if (gameRoom.getPlayers().isEmpty()) {
            gameRoomRepository.delete(gameRoom);
            System.out.println("GameRoom " + roomId + " deleted as no players remain.");
        } else {
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                    new RoomEventResponse("LEAVE", userId, convertToDTO(gameRoom)));
        }
    }

    public void resign(String roomId, String userId) {
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room does not exist"));

        Player resigningPlayer = gameRoom.getPlayers().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        String winnerColor = resigningPlayer.getColor().equals("black") ? "white" : "black";

        // Notify clients about the resignation and the winner
        simpMessagingTemplate.convertAndSend(
                "/topic/game/" + roomId + "/resign",
                new ResignResponse(resigningPlayer.getUserName(), winnerColor)
        );

        // Clean up the room
        gameRoomRepository.delete(gameRoom);

        System.out.println("User " + resigningPlayer.getUserName() + " resigned. Game ended.");
    }

    /**
     * Gets details for room by id
     *
     * @param roomId
     * @return
     * @throws Exception
     */
    public GameRoom getRoomById(String roomId) throws Exception {
        return gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Game room not found"));
    }

    private void sendSoundNotification(String roomId, String color) {
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId + "/sound",
                new GameSoundResponse(color, "PLAY_SOUND"));
    }

    public void placeStone(String roomId, String userId, int x, int y) {
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room does not exist"));

        // Add check for minimum required players
        if (gameRoom.getCurrentPlayers() < gameRoom.getMaxPlayers()) {
            throw new IllegalStateException("Cannot place stones until all players have joined.");
        }

        Player player = gameRoom.getPlayers().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new UserNotFoundException("Player not found in game"));

        // Check if it's the player's turn
        if (!gameRoom.getCurrentPlayerColor().equalsIgnoreCase(player.getColor())) {
            throw new IllegalStateException("It's not your turn.");
        }

        // Update timers before processing the move
        gameRoom.updateTimers();
        
        // Apply time increment if using Fischer
        if (gameRoom.getTimeControl().getIncrement() > 0) {
            gameRoom.applyTimeIncrement();
        }

        List<List<Integer>> updatedStones = GoGameLogic.placeMove(
                gameRoom.getStones(), x, y, player.getColor()
        );

        gameRoom.setStones(updatedStones); // Place move

        // Send sound notification before changing the turn
        sendSoundNotification(roomId, player.getColor());

        // Switch current player (also updates timestamps)
        gameRoom.switchPlayer();
        
        // Save changes
        gameRoomRepository.save(gameRoom); 

        // Send immediate timer update
        gameTimerService.sendImmediateTimerUpdate(roomId);

        // Broadcast the updated game state to all clients
        GameRoomResponse gameRoomDTO = convertToDTO(gameRoom);
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                new RoomEventResponse("UPDATE_BOARD", userId, gameRoomDTO)); 
    }

    /**
     * Save a game room to the repository
     */
    public void saveRoom(GameRoom gameRoom) {
        gameRoomRepository.save(gameRoom);
    }

    private void sendErrorToUser(String userId, String errorCode, String errorMessage) {
        System.out.println("Sending error to user: " + userId + " | Message: " + errorMessage);

        simpMessagingTemplate.convertAndSendToUser(
                userId,
                "/queue/errors",
                new ErrorMessage(errorCode, errorMessage)
        );
    }


    /**
     * Converts a GameRoom entity to a GameRoomDTO for frontend consumption.
     *
     * @param gameRoom The GameRoom entity.
     * @return The GameRoomDTO.
     */
    private GameRoomResponse convertToDTO(GameRoom gameRoom) {

        List<List<String>> boardForFrontEnd = new ArrayList<>();
        for (List<Integer> row : gameRoom.getStones()) {
            List<String> strRow = new ArrayList<>();
            for (Integer cell : row) {
                if (cell == 1) {
                    strRow.add("black");
                } else if (cell == 2) {
                    strRow.add("white");
                } else {
                    strRow.add(null);
                }
            }
            boardForFrontEnd.add(strRow);
        }

        return new GameRoomResponse(
                gameRoom.getRoomId(),
                gameRoom.getRoomName(),
                gameRoom.getMaxPlayers(),
                gameRoom.getCurrentPlayers(),
                gameRoom.getPlayers(),
                gameRoom.getBoardSize(),
                boardForFrontEnd,
                gameRoom.getBlackTime(),
                gameRoom.getWhiteTime(),
                gameRoom.getTimeControl(),
                gameRoom.getCurrentPlayerColor()
        );
    }
}