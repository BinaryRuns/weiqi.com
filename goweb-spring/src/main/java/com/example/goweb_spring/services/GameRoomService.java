package com.example.goweb_spring.services;


import com.example.goweb_spring.dto.GameRoomDTO;
import com.example.goweb_spring.dto.TimeControl;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.model.Player;
import com.example.goweb_spring.model.RoomEvent;
import com.example.goweb_spring.repositories.GameRoomRepository;
import com.example.goweb_spring.repositories.UserRepository;
import jakarta.servlet.Filter;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.example.goweb_spring.services.GoGameLogic;
import java.sql.Time;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;

@Service
public class GameRoomService {


    private final GameRoomRepository  gameRoomRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final UserRepository userRepository;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);
    private final Map<String, ScheduledFuture<?>> timers = new ConcurrentHashMap<>();

    public GameRoomService(GameRoomRepository gameRoomRepository, SimpMessagingTemplate simpMessagingTemplate , UserRepository userRepository) {
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

        // Debug log
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
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room does not exist"));

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

        // Start timer only if the room has reached a maximum capacity
        if (gameRoom.isFull()) {
            startTimer(roomId);
        }
    }


    private void startTimer(String roomId) {
        if (timers.containsKey(roomId)) return;

        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            onTimerTick(roomId);
        }, 0 , 1, TimeUnit.SECONDS);
    }

    private void stopTimer(String roomId) {
        ScheduledFuture<?> future = timers.remove(roomId);

        if (future != null) {
            future.cancel(true);
        }
    }

    private void onTimerTick(String roomId) {
        try {
            GameRoom room = gameRoomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room does not exist"));

            room.decrementTimer();

            if (room.isTimeout()) {
                simpMessagingTemplate.convertAndSend(
                        "/topic/game/" + roomId + "/timeout",
                        Map.of("winner", (room.getBlackTime() <= 0) ? "white":"black")
                );

                stopTimer(roomId);
            } else {
                simpMessagingTemplate.convertAndSend(
                        "/topic/game/" + roomId + "/timer",
                        Map.of("blackTime", room.getBlackTime(),
                                "whiteTime", room.getWhiteTime())
                );
            }

            gameRoomRepository.save(room);
        } catch (Exception e) {
            e.printStackTrace();
            stopTimer(roomId);
        }
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
                .orElseThrow(() -> new RuntimeException("Room does not exist"));

        gameRoom.removePlayer(userId);
        gameRoomRepository.save(gameRoom);

        if (gameRoom.getPlayers().isEmpty()) {
            gameRoomRepository.delete(gameRoom);
        } else {
            gameRoomRepository.save(gameRoom);
            simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                    new RoomEvent("LEAVE", userId, convertToDTO(gameRoom)));
        }

        // Notify all subscribers with the updated GameRoom object
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom);
    }

    /**
     * Gets details for room by id
     * @param roomId
     * @return
     * @throws Exception
     */
    public GameRoom getRoomById(String roomId) throws Exception {
        return gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new Exception("Game room not found"));
    }


    public void placeStone(String roomId, String userId, int x, int y) {
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room does not exist"));



        // Find player who is making the move
        Player player = gameRoom.getPlayers().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Player not found in game"));

        // Check if it's the player's turn
        if (!gameRoom.getCurrentPlayerColor().equalsIgnoreCase(player.getColor())) {
            throw new IllegalStateException("It's not your turn.");
        }


        // Place the stone
        gameRoom.placeStone(x,y,player.getColor());

        // Switch turn
        gameRoom.setCurrentPlayerColor(player.getColor().equals("black") ? "white" : "black");


        // TODO: Validate board / determining who won





        // Save changes
        gameRoomRepository.save(gameRoom);


        // Convert to DTO for frontend
        GameRoomDTO gameRoomDTO = convertToDTO(gameRoom);

        // Broadcast the updated game state to all client
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId,
                new RoomEvent("UPDATE_BOARD", userId, gameRoomDTO));
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
                    strRow.add(null); // 0 indicates empty
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
