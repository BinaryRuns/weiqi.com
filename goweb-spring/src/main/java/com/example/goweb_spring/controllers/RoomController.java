package com.example.goweb_spring.controllers;

import com.example.goweb_spring.annotations.RequiresAuthentication;
import com.example.goweb_spring.dto.CreateCustomRoomRequest;
import com.example.goweb_spring.dto.RoomListResponse;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.services.GameRoomService;
import com.example.goweb_spring.utils.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
@RequiresAuthentication
public class RoomController {

    private final GameRoomService gameRoomService;
    private final SecurityUtils securityUtils;

    public RoomController(GameRoomService gameRoomService, SecurityUtils securityUtils) {
        this.gameRoomService = gameRoomService;
        this.securityUtils = securityUtils;
    }

    /**
     * Retrieves all available game rooms with filtering options
     */
    @GetMapping("/active")
    public ResponseEntity<List<RoomListResponse>> getActiveRooms(
            @RequestParam(required = false) Boolean isPublic,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer boardSize) {
        
        List<GameRoom> rooms = gameRoomService.getActiveRooms(isPublic, status, boardSize);
        List<RoomListResponse> response = rooms.stream()
                .map(gameRoomService::convertToRoomListDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves rooms suitable for spectating (in progress games)
     */
    @GetMapping("/spectate")
    public ResponseEntity<List<RoomListResponse>> getSpectatableRooms() {
        List<GameRoom> rooms = gameRoomService.getSpectatableRooms();
        List<RoomListResponse> response = rooms.stream()
                .map(gameRoomService::convertToRoomListDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves waiting rooms that can be joined
     */
    @GetMapping("/waiting")
    public ResponseEntity<List<RoomListResponse>> getJoinableRooms() {
        List<GameRoom> rooms = gameRoomService.getJoinableRooms();
        List<RoomListResponse> response = rooms.stream()
                .map(gameRoomService::convertToRoomListDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Creates a new custom game room
     */
    @PostMapping("/create")
    public ResponseEntity<RoomListResponse> createCustomRoom(@RequestBody CreateCustomRoomRequest request) {
        String userId = securityUtils.getCurrentUserId().orElseThrow(() -> new IllegalStateException("User not authenticated"));
        
        GameRoom gameRoom = gameRoomService.createCustomRoom(
                request.getRoomName(),
                request.getBoardSize().getSize(),
                request.getTimeControl(),
                userId,
                request.isPublic(),
                request.getDescription(),
                request.getPassword(),
                request.isAllowSpectators()
        );
        
        return ResponseEntity.ok(gameRoomService.convertToRoomListDTO(gameRoom));
    }

    /**
     * Retrieves details of a specific game room
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomListResponse> getRoomDetails(@PathVariable String roomId) {
        try {
            GameRoom room = gameRoomService.getRoomById(roomId);
            return ResponseEntity.ok(gameRoomService.convertToRoomListDTO(room));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Join a room as a player
     */
    @PostMapping("/{roomId}/join")
    public ResponseEntity<Void> joinRoom(@PathVariable String roomId) {
        String userId = securityUtils.getCurrentUserId().orElseThrow(() -> new IllegalStateException("User not authenticated"));
        gameRoomService.joinRoom(roomId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Join a room as a spectator
     */
    @PostMapping("/{roomId}/spectate")
    public ResponseEntity<Void> joinAsSpectator(@PathVariable String roomId) {
        String userId = securityUtils.getCurrentUserId().orElseThrow(() -> new IllegalStateException("User not authenticated"));
        boolean added = gameRoomService.addSpectator(roomId, userId);
        
        if (added) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Leave a room (as player or spectator)
     */
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(@PathVariable String roomId) {
        String userId = securityUtils.getCurrentUserId().orElseThrow(() -> new IllegalStateException("User not authenticated"));
        
        // Try to remove as player first, then as spectator
        try {
            gameRoomService.leaveRoom(roomId, userId);
        } catch (Exception e) {
            // If not a player, try removing as spectator
            gameRoomService.removeSpectator(roomId, userId);
        }
        
        return ResponseEntity.ok().build();
    }

    /**
     * Start a game when all players are ready
     */
    @PostMapping("/{roomId}/start")
    public ResponseEntity<Void> startGame(@PathVariable String roomId) {
        gameRoomService.startGame(roomId);
        return ResponseEntity.ok().build();
    }
}
