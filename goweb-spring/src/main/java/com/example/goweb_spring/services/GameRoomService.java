package com.example.goweb_spring.services;


import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.repositories.GameRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class GameRoomService {


    private final GameRoomRepository  gameRoomRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;


    public GameRoomService(GameRoomRepository gameRoomRepository, SimpMessagingTemplate simpMessagingTemplate) {
        this.gameRoomRepository = gameRoomRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    /**
     * Creates a new game room.
     *
     * @param roomName    Optional name for the room.
     * @param maxPlayers  Maximum number of players.
     * @return The created GameRoom.
     */
    public GameRoom createRoom(String roomName, int maxPlayers) {
        String roomId = UUID.randomUUID().toString();
        GameRoom gameRoom = new GameRoom(roomId, roomName, maxPlayers);

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
     * @throws Exception if the room is full or does not exist.
     */

    public void joinRoom(String roomId, String userId) throws Exception {
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new Exception("Room does not exist"));

        if (gameRoom.isFull()) {
            throw new Exception("Room is full");
        }

        gameRoom.addPlayer(userId);
//        gameRoom.setCurrentPlayers(gameRoom.getCurrentPlayers() + 1);
        gameRoomRepository.save(gameRoom);


        // Notify all subscribers with the updated GameRoom object
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom);

    }

    /**
     * Allows a user to leave a game room.
     *
     * @param roomId The ID of the room to leave.
     * @param userId The ID of the user leaving.
     * @throws Exception if the room does not exist.
     */

    public void leaveRoom(String roomId, String userId) throws Exception {
        GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new Exception("Room does not exist"));

        gameRoom.removePlayer(userId);
        gameRoomRepository.save(gameRoom);

        // Notify all subscribers with the updated GameRoom object
        simpMessagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom);

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
                .orElseThrow(() -> new Exception("Game room not found"));
    }
}
