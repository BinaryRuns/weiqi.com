package com.example.goweb_spring.model;

import com.example.goweb_spring.dto.enums.TimeControl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.io.Serializable;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Data
@NoArgsConstructor
@RedisHash("GameRoom")
public class GameRoom implements Serializable {
    @Id
    private String roomId;
    private String roomName;
    private int maxPlayers;
    private Set<Player> players = new HashSet<>();
    private int boardSize;
    private Map<String, Boolean> playerReadyStatus = new HashMap<>();

    // Store the 2D board as a JSON string
    private String stonesJson;

    @JsonIgnore
    private transient List<List<Integer>> stones; // Transient to exclude from direct serialization

    private int currentPlayers; // Number of players
    private int blackTime;
    private int whiteTime;
    private TimeControl timeControl;

    private String currentPlayerColor; // black or white

    private int moveCount = 0;
    
    // New fields for event-based timing
    private Instant lastMoveTimestamp;
    private Instant lastTimeUpdateTimestamp;
    private Instant lastBroadcastTimestamp;
    private boolean paused = false;
    
    // Flag to track if the game is over
    private boolean gameOver = false;
    
    // Store the winner when game ends
    private String winner;

    public GameRoom(String roomName, int maxPlayers, int boardSize, TimeControl timeControl) {
        this.roomId = UUID.randomUUID().toString();
        this.roomName = roomName;
        this.maxPlayers = maxPlayers;
        this.boardSize = boardSize;
        this.timeControl = timeControl;
        this.blackTime = timeControl.getInitialTime();
        this.whiteTime = timeControl.getInitialTime();
        this.currentPlayerColor = "black"; // black always start first
        
        // Initialize timestamps
        Instant now = Instant.now();
        this.lastMoveTimestamp = now;
        this.lastTimeUpdateTimestamp = now;
        this.lastBroadcastTimestamp = now;

        // Initialize the stones 2D list to all zeros(empty cells)
        initializeBoard(boardSize);
    }

    public void addPlayer(String userId, String userName) {
        // Check if the game already has a black or white player
        boolean blackAssigned = players.stream().anyMatch(player -> player.getColor().equals("black"));
        boolean whiteAssigned = players.stream().anyMatch(player -> player.getColor().equals("white"));

        String color = !blackAssigned ? "black" : (!whiteAssigned ? "white" : null);

        players.add(new Player(userId, color, userName));
        playerReadyStatus.put(userId, false);
        currentPlayers = players.size();
    }

    public void removePlayer(String userId) {
        players.removeIf(player -> player.getUserId().equals(userId));
        currentPlayers = players.size();
    }

    public boolean isFull() {
        return players.size() >= maxPlayers;
    }

    /**
     * Initializes the 2D board with all zeros.
     * 1 will represent black pieces
     * 2 will represent white pieces
     * 0 will represent empty
     */
    private void initializeBoard(int boardSize) {
        stones = new ArrayList<>();
        for (int i = 0; i < boardSize; i++) {
            List<Integer> row = new ArrayList<>();
            for (int j = 0; j < boardSize; j++) {
                row.add(0); // 0 indicates an empty intersection
            }
            stones.add(row);
        }
        serializeStones(); // Update stonesJson after initialization
    }

    /**
     * Updates the timers based on elapsed time since last update
     * This replaces the old decrementTimer method
     */
    public void updateTimers() {
        if (paused || lastTimeUpdateTimestamp == null || gameOver) {
            return;
        }
        
        long elapsedSeconds = ChronoUnit.SECONDS.between(lastTimeUpdateTimestamp, Instant.now());
        if (elapsedSeconds <= 0) {
            return;
        }
        
        if ("black".equals(currentPlayerColor)) {
            blackTime -= elapsedSeconds;
        } else if ("white".equals(currentPlayerColor)) {
            whiteTime -= elapsedSeconds;
        }
        
        lastTimeUpdateTimestamp = Instant.now();
    }

    /**
     * Apply time increment based on the time control settings
     */
    public void applyTimeIncrement() {
        if (timeControl.getIncrement() <= 0) {
            return;
        }
        
        if ("black".equals(currentPlayerColor)) {
            blackTime += timeControl.getIncrement();
        } else if ("white".equals(currentPlayerColor)) {
            whiteTime += timeControl.getIncrement();
        }
    }

    /**
     * Switch the current player and update timestamps
     */
    public void switchPlayer() {
        currentPlayerColor = "black".equals(currentPlayerColor) ? "white" : "black";
        lastMoveTimestamp = Instant.now();
        lastTimeUpdateTimestamp = Instant.now();
    }

    /**
     * Check if either player has run out of time and the game is not already over
     */
    public boolean isTimeout() {
        if (gameOver) {
            return false;
        }
        return blackTime <= 0 || whiteTime <= 0;
    }
    
    /**
     * Mark the game as over due to timeout
     */
    public void endGameByTimeout() {
        if (!gameOver) {
            gameOver = true;
            winner = getTimeoutWinner();
        }
    }

    /**
     * Get the winner if there's a timeout
     * @return "black" or "white" based on who didn't time out
     */
    public String getTimeoutWinner() {
        return blackTime <= 0 ? "white" : "black";
    }

    // Serialize the stones list to JSON
    private void serializeStones() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            this.stonesJson = mapper.writeValueAsString(this.stones);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize stones", e);
        }
    }

    // Deserialize the stonesJson back to stones list
    private void deserializeStones() {
        if (this.stonesJson != null && !this.stonesJson.isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                this.stones = mapper.readValue(this.stonesJson, List.class);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to deserialize stonesJson", e);
            }
        } else {
            // If stonesJson is null or empty, initialize the board
            initializeBoard(this.boardSize);
        }
    }

    // Custom getStones, because redis don't store any array only the serialize so we need to deserialize before we continue
    public List<List<Integer>> getStones() {
        deserializeStones();
        return stones;
    }

    public void setStones(List<List<Integer>> updatedBoard) {
        stones = updatedBoard;
        serializeStones();
    }

    public void markPlayerReady(String userId) {
        playerReadyStatus.put(userId, true);
    }

    public boolean allPlayersReady() {
        return playerReadyStatus.values().stream()
                .allMatch(Boolean.TRUE::equals);
    }

    public int getMoveCount() {
        return moveCount;
    }

    public void setMoveCount(int moveCount) {
        this.moveCount = moveCount;
    }
    
    public boolean isGameOver() {
        return gameOver;
    }
}
