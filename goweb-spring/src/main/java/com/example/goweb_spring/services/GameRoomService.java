package com.example.goweb_spring.services;


import com.example.goweb_spring.dto.ErrorMessage;
import com.example.goweb_spring.dto.GameRoomDTO;
import com.example.goweb_spring.dto.TimeControl;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.exceptions.RoomNotFoundException;
import com.example.goweb_spring.exceptions.UserNotFoundException;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.model.Player;
import com.example.goweb_spring.model.RoomEvent;
import com.example.goweb_spring.repositories.GameRoomRepository;
import com.example.goweb_spring.repositories.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;
import org.springframework.messaging.simp.user.SimpUserRegistry;

@Service
public class GameRoomService {
    private final GameRoomRepository  gameRoomRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final UserRepository userRepository;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);
    private final Map<String, ScheduledFuture<?>> timers = new ConcurrentHashMap<>();

    public GameRoomService(GameRoomRepository gameRoomRepository, SimpMessagingTemplate simpMessagingTemplate , UserRepository userRepository, SimpUserRegistry simpUserRegistry) {
        this.gameRoomRepository = gameRoomRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.userRepository = userRepository;
    }

    /**
     * Creates a new game room.
     *
     * @param roomName    Optional name for the room.
     * @param maxPlayers  Maximum number of players.
     * @return The created GameRoom.
     */
    public GameRoom createRoom(String roomName, int maxPlayers, int boardSize, TimeControl timeControl) {
        String roomId = UUID.randomUUID().toString();
        GameRoom gameRoom = new GameRoom(roomId, roomName, maxPlayers, boardSize, timeControl);

        System.out.println("Saving GameRoom: " + gameRoom);

        gameRoomRepository.save(gameRoom);
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
                    new RoomEvent("INITIAL_STATE", userId, convertToDTO(gameRoom)));
            return;
        }

        if (gameRoom.isFull()) {
            throw new IllegalStateException("Room is full");
        }

        // Get user
        UserEntity user = userRepository.findByUserId(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // add to redis and save
        gameRoom.addPlayer(userId, user.getUsername());
        gameRoomRepository.save(gameRoom);


        // Notify all subscribers with the updated GameRoom object
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                new RoomEvent("INITIAL_STATE", userId, convertToDTO(gameRoom)));
    }

    /**
     * Allows a user to leave a game room.
     *
     * @param roomId The ID of the room to leave.
     * @param userId The ID of the user leaving.
     * @throws RuntimeException if the room does not exist.
     */
    public void leaveRoom(String roomId, String userId)  {
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room does not exist"));

        System.out.println("Leaving GameRoom: -----------------------------------------------");

        gameRoom.removePlayer(userId);
        gameRoomRepository.save(gameRoom);

        if (gameRoom.getPlayers().isEmpty()) {
            stopTimer(roomId);
            gameRoomRepository.delete(gameRoom);

            System.out.println("GameRoom " + roomId + " deleted as no players remain.");
        } else {
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                    new RoomEvent("LEAVE", userId, convertToDTO(gameRoom)));
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
                Map.of("resigningPlayer", resigningPlayer.getUserName(), "winner", winnerColor)
        );

        // Stop the Timer and clean up the room
        stopTimer(roomId);
        gameRoomRepository.delete(gameRoom);

        System.out.println("User " + resigningPlayer.getUserName() + " resigned. Game ended.");
    }


    private void startTimer(String roomId) {
        if (timers.containsKey(roomId)) {
            System.out.println("Timer for room " + roomId + " is already running.");
            return;
        }

        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                onTimerTick(roomId);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, 0, 1, TimeUnit.SECONDS);

        timers.put(roomId, future);
        System.out.println("Timer for room " + roomId + " has been started.");
    }

    private void stopTimer(String roomId) {
        ScheduledFuture<?> future = timers.remove(roomId);
        if (future != null) {
            boolean canceled = future.cancel(true);
            if (canceled) {
                System.out.println("Timer for room " + roomId + " has been stopped.");
            } else {
                System.out.println("Failed to stop the timer for room " + roomId + ". It might already be executing.");
            }
        } else {
            System.out.println("No active timer found for room " + roomId + ".");
        }
    }

    private void onTimerTick(String roomId) {
        if (!timers.containsKey(roomId)) {
            System.out.println("Timer for room " + roomId + " was already stopped. Skipping tick.");
            return; // Exit early if the timer is no longer active
        }

        try {
            GameRoom room = gameRoomRepository.findById(roomId)
                    .orElseThrow(() -> new RoomNotFoundException("Room does not exist"));

            room.decrementTimer();

            if (room.isTimeout()) {
                simpMessagingTemplate.convertAndSend(
                        "/topic/game/" + roomId + "/timeout",
                        Map.of("winner", (room.getBlackTime() <= 0) ? "white" : "black")
                );

                stopTimer(roomId); // Stop the timer when the game ends
                return;
            }

            simpMessagingTemplate.convertAndSend(
                    "/topic/game/" + roomId + "/timer",
                    Map.of("blackTime", room.getBlackTime(),
                            "whiteTime", room.getWhiteTime())
            );

            gameRoomRepository.save(room);

        } catch (RoomNotFoundException e) {
            System.out.println("Room " + roomId + " no longer exists. Stopping the timer.");
            stopTimer(roomId); // Stop the timer if the room is not found
        } catch (Exception e) {
            System.out.println("Error during timer tick for room " + roomId + ": " + e.getMessage());
            stopTimer(roomId); // Stop the timer on unexpected errors
            e.printStackTrace();
        }
    }


    /**
     * Gets details for room by id
     * @param roomId
     * @return
     * @throws Exception
     */
    public GameRoom getRoomById(String roomId) throws Exception {
        return gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Game room not found"));
    }



    private void sendSoundNotification(String roomId, String color) {
        Map<String, String> soundMessage = new HashMap<>();
        soundMessage.put("type", "PLAY_SOUND");
        soundMessage.put("color", color);
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId + "/sound", soundMessage);
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

        // TODO: Validate board
        List<List<Integer>> updatedStones = GoGameLogic.placeMove(
                gameRoom.getStones(), x, y, player.getColor()
        );

        gameRoom.setStones(updatedStones); // Place move
        
        // Start timer on first move
        if (!timers.containsKey(roomId)) {
            startTimer(roomId);
        }
        
        // Send sound notification before changing the turn
        sendSoundNotification(roomId, player.getColor());
        
        gameRoom.setCurrentPlayerColor(player.getColor().equals("black") ? "white" : "black"); // Switch turn
        gameRoomRepository.save(gameRoom); // Save changes

        GameRoomDTO gameRoomDTO = convertToDTO(gameRoom); // Convert to DTO for frontend
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                new RoomEvent("UPDATE_BOARD", userId, gameRoomDTO)); // Broadcast the updated game state to all clients
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
    private GameRoomDTO convertToDTO(GameRoom gameRoom) {

        System.out.println("Converting GameRoomDTO to DTO" + gameRoom.getStonesJson());
        System.out.println("Converting GameRoomDTO to DTO" + gameRoom.getStones());

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

        return new GameRoomDTO(
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
