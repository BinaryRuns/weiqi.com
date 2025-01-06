package com.example.goweb_spring.model;

import com.example.goweb_spring.dto.TimeControl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.minidev.json.annotate.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import javax.annotation.PostConstruct;
import java.io.Serializable;
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

    // Store the 2D board as a JSON string
    private String stonesJson;

    @JsonIgnore
    private transient List<List<Integer>> stones; // Transient to exclude from direct serialization

    private int currentPlayers; // Number of players
    private int blackTime;
    private int whiteTime;
    private TimeControl timeControl;

    private String currentPlayerColor; // black or white

    public GameRoom(String roomId, String roomName, int maxPlayers, int boardSize, TimeControl timeControl) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.maxPlayers = maxPlayers;
        this.boardSize = boardSize;
        this.timeControl = timeControl;
        this.blackTime = timeControl.getInitialTime();
        this.whiteTime = timeControl.getInitialTime();
        this.currentPlayerColor = "black"; // black always start first

        // Initialize the stones 2D list to all zeros(empty cells)
        initializeBoard(boardSize);
    }

    public void addPlayer(String userId, String userName) {

        // Check if the game already has a black or white player
        boolean blackAssigned = players.stream().anyMatch(player -> player.getColor().equals("black"));
        boolean whiteAssigned = players.stream().anyMatch(player -> player.getColor().equals("white"));

        String color = !blackAssigned ? "black" : (!whiteAssigned ? "white" : null);

        players.add(new Player(userId, color, userName));
        currentPlayers = players.size();
    }

    public void removePlayer(String userId) {
        // Find the player by userId and remove them from the set
        players.removeIf(player -> player.getUserId().equals(userId));

        // Update the current players count
        currentPlayers = players.size();
    }

    public boolean isFull() {
        return players.size() >= maxPlayers;
    }

    /**
     * Initializes the 2D board with all zeros.
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


    public boolean isValidMove(int x, int y) {
        return stones != null
                && x >= 0 && x < boardSize
                && y >= 0 && y < boardSize
                && stones.get(x).get(y) == 0;
    }


    public void decrementTimer() {
        if ("black".equals(currentPlayerColor)) {
            blackTime--;
        } else if ("white".equals(currentPlayerColor)) {
            whiteTime--;
        }
    }

    public boolean isTimeout() {
        return blackTime <= 0 || whiteTime <= 0;
    }

    /**
     * Places a stone on the board at coordinates (x, y).
     *
     * @param x     row index
     * @param y     column index
     * @param color "black" or "white"
     */
    public void placeStone(int x, int y, String color) {

        // Need to deserialize the stoneJson first
        deserializeStones();

        if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
            throw new IllegalArgumentException("Coordinates out of bounds");
        }
        if (stones.get(y).get(x) != 0) {
            throw new IllegalStateException("Intersection is already occupied");
        }

        int stoneValue = color.equalsIgnoreCase("black") ? 1 : 2;
        stones.get(y).set(x, stoneValue);

        // Switch current player
        this.currentPlayerColor = color.equalsIgnoreCase("black") ? "white" : "black";

        // after updating we need to serialize the stone
        serializeStones();
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

    // Ensure stones are deserialized after loading from Redis
    @PostConstruct
    private void postConstruct() {
        deserializeStones();
    }
}