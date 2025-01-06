package com.example.goweb_spring.controllers;


import com.example.goweb_spring.dto.CreateRoomRequest;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.services.GameRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


/*
/api/game/create: Accepts a POST request with room details and creates a new game room.
/api/game/rooms: Returns a list of all available game rooms.
/api/game/rooms/{roomId}: Retrieves details of a specific game room. Note: The implementation for retrieving a specific room needs to be adjusted to fetch based on roomId
 */

@RestController
@RequestMapping("/api/game")
public class RoomController {
    @Autowired
    private GameRoomService gameRoomService;

    /**
     * Creates a new game room.
     *
     * @param request The request body containing room details.
     * @return The created GameRoom.
     */
    @PostMapping("/create")
    public ResponseEntity<GameRoom> createRoom(@RequestBody CreateRoomRequest request) {
        GameRoom gameRoom = gameRoomService.createRoom(
                request.getRoomName(),
                request.getMaxPlayers(),
                request.getBoardSize(),
                request.getTimeControl());
        return ResponseEntity.ok(gameRoom);
    }

    /**
     * Retrieves all available game rooms.
     *
     * @return List of available GameRooms.
     */
    @GetMapping("/rooms")
    public ResponseEntity<Iterable<GameRoom>> getAvailableRooms() {
        return ResponseEntity.ok(gameRoomService.getAvailableRooms());
    }


    /**
     * Retrieves details of a specific game room.
     *
     * @param roomId The ID of the room.
     * @return The GameRoom details.
     */
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<GameRoom> getRoomDetails(@PathVariable String roomId) {
        try {
            GameRoom room = gameRoomService.getRoomById(roomId);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
