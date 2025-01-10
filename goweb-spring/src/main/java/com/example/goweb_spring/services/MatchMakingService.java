package com.example.goweb_spring.services;


import com.example.goweb_spring.dto.MatchMakingRequest;
import com.example.goweb_spring.dto.TimeControl;
import com.example.goweb_spring.model.GameRoom;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class MatchMakingService {
    private final Map<String, MatchMakingRequest> playerQueue = new HashMap<>();
    private final GameRoomService gameRoomService;


    public MatchMakingService(GameRoomService gameRoomService) {
        this.gameRoomService = gameRoomService;
    }

    public void addToQueue(String userId, int boardSize, TimeControl timeControl) {
        playerQueue.put(userId, new MatchMakingRequest(userId, boardSize, timeControl));
        matchPlayers();
    }

    public void removeFromQueue(String userId) {
        playerQueue.remove(userId);
    }

    private synchronized void matchPlayers() {
        List<String> matchedPlayers = new ArrayList<>();

        // Find the first two players with matching criteria
        for (Map.Entry<String, MatchMakingRequest> entry1 : playerQueue.entrySet()) {
            for (Map.Entry<String, MatchMakingRequest> entry2 : playerQueue.entrySet()) {
                if (!entry1.getKey().equals(entry2.getKey())) {
                    MatchMakingRequest player1 = entry1.getValue();
                    MatchMakingRequest player2 = entry2.getValue();

                    // Match based on board size and time control
                    if (player1.getBoardSize() == player2.getBoardSize() &&
                            player1.getTimeControl().equals(player2.getTimeControl())) {

                        matchedPlayers.add(player1.getUserId());
                        matchedPlayers.add(player2.getUserId());
                        break;
                    }
                }
            }

            if (!matchedPlayers.isEmpty()) break;
        }

        // Create a match if two players are matched
        if (matchedPlayers.size() == 2) {
            String player1 = matchedPlayers.get(0);
            String player2 = matchedPlayers.get(1);

            MatchMakingRequest request1 = playerQueue.remove(player1);
            MatchMakingRequest request2 = playerQueue.remove(player2);

            // Create a new game room
            String roomName = "Match: " + player1 + " vs " + player2;
            GameRoom gameRoom = gameRoomService.createRoom(roomName, 2, request1.getBoardSize(), request1.getTimeControl());

            // Add both players to the room
            gameRoomService.joinRoom(gameRoom.getRoomId(), player1);
            gameRoomService.joinRoom(gameRoom.getRoomId(), player2);

            System.out.println("Match created: " + roomName);
        }
    }

}
