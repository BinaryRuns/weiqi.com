package com.example.goweb_spring.model;

import com.example.goweb_spring.dto.enums.TimeControl;
import com.example.goweb_spring.model.RoomStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;
import java.time.Instant;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.*;



@Data
@NoArgsConstructor
@RedisHash("GameRoom")
public class GameRoom implements Serializable {
    private static final Logger logger = LoggerFactory.getLogger(GameRoom.class);
    
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
    
    // Basic time tracking
    private int blackTime;  // Main time remaining for black in seconds
    private int whiteTime;  // Main time remaining for white in seconds
    private TimeControl timeControl;
    
    // Japanese Byo-yomi state tracking
    private int blackByoyomiPeriodsLeft;  // Number of byo-yomi periods remaining for black
    private int whiteByoyomiPeriodsLeft;  // Number of byo-yomi periods remaining for white
    private boolean blackInByoyomi;       // Whether black is currently in byo-yomi
    private boolean whiteInByoyomi;       // Whether white is currently in byo-yomi
    
    // Canadian Byo-yomi state tracking
    private int blackMovesLeft;           // Number of moves left in current Canadian period for black
    private int whiteMovesLeft;           // Number of moves left in current Canadian period for white
    private boolean blackInCanadian;      // Whether black is currently in Canadian byo-yomi
    private boolean whiteInCanadian;      // Whether white is currently in Canadian byo-yomi

    private String currentPlayerColor; // black or white

    private int moveCount = 0;
    
    // Track consecutive passes for game end detection
    private int consecutivePasses = 0;
    
    // New fields for event-based timing
    private Instant lastMoveTimestamp;
    private Instant lastTimeUpdateTimestamp;
    private Instant lastBroadcastTimestamp;
    private boolean paused = false;
    
    // Flag to track if the game is over
    @Indexed
    private boolean gameOver = false;
    
    // Store the winner when game ends
    private String winner;
    
    // Store the reason for game ending
    private String gameEndReason;
    
    // Room metadata for room listing and custom games
    private String creatorId; // User ID of room creator
    private Instant createdAt;
    private Instant startedAt;
    private boolean isPublic; // Whether room appears in public listings
    private String description; // Optional room description
    private String password; // Optional room password
    
    // Spectator support
    private Set<String> spectators = new HashSet<>(); // User IDs of spectators
    private int maxSpectators = 10; // Maximum number of spectators
    
    // Room status for custom games
    @Indexed
    private RoomStatus status = RoomStatus.WAITING; // WAITING, IN_GAME, FINISHED
    
    // Game settings
    private boolean ranked = true; // Whether game affects ranking
    private boolean allowSpectators = true; // Whether spectators are allowed

    public GameRoom(String roomName, int maxPlayers, int boardSize, TimeControl timeControl) {
        this.roomId = UUID.randomUUID().toString();
        this.roomName = roomName;
        this.maxPlayers = maxPlayers;
        this.boardSize = boardSize;
        this.timeControl = timeControl;
        this.blackTime = timeControl.getInitialTime();
        this.whiteTime = timeControl.getInitialTime();
        this.currentPlayerColor = "black"; // black always start first
        
        // Initialize byo-yomi state based on time control type
        if (timeControl.isJapanese()) {
            this.blackByoyomiPeriodsLeft = timeControl.getByoyomiPeriods();
            this.whiteByoyomiPeriodsLeft = timeControl.getByoyomiPeriods();
            this.blackInByoyomi = false;
            this.whiteInByoyomi = false;
        } else if (timeControl.isCanadian()) {
            this.blackMovesLeft = timeControl.getByoyomiMoves();
            this.whiteMovesLeft = timeControl.getByoyomiMoves();
            this.blackInCanadian = false;
            this.whiteInCanadian = false;
        }
        
        // Initialize creation timestamp, but leave game timing timestamps null until game starts
        Instant now = Instant.now();
        this.createdAt = now;
        this.lastBroadcastTimestamp = now;
        
        // Game timing timestamps will be initialized when the game starts
        this.lastMoveTimestamp = null;
        this.lastTimeUpdateTimestamp = null;

        // Initialize the stones 2D list to all zeros(empty cells)
        initializeBoard(boardSize);
    }
    
    public GameRoom(String roomName, int maxPlayers, int boardSize, TimeControl timeControl, String creatorId, boolean isPublic) {
        this(roomName, maxPlayers, boardSize, timeControl);
        this.creatorId = creatorId;
        this.isPublic = isPublic;
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
     * This updates the current player's time (the player whose turn it is)
     */
    public void updateTimers() {
        // Don't update timers if game is paused, no timestamp exists, game is over, or game hasn't started yet
        if (paused || lastTimeUpdateTimestamp == null || gameOver || status == RoomStatus.WAITING) {
            logger.debug("TIMER NOT UPDATED - Room: {}, Paused: {}, Timestamp null: {}, Game over: {}, Status: {}", 
                roomId, paused, (lastTimeUpdateTimestamp == null), gameOver, status);
            return;
        }
    
        // Calculate elapsed time with millisecond precision
        long elapsedMillis = Duration.between(lastTimeUpdateTimestamp, Instant.now()).toMillis();
        
        logger.debug("TIMER CALCULATION - Room: {}, Elapsed millis: {}, Last update: {}, Now: {}", 
            roomId, elapsedMillis, lastTimeUpdateTimestamp, Instant.now());
            
        // Update time even if less than a second has passed for more responsive timeout detection
        // But only deduct whole seconds to avoid confusion
        long elapsedSeconds = elapsedMillis / 1000;        // whole seconds to deduct
        
        if (elapsedSeconds > 0) {
            logger.debug("TIMER UPDATE - Room: {}, Elapsed seconds: {}, Current player: {}, Black before: {}, White before: {}", 
                roomId, elapsedSeconds, currentPlayerColor, blackTime, whiteTime);
        
            if ("black".equals(currentPlayerColor)) {
                updatePlayerTime("black", elapsedSeconds);
            } else if ("white".equals(currentPlayerColor)) {
                updatePlayerTime("white", elapsedSeconds);
            }
        
            lastTimeUpdateTimestamp = lastTimeUpdateTimestamp.plusSeconds(elapsedSeconds);
            
            logger.debug("TIMER UPDATED - Room: {}, New last update: {}, Black after: {}, White after: {}", 
                roomId, lastTimeUpdateTimestamp, blackTime, whiteTime);
        }
    }
    
    /**
     * Updates a player's time based on the current time control system
     * 
     * @param color The player's color ("black" or "white")
     * @param elapsedSeconds The number of seconds to deduct
     */
    private void updatePlayerTime(String color, long elapsedSeconds) {
        boolean isBlack = "black".equals(color);
        
        if (timeControl.isJapanese()) {
            // Japanese Byo-yomi logic
            if ((isBlack && blackInByoyomi) || (!isBlack && whiteInByoyomi)) {
                // In byo-yomi, we deduct from the period and potentially use up periods
                if (elapsedSeconds >= timeControl.getByoyomiTime()) {
                    // Used up a period
                    if (isBlack) {
                        blackByoyomiPeriodsLeft--;
                    } else {
                        whiteByoyomiPeriodsLeft--;
                    }
                }
                // In Japanese byo-yomi, the time resets for each move, so we don't deduct from the time
            } else {
                // In main time
                if (isBlack) {
                    blackTime -= elapsedSeconds;
                    if (blackTime <= 0) {
                        // Enter byo-yomi
                        blackInByoyomi = true;
                        blackTime = timeControl.getByoyomiTime();
                    }
                } else {
                    whiteTime -= elapsedSeconds;
                    if (whiteTime <= 0) {
                        // Enter byo-yomi
                        whiteInByoyomi = true;
                        whiteTime = timeControl.getByoyomiTime();
                    }
                }
            }
        } else if (timeControl.isCanadian()) {
            // Canadian Byo-yomi logic
            if ((isBlack && blackInCanadian) || (!isBlack && whiteInCanadian)) {
                // In Canadian byo-yomi, we just deduct from the time
                if (isBlack) {
                    blackTime -= elapsedSeconds;
                } else {
                    whiteTime -= elapsedSeconds;
                }
            } else {
                // In main time
                if (isBlack) {
                    blackTime -= elapsedSeconds;
                    if (blackTime <= 0) {
                        // Enter Canadian byo-yomi
                        blackInCanadian = true;
                        blackTime = timeControl.getByoyomiTime();
                    }
                } else {
                    whiteTime -= elapsedSeconds;
                    if (whiteTime <= 0) {
                        // Enter Canadian byo-yomi
                        whiteInCanadian = true;
                        whiteTime = timeControl.getByoyomiTime();
                    }
                }
            }
        } else {
            // Fischer or Simple time control - just deduct from the time
            if (isBlack) {
                blackTime -= elapsedSeconds;
            } else {
                whiteTime -= elapsedSeconds;
            }
        }
    }

    /**
     * Applies time increment based on the time control system
     */
    public void applyTimeIncrement() {
        // Update the last time update timestamp to now
        lastTimeUpdateTimestamp = Instant.now();
        
        // Handle different time control systems
        if (timeControl.isFischer()) {
            // Fischer time control - add increment to the player who just moved
            if ("black".equals(currentPlayerColor)) {
                whiteTime += timeControl.getIncrement();
                logger.debug("Applied Fischer increment: +{}s to White, now: {}s", 
                    timeControl.getIncrement(), whiteTime);
            } else {
                blackTime += timeControl.getIncrement();
                logger.debug("Applied Fischer increment: +{}s to Black, now: {}s", 
                    timeControl.getIncrement(), blackTime);
            }
        } else if (timeControl.isJapanese()) {
            // Japanese Byo-yomi - reset the time for the player who just moved if in byo-yomi
            if ("black".equals(currentPlayerColor)) {
                if (whiteInByoyomi) {
                    whiteTime = timeControl.getByoyomiTime();
                    logger.debug("Reset Japanese byo-yomi time for White to {}s", whiteTime);
                }
            } else {
                if (blackInByoyomi) {
                    blackTime = timeControl.getByoyomiTime();
                    logger.debug("Reset Japanese byo-yomi time for Black to {}s", blackTime);
                }
            }
        } else if (timeControl.isCanadian()) {
            // Canadian Byo-yomi - decrement moves left and reset if needed
            if ("black".equals(currentPlayerColor)) {
                if (whiteInCanadian) {
                    whiteMovesLeft--;
                    if (whiteMovesLeft <= 0) {
                        // Reset the period
                        whiteMovesLeft = timeControl.getByoyomiMoves();
                        whiteTime = timeControl.getByoyomiTime();
                        logger.debug("Reset Canadian byo-yomi for White: {}s for {} moves", 
                            whiteTime, whiteMovesLeft);
                    }
                }
            } else {
                if (blackInCanadian) {
                    blackMovesLeft--;
                    if (blackMovesLeft <= 0) {
                        // Reset the period
                        blackMovesLeft = timeControl.getByoyomiMoves();
                        blackTime = timeControl.getByoyomiTime();
                        logger.debug("Reset Canadian byo-yomi for Black: {}s for {} moves", 
                            blackTime, blackMovesLeft);
                    }
                }
            }
        }
    }

    /**
     * Switch the current player and update timestamps
     * @return true if a timeout occurred, false otherwise
     */
    public boolean switchPlayer() {
        logger.debug("SWITCH START - Room: {}, Black time: {}, White time: {}, Current player: {}", 
            roomId, blackTime, whiteTime, currentPlayerColor);
        
        // Update the timer for the current player before switching
        updateTimers();
        
        logger.debug("AFTER UPDATE - Room: {}, Black time: {}, White time: {}, Current player: {}", 
            roomId, blackTime, whiteTime, currentPlayerColor);
        
        // Check for timeout
        if (isTimeout()) {
            logger.debug("TIMEOUT DETECTED - Room: {}, Black time: {}, White time: {}", 
                roomId, blackTime, whiteTime);
            return true; // Timeout occurred
        }
        
        // Apply time increment to the current player (who just completed their move)
        if (timeControl.getIncrement() > 0) {
            if ("black".equals(currentPlayerColor)) {
                blackTime += timeControl.getIncrement();
            } else {
                whiteTime += timeControl.getIncrement();
            }
            
            logger.debug("AFTER INCREMENT - Room: {}, Black time: {}, White time: {}, Increment: {}", 
                roomId, blackTime, whiteTime, timeControl.getIncrement());
        }
        
        // Switch player
        String oldPlayer = currentPlayerColor;
        currentPlayerColor = "black".equals(currentPlayerColor) ? "white" : "black";
        
        // Reset timestamps
        lastTimeUpdateTimestamp = Instant.now(); // Start timer for the new player's turn
        lastMoveTimestamp = Instant.now();
        consecutivePasses = 0; // Reset consecutive passes on player switch
        
        logger.debug("SWITCH COMPLETE - Room: {}, Black time: {}, White time: {}, Old player: {}, New player: {}", 
            roomId, blackTime, whiteTime, oldPlayer, currentPlayerColor);
        
        return false; // No timeout
    }

    /**
     * Checks if a player has timed out
     * 
     * @return true if the current player has timed out
     */
    public boolean isTimeout() {
        // Calculate elapsed time since the last update
        if (lastTimeUpdateTimestamp == null) {
            return false;
        }
        
        long elapsedSeconds = Duration.between(lastTimeUpdateTimestamp, Instant.now()).getSeconds();
        
        if ("black".equals(currentPlayerColor)) {
            // Check if black has timed out
            if (blackInByoyomi) {
                // In Japanese byo-yomi
                return elapsedSeconds > timeControl.getByoyomiTime() && blackByoyomiPeriodsLeft <= 0;
            } else if (blackInCanadian) {
                // In Canadian byo-yomi
                return blackTime - elapsedSeconds <= 0;
            } else {
                // In main time
                return blackTime - elapsedSeconds <= 0 && 
                       (!timeControl.isJapanese() || blackByoyomiPeriodsLeft <= 0) &&
                       (!timeControl.isCanadian());
            }
        } else {
            // Check if white has timed out
            if (whiteInByoyomi) {
                // In Japanese byo-yomi
                return elapsedSeconds > timeControl.getByoyomiTime() && whiteByoyomiPeriodsLeft <= 0;
            } else if (whiteInCanadian) {
                // In Canadian byo-yomi
                return whiteTime - elapsedSeconds <= 0;
            } else {
                // In main time
                return whiteTime - elapsedSeconds <= 0 && 
                       (!timeControl.isJapanese() || whiteByoyomiPeriodsLeft <= 0) &&
                       (!timeControl.isCanadian());
            }
        }
    }
    
    /**
     * Mark the game as over due to timeout
     */
    public void endGameByTimeout() {
        if (!gameOver) {
            String timeoutWinner = getTimeoutWinner();
            endGame(timeoutWinner, "timeout");
        }
    }

    /**
     * Gets the winner in case of a timeout
     * 
     * @return "black" or "white" depending on who didn't time out
     */
    public String getTimeoutWinner() {
        return "black".equals(currentPlayerColor) ? "white" : "black";
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
    
    // Spectator management methods
    public boolean addSpectator(String userId) {
        if (spectators.size() >= maxSpectators) {
            return false;
        }
        return spectators.add(userId);
    }
    
    public boolean removeSpectator(String userId) {
        return spectators.remove(userId);
    }
    
    public boolean hasSpectator(String userId) {
        return spectators.contains(userId);
    }
    
    public int getSpectatorCount() {
        return spectators.size();
    }
    
    public boolean canJoinAsSpectator() {
        return allowSpectators && spectators.size() < maxSpectators;
    }
    
    // Room state management
    public void startGame() {
        this.status = RoomStatus.IN_GAME;
        
        // Initialize game timing timestamps when the game starts
        Instant now = Instant.now();
        this.startedAt = now;
        this.lastMoveTimestamp = now;
        this.lastTimeUpdateTimestamp = now; // Start the timer for the first player (black) immediately
        this.lastBroadcastTimestamp = now;
        
        // Reset timers to initial values when the game starts
        this.blackTime = this.timeControl.getInitialTime();
        this.whiteTime = this.timeControl.getInitialTime();
        
        // Reset byo-yomi state
        if (timeControl.isJapanese()) {
            this.blackByoyomiPeriodsLeft = timeControl.getByoyomiPeriods();
            this.whiteByoyomiPeriodsLeft = timeControl.getByoyomiPeriods();
            this.blackInByoyomi = false;
            this.whiteInByoyomi = false;
        } else if (timeControl.isCanadian()) {
            this.blackMovesLeft = timeControl.getByoyomiMoves();
            this.whiteMovesLeft = timeControl.getByoyomiMoves();
            this.blackInCanadian = false;
            this.whiteInCanadian = false;
        }
    }
    
    public void finishGame(String winnerColor) {
        this.status = RoomStatus.FINISHED;
        this.gameOver = true;
        this.winner = winnerColor;
    }
    
    /**
     * Central method to end the game for any reason.
     * This ensures that all game-ending scenarios properly stop the timers.
     * 
     * @param winnerColor The color of the winning player ("black", "white", or null for draw)
     * @param reason The reason for the game ending (e.g., "resignation", "timeout", "agreement", "two_passes")
     */
    public void endGame(String winnerColor, String reason) {
        // Set game status to finished
        this.status = RoomStatus.FINISHED;
        
        // Mark game as over to prevent timer updates
        this.gameOver = true;
        
        // Record the winner
        this.winner = winnerColor;
        
        // Record the reason for the game ending
        this.gameEndReason = reason;
        
        // Nullify lastTimeUpdateTimestamp to absolutely stop any timer calculations
        this.lastTimeUpdateTimestamp = null;
        
        // Log the game end
        logger.info("Game {} ended. Winner: {}, Reason: {}", this.roomId, winnerColor, reason);
    }
    
    public boolean isWaiting() {
        return status == RoomStatus.WAITING;
    }
    
    public boolean isInGame() {
        return status == RoomStatus.IN_GAME;
    }
    
    public boolean isFinished() {
        return status == RoomStatus.FINISHED;
    }
}
