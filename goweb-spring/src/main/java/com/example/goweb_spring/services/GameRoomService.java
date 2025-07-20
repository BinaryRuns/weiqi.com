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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import com.example.goweb_spring.model.RoomStatus;
import com.example.goweb_spring.services.GoGameLogic;
import java.time.Duration;
import com.example.goweb_spring.services.GameTimerManager;

@Service
public class GameRoomService {
    private static final Logger logger = LoggerFactory.getLogger(GameRoomService.class);
    
    private final GameRoomRepository gameRoomRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final UserRepository userRepository;
    private final GameTimerManager gameTimerManager;

    public GameRoomService(
            GameRoomRepository gameRoomRepository, 
            SimpMessagingTemplate simpMessagingTemplate, 
            UserRepository userRepository, 
            SimpUserRegistry simpUserRegistry,
            GameTimerManager gameTimerManager) {
        this.gameRoomRepository = gameRoomRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.userRepository = userRepository;
        this.gameTimerManager = gameTimerManager;
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

        // Cancel any active timer
        gameTimerManager.cancelTimeout(roomId);

        // Mark game as over before deletion
        gameRoom.finishGame(winnerColor);
        gameRoomRepository.save(gameRoom);

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
        try {
            GameRoom gameRoom = gameRoomRepository.findById(roomId)
                    .orElseThrow(() -> new RoomNotFoundException("Room does not exist"));

            // Add check for minimum required players
            if (gameRoom.getCurrentPlayers() < gameRoom.getMaxPlayers()) {
                throw new IllegalStateException("Cannot place stones until all players have joined.");
            }

            // Check if the user is a spectator - spectators can't place stones
            if (gameRoom.hasSpectator(userId)) {
                throw new IllegalStateException("Spectators cannot place stones.");
            }

            Player player = gameRoom.getPlayers().stream()
                    .filter(p -> p.getUserId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new UserNotFoundException("Player not found in game"));

            // Check if it's the player's turn
            if (!gameRoom.getCurrentPlayerColor().equalsIgnoreCase(player.getColor())) {
                throw new IllegalStateException("It's not your turn.");
            }

            // If this is the first move (status is WAITING), start the game
            if (gameRoom.getStatus() == RoomStatus.WAITING) {
                logger.info("First move played in room {}. Starting game and clock.", roomId);
                gameRoom.startGame();
                // Send game started notification
                simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                        new RoomEventResponse("GAME_STARTED", "system", convertToDTO(gameRoom)));
                
                // Schedule the initial timeout for the first player (black)
                gameTimerManager.scheduleTimeout(roomId, gameRoom);
            } else {
                // Cancel any existing timeout for the current player
                gameTimerManager.cancelTimeout(roomId);
            }
            
            // Place the stone using Go game logic
            List<List<Integer>> updatedStones = GoGameLogic.placeMove(
                    gameRoom.getStones(), x, y, player.getColor()
            );

            gameRoom.setStones(updatedStones); // Place move
            gameRoom.setMoveCount(gameRoom.getMoveCount() + 1); // Increment move counter

            // Send sound notification before changing the turn
            sendSoundNotification(roomId, player.getColor());

            // Log player times before switch
            logger.info("BEFORE SWITCH - Room: {}, Black time: {}, White time: {}, Current player: {}", 
                roomId, gameRoom.getBlackTime(), gameRoom.getWhiteTime(), gameRoom.getCurrentPlayerColor());

            // Switch current player (also updates timestamps and applies time increment)
            boolean timeoutOccurred = gameRoom.switchPlayer();
            
            // Log player times after switch
            logger.info("AFTER SWITCH - Room: {}, Black time: {}, White time: {}, Current player: {}", 
                roomId, gameRoom.getBlackTime(), gameRoom.getWhiteTime(), gameRoom.getCurrentPlayerColor());
            
            // Handle timeout if it occurred
            if (timeoutOccurred) {
                String timeoutWinner = gameRoom.getTimeoutWinner();
                gameRoom.endGame(timeoutWinner, "timeout");
                gameRoomRepository.save(gameRoom);
                
                // Send timeout notification
                simpMessagingTemplate.convertAndSend(
                        "/topic/game/" + roomId + "/timeout",
                        Map.of("winner", timeoutWinner)
                );
                
                // Send final game state
                GameRoomResponse gameRoomDTO = convertToDTO(gameRoom);
                simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                        new RoomEventResponse("GAME_OVER", "system", gameRoomDTO));
                
                return; // Exit early, the game is over
            }
            
            // Save changes
            gameRoomRepository.save(gameRoom);
            
            // Schedule timeout for the next player
            gameTimerManager.scheduleTimeout(roomId, gameRoom);

            // Broadcast the updated game state to all clients
            // This single message contains the new board state, updated timers, and current player
            GameRoomResponse gameRoomDTO = convertToDTO(gameRoom);
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                    new RoomEventResponse("UPDATE_BOARD", userId, gameRoomDTO)); 
        } catch (IllegalStateException | IllegalArgumentException e) {
            logger.warn("Illegal move: {}", e.getMessage());
            // ILLEGAL_MOVE covers: occupied, suicide, ko, not your turn, room not full, …
            sendErrorToUser(userId, "ILLEGAL_MOVE", e.getMessage());
        }
        // — user / room look-ups —
        catch (UserNotFoundException e)  { sendErrorToUser(userId,"USER_NOT_FOUND", e.getMessage()); }
        catch (RoomNotFoundException e)  { sendErrorToUser(userId,"ROOM_NOT_FOUND", e.getMessage()); }
        // — everything else —
        catch (Exception e) {
            logger.error("Error processing move: ", e);
            sendErrorToUser(userId,"UNEXPECTED_ERROR",
                            "Something went wrong while processing your move.");
        }
    }

    /**
     * Handles a player passing their turn
     * If both players pass consecutively, the game ends
     */
    public void passTurn(String roomId, String userId) {
        try {
            GameRoom gameRoom = gameRoomRepository.findById(roomId)
                    .orElseThrow(() -> new RoomNotFoundException("Room does not exist"));

            // Check if the user is a spectator - spectators can't pass
            if (gameRoom.hasSpectator(userId)) {
                throw new IllegalStateException("Spectators cannot pass.");
            }

            Player player = gameRoom.getPlayers().stream()
                    .filter(p -> p.getUserId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new UserNotFoundException("Player not found in game"));

            // Check if it's the player's turn
            if (!gameRoom.getCurrentPlayerColor().equalsIgnoreCase(player.getColor())) {
                throw new IllegalStateException("It's not your turn.");
            }
            
            // Cancel the current player's timer
            gameTimerManager.cancelTimeout(roomId);
            
            // Increment consecutive passes counter
            gameRoom.setConsecutivePasses(gameRoom.getConsecutivePasses() + 1);
            
            // Check if both players have passed consecutively
            if (gameRoom.getConsecutivePasses() >= 2) {
                // End the game with no winner (draw)
                gameRoom.endGame(null, "two_passes");
                gameRoomRepository.save(gameRoom);
                
                // Send game over notification
                GameRoomResponse gameRoomDTO = convertToDTO(gameRoom);
                simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                        new RoomEventResponse("GAME_OVER", "system", gameRoomDTO));
                
                // Send specific pass notification
                simpMessagingTemplate.convertAndSend("/topic/game/" + roomId + "/pass",
                        Map.of("result", "two_passes", "player", player.getUserName()));
                
                return; // Exit early, the game is over
            }
            
            // If not game over, switch player
            boolean timeoutOccurred = gameRoom.switchPlayer();
            
            // Handle timeout if it occurred
            if (timeoutOccurred) {
                String timeoutWinner = gameRoom.getTimeoutWinner();
                gameRoom.endGame(timeoutWinner, "timeout");
                gameRoomRepository.save(gameRoom);
                
                // Send timeout notification
                simpMessagingTemplate.convertAndSend(
                        "/topic/game/" + roomId + "/timeout",
                        Map.of("winner", timeoutWinner)
                );
                
                // Send final game state
                GameRoomResponse gameRoomDTO = convertToDTO(gameRoom);
                simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                        new RoomEventResponse("GAME_OVER", "system", gameRoomDTO));
                
                return; // Exit early, the game is over
            }
            
            // Save changes
            gameRoomRepository.save(gameRoom);
            
            // Schedule timeout for the next player
            gameTimerManager.scheduleTimeout(roomId, gameRoom);
            
            // Send pass notification
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId + "/pass",
                    Map.of("player", player.getUserName(), "color", player.getColor()));
            
            // Broadcast the updated game state to all clients
            GameRoomResponse gameRoomDTO = convertToDTO(gameRoom);
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                    new RoomEventResponse("UPDATE_BOARD", userId, gameRoomDTO));
            
        } catch (IllegalStateException | IllegalArgumentException e) {
            logger.warn("Illegal pass: {}", e.getMessage());
            sendErrorToUser(userId, "ILLEGAL_MOVE", e.getMessage());
        } catch (UserNotFoundException | RoomNotFoundException e) {
            sendErrorToUser(userId, "NOT_FOUND", e.getMessage());
        } catch (Exception e) {
            logger.error("Error processing pass: ", e);
            sendErrorToUser(userId, "UNEXPECTED_ERROR", "Something went wrong while processing your pass.");
        }
    }
    
    /**
     * Handles a player offering a draw
     * For simplicity, this implementation immediately ends the game as a draw
     * A more complex implementation could handle draw offers and acceptances
     */
    public void offerDraw(String roomId, String userId) {
        try {
            GameRoom gameRoom = gameRoomRepository.findById(roomId)
                    .orElseThrow(() -> new RoomNotFoundException("Room does not exist"));
            
            // Check if the user is a player in the game
            Player player = gameRoom.getPlayers().stream()
                    .filter(p -> p.getUserId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new UserNotFoundException("Player not found in game"));
            
            // Cancel any active timer
            gameTimerManager.cancelTimeout(roomId);
            
            // End the game as a draw
            gameRoom.endGame(null, "agreement");
            gameRoomRepository.save(gameRoom);
            
            // Send draw notification
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId + "/draw",
                    Map.of("player", player.getUserName(), "result", "accepted"));
            
            // Send game over notification
            GameRoomResponse gameRoomDTO = convertToDTO(gameRoom);
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                    new RoomEventResponse("GAME_OVER", "system", gameRoomDTO));
            
        } catch (UserNotFoundException | RoomNotFoundException e) {
            sendErrorToUser(userId, "NOT_FOUND", e.getMessage());
        } catch (Exception e) {
            logger.error("Error processing draw offer: ", e);
            sendErrorToUser(userId, "UNEXPECTED_ERROR", "Something went wrong while processing your draw offer.");
        }
    }

    /**
     * Save a game room to the repository
     */
    public void saveRoom(GameRoom gameRoom) {
        gameRoomRepository.save(gameRoom);
    }

    /**
     * Creates a custom game room with extended options
     */
    public GameRoom createCustomRoom(String roomName, int boardSize, TimeControl timeControl, 
                                   String creatorId, boolean isPublic, String description, 
                                   String password, boolean allowSpectators) {
        GameRoom gameRoom = new GameRoom(roomName, 2, boardSize, timeControl, creatorId, isPublic);
        gameRoom.setDescription(description);
        gameRoom.setPassword(password);
        gameRoom.setAllowSpectators(allowSpectators);
        gameRoom.setRanked(false); // Custom games are typically unranked
        
        gameRoomRepository.save(gameRoom);
        return gameRoom;
    }

    /**
     * Gets active rooms for listing, filtered by criteria
     */
    public List<GameRoom> getActiveRooms(Boolean isPublic, String status, Integer boardSize) {
        Iterable<GameRoom> allRooms = gameRoomRepository.findAll();
        List<GameRoom> filteredRooms = new ArrayList<>();
        
        for (GameRoom room : allRooms) {
            boolean matches = true;
            
            if (isPublic != null && room.isPublic() != isPublic) {
                matches = false;
            }
            
            if (status != null && !room.getStatus().toString().equalsIgnoreCase(status)) {
                matches = false;
            }
            
            if (boardSize != null && room.getBoardSize() != boardSize) {
                matches = false;
            }
            
            if (matches) {
                filteredRooms.add(room);
            }
        }
        
        return filteredRooms;
    }

    /**
     * Gets rooms suitable for spectating (in progress games)
     */
    public List<GameRoom> getSpectatableRooms() {
        return getActiveRooms(true, "IN_GAME", null);
    }

    /**
     * Gets waiting rooms that can be joined
     */
    public List<GameRoom> getJoinableRooms() {
        return getActiveRooms(true, "WAITING", null);
    }

    /**
     * Adds a spectator to a room
     */
    public boolean addSpectator(String roomId, String userId) {
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));
        
        if (!gameRoom.canJoinAsSpectator()) {
            return false;
        }
        
        boolean added = gameRoom.addSpectator(userId);
        if (added) {
            gameRoomRepository.save(gameRoom);
            
            // Notify existing players and spectators
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId + "/spectator",
                    new RoomEventResponse("SPECTATOR_JOINED", userId, null));
        }
        
        return added;
    }

    /**
     * Removes a spectator from a room
     */
    public void removeSpectator(String roomId, String userId) {
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));
        
        gameRoom.removeSpectator(userId);
        gameRoomRepository.save(gameRoom);
        
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId + "/spectator",
                new RoomEventResponse("SPECTATOR_LEFT", userId, null));
    }

    /**
     * Starts a game when all players are ready
     */
    public void startGame(String roomId) {
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));
        
        if (gameRoom.getCurrentPlayers() < gameRoom.getMaxPlayers()) {
            throw new IllegalStateException("Not enough players to start the game");
        }
        
        gameRoom.startGame();
        gameRoomRepository.save(gameRoom);
        
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                new RoomEventResponse("GAME_STARTED", "system", convertToDTO(gameRoom)));
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
                gameRoom.getCurrentPlayerColor(),
                gameRoom.getStatus()
        );
    }

    public RoomListResponse convertToRoomListDTO(GameRoom gameRoom) {
        return new RoomListResponse(
                gameRoom.getRoomId(),
                gameRoom.getRoomName(),
                gameRoom.getBoardSize(),
                gameRoom.getTimeControl(),
                gameRoom.getStatus(),
                gameRoom.getCurrentPlayers(),
                gameRoom.getMaxPlayers(),
                gameRoom.getSpectatorCount(),
                gameRoom.isAllowSpectators(),
                gameRoom.getCreatorId(),
                gameRoom.getDescription(),
                gameRoom.isPublic(),
                gameRoom.isRanked(),
                gameRoom.getCreatedAt(),
                gameRoom.getStartedAt(),
                gameRoom.getPlayers(),
                gameRoom.getCurrentPlayerColor()
        );
    }

    /**
     * Handles game ending
     */
    public void endGame(String roomId, String winner, String reason) {
        try {
            GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));
            
            // Cancel any active timer
            gameTimerManager.cancelTimeout(roomId);
            
            // Mark the game as over
            gameRoom.endGame(winner, reason);
            gameRoomRepository.save(gameRoom);
            
            // Send game over notification
            simpMessagingTemplate.convertAndSend(
                "/topic/game/" + roomId,
                Map.of("type", "GAME_OVER", "winner", winner, "reason", reason)
            );
            
        } catch (Exception e) {
            logger.error("Error ending game {}: {}", roomId, e.getMessage(), e);
        }
    }
}