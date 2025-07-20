package com.example.goweb_spring.services;

import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.model.RoomStatus;
import com.example.goweb_spring.repositories.GameRoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * GameTimerManager - A service that manages in-memory timers for active games.
 * This service uses an event-driven approach to handle game timeouts more efficiently
 * than the polling approach used by GameTimeoutService.
 * 
 * Supports multiple time control systems:
 * - Fischer time (increment after each move)
 * - Japanese Byo-yomi (fixed time periods for each move in overtime)
 * - Canadian Byo-yomi (fixed time for a specified number of moves in overtime)
 */
@Service
public class GameTimerManager {
    private static final Logger logger = LoggerFactory.getLogger(GameTimerManager.class);
    
    private final GameRoomRepository gameRoomRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ScheduledExecutorService scheduler;
    
    // Map to store active timers for each game room
    private final ConcurrentHashMap<String, ScheduledFuture<?>> activeTimers = new ConcurrentHashMap<>();
    
    @Autowired
    public GameTimerManager(
            GameRoomRepository gameRoomRepository, 
            SimpMessagingTemplate messagingTemplate,
            @Value("${game.timer.thread-pool-size:4}") int threadPoolSize) {
        this.gameRoomRepository = gameRoomRepository;
        this.messagingTemplate = messagingTemplate;
        this.scheduler = Executors.newScheduledThreadPool(threadPoolSize);
        logger.info("GameTimerManager initialized with thread pool size: {}", threadPoolSize);
    }
    
    /**
     * Initialize timers for all active games when the application starts up.
     * This ensures that games in progress will continue to be timed correctly
     * even after a server restart.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeTimersOnStartup() {
        logger.info("Initializing timers for active games on startup");
        
        try {
            // Find all active games (IN_GAME status and not game over)
            List<GameRoom> activeGames = gameRoomRepository.findByGameOverFalseAndStatus(RoomStatus.IN_GAME);
            
            logger.info("Found {} active games to initialize timers for", activeGames.size());
            
            for (GameRoom game : activeGames) {
                try {
                    // Skip games with no timestamp
                    if (game.getLastTimeUpdateTimestamp() == null) {
                        logger.warn("Game {} has no last time update timestamp, skipping", game.getRoomId());
                        continue;
                    }
                    
                    // Calculate elapsed time since the last update
                    long elapsedSeconds = Duration.between(game.getLastTimeUpdateTimestamp(), Instant.now()).getSeconds();
                    
                    // Update the game state based on elapsed time
                    updateGameStateAfterDowntime(game, elapsedSeconds);
                    
                    // Update the last time update timestamp to now
                    game.setLastTimeUpdateTimestamp(Instant.now());
                    
                    // Save the updated game state
                    gameRoomRepository.save(game);
                    
                    // Check if the game has timed out during the server downtime
                    if (game.isTimeout()) {
                        logger.info("Game {} timed out while server was down", game.getRoomId());
                        handleTimeout(game.getRoomId());
                    } else {
                        // Schedule a new timer for the adjusted remaining time
                        logger.info("Scheduling timer for game {} after server restart", game.getRoomId());
                        scheduleTimeout(game.getRoomId(), game);
                    }
                } catch (Exception e) {
                    logger.error("Error initializing timer for game {}: {}", 
                               game.getRoomId(), e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            logger.error("Error initializing timers on startup: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Updates a game's state after server downtime
     * 
     * @param game The game room to update
     * @param elapsedSeconds The number of seconds that passed during downtime
     */
    private void updateGameStateAfterDowntime(GameRoom game, long elapsedSeconds) {
        String currentPlayer = game.getCurrentPlayerColor();
        boolean isBlack = "black".equals(currentPlayer);
        
        if (game.getTimeControl().isJapanese()) {
            // Japanese Byo-yomi logic
            if ((isBlack && game.isBlackInByoyomi()) || (!isBlack && game.isWhiteInByoyomi())) {
                // In byo-yomi, we need to deduct periods based on elapsed time
                int periodsUsed = (int) (elapsedSeconds / game.getTimeControl().getByoyomiTime());
                if (periodsUsed > 0) {
                    if (isBlack) {
                        game.setBlackByoyomiPeriodsLeft(
                            Math.max(0, game.getBlackByoyomiPeriodsLeft() - periodsUsed));
                    } else {
                        game.setWhiteByoyomiPeriodsLeft(
                            Math.max(0, game.getWhiteByoyomiPeriodsLeft() - periodsUsed));
                    }
                }
            } else {
                // In main time
                if (isBlack) {
                    int newTime = game.getBlackTime() - (int)elapsedSeconds;
                    if (newTime <= 0) {
                        // Enter byo-yomi
                        game.setBlackInByoyomi(true);
                        game.setBlackTime(game.getTimeControl().getByoyomiTime());
                    } else {
                        game.setBlackTime(newTime);
                    }
                } else {
                    int newTime = game.getWhiteTime() - (int)elapsedSeconds;
                    if (newTime <= 0) {
                        // Enter byo-yomi
                        game.setWhiteInByoyomi(true);
                        game.setWhiteTime(game.getTimeControl().getByoyomiTime());
                    } else {
                        game.setWhiteTime(newTime);
                    }
                }
            }
        } else if (game.getTimeControl().isCanadian()) {
            // Canadian Byo-yomi logic - just deduct time
            if (isBlack) {
                game.setBlackTime(Math.max(0, game.getBlackTime() - (int)elapsedSeconds));
            } else {
                game.setWhiteTime(Math.max(0, game.getWhiteTime() - (int)elapsedSeconds));
            }
        } else {
            // Fischer or Simple time control - just deduct time
            if (isBlack) {
                game.setBlackTime(Math.max(0, game.getBlackTime() - (int)elapsedSeconds));
            } else {
                game.setWhiteTime(Math.max(0, game.getWhiteTime() - (int)elapsedSeconds));
            }
        }
    }
    
    /**
     * Schedule a timeout for a game room based on the current player's remaining time.
     * This method should be called whenever a player makes a move.
     * 
     * @param roomId The ID of the game room
     * @param gameRoom The game room object
     */
    public void scheduleTimeout(String roomId, GameRoom gameRoom) {
        // Cancel any existing timer for this room
        cancelTimeout(roomId);
        
        // Don't schedule a timer if the game is over or paused
        if (gameRoom.isGameOver() || gameRoom.isPaused()) {
            logger.debug("Not scheduling timer for room {}: game over = {}, paused = {}", 
                       roomId, gameRoom.isGameOver(), gameRoom.isPaused());
            return;
        }
        
        // Calculate the timeout delay based on the time control system
        long timeoutDelaySeconds = calculateTimeoutDelay(gameRoom);
        
        // Schedule a new timer to execute when the player's time runs out
        logger.info("Scheduling timeout for room {}, player {}, in {} seconds", 
                  roomId, gameRoom.getCurrentPlayerColor(), timeoutDelaySeconds);
        
        ScheduledFuture<?> future = scheduler.schedule(
            () -> handleTimeout(roomId),
            timeoutDelaySeconds,
            TimeUnit.SECONDS
        );
        
        // Store the timer for future reference
        activeTimers.put(roomId, future);
    }
    
    /**
     * Calculates the timeout delay based on the game's time control system
     * 
     * @param gameRoom The game room
     * @return The timeout delay in seconds
     */
    private long calculateTimeoutDelay(GameRoom gameRoom) {
        String currentPlayer = gameRoom.getCurrentPlayerColor();
        boolean isBlack = "black".equals(currentPlayer);
        
        if (gameRoom.getTimeControl().isJapanese()) {
            // Japanese Byo-yomi logic
            if ((isBlack && gameRoom.isBlackInByoyomi()) || (!isBlack && gameRoom.isWhiteInByoyomi())) {
                // In byo-yomi, the timeout is the byo-yomi time
                return gameRoom.getTimeControl().getByoyomiTime();
            }
        }
        
        // For all other cases (main time, Canadian byo-yomi, Fischer), use the player's remaining time
        return isBlack ? gameRoom.getBlackTime() : gameRoom.getWhiteTime();
    }
    
    /**
     * Cancel a scheduled timeout for a game room.
     * This method should be called when a player makes a move or the game ends.
     * 
     * @param roomId The ID of the game room
     */
    public void cancelTimeout(String roomId) {
        ScheduledFuture<?> future = activeTimers.remove(roomId);
        if (future != null) {
            future.cancel(false);
            logger.debug("Cancelled timeout for room {}", roomId);
        }
    }
    
    /**
     * Handle a timeout for a game room.
     * This method is called when a player's timer runs out.
     * 
     * @param roomId The ID of the game room
     */
    private void handleTimeout(String roomId) {
        try {
            logger.info("Timeout triggered for room {}", roomId);
            
            // Fetch the latest game state from the database
            GameRoom gameRoom = gameRoomRepository.findById(roomId)
                .orElse(null);
            
            if (gameRoom == null) {
                logger.warn("Game room {} not found when handling timeout", roomId);
                return;
            }
            
            // Check if the game is already over
            if (gameRoom.isGameOver()) {
                logger.debug("Game {} is already over, ignoring timeout", roomId);
                return;
            }
            
            // Double-check that the timeout is still valid
            if (isTimeoutValid(gameRoom)) {
                // Determine the winner (the player who didn't time out)
                String winner = gameRoom.getTimeoutWinner();
                
                // Mark the game as over
                gameRoom.endGame(winner, "timeout");
                
                // Save the updated game state
                gameRoomRepository.save(gameRoom);
                
                // Send timeout notification
                messagingTemplate.convertAndSend(
                    "/topic/game/" + roomId + "/timeout",
                    Map.of(
                        "winner", winner,
                        "timeControl", gameRoom.getTimeControl().getType()
                    )
                );
                
                // Send game over notification
                messagingTemplate.convertAndSend(
                    "/topic/game/" + roomId,
                    Map.of(
                        "type", "GAME_OVER", 
                        "winner", winner, 
                        "reason", "timeout",
                        "timeControl", gameRoom.getTimeControl().getType()
                    )
                );
                
                logger.info("Game {} timed out. Winner: {}", roomId, winner);
            } else {
                // The timeout was a false alarm, reschedule
                logger.warn("False timeout for room {}, rescheduling", roomId);
                scheduleTimeout(roomId, gameRoom);
            }
            
        } catch (Exception e) {
            logger.error("Error handling timeout for game {}: {}", roomId, e.getMessage(), e);
        } finally {
            // Remove the timer from the active timers map
            activeTimers.remove(roomId);
        }
    }
    
    /**
     * Checks if a timeout is valid by examining the game state
     * 
     * @param gameRoom The game room to check
     * @return true if the timeout is valid, false otherwise
     */
    private boolean isTimeoutValid(GameRoom gameRoom) {
        // Calculate elapsed time since the last update
        if (gameRoom.getLastTimeUpdateTimestamp() == null) {
            return false;
        }
        
        // Update the game's timers to the current moment
        gameRoom.updateTimers();
        
        // Now check if there's a timeout based on the updated state
        return gameRoom.isTimeout();
    }
    
    /**
     * Pause the timer for a game room.
     * 
     * @param roomId The ID of the game room
     */
    public void pauseTimer(String roomId) {
        cancelTimeout(roomId);
        
        GameRoom gameRoom = gameRoomRepository.findById(roomId).orElse(null);
        if (gameRoom != null) {
            gameRoom.setPaused(true);
            gameRoom.updateTimers(); // Update timers before pausing
            gameRoomRepository.save(gameRoom);
            logger.info("Timer paused for room {}", roomId);
        }
    }
    
    /**
     * Resume the timer for a game room.
     * 
     * @param roomId The ID of the game room
     * @param gameRoom The game room object
     */
    public void resumeTimer(String roomId, GameRoom gameRoom) {
        gameRoom.setPaused(false);
        gameRoom.setLastTimeUpdateTimestamp(Instant.now());
        gameRoomRepository.save(gameRoom);
        scheduleTimeout(roomId, gameRoom);
        logger.info("Timer resumed for room {}", roomId);
    }
    
    /**
     * Shutdown the timer manager.
     * This method should be called when the application is shutting down.
     */
    public void shutdown() {
        logger.info("Shutting down GameTimerManager");
        scheduler.shutdownNow();
    }
} 