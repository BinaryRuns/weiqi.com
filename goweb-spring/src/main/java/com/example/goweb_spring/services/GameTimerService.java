package com.example.goweb_spring.services;

import com.example.goweb_spring.dto.GameTimerResponse;
import com.example.goweb_spring.exceptions.RoomNotFoundException;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.repositories.GameRoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import java.util.concurrent.Executors;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import java.util.Timer;

@Service
@EnableScheduling
public class GameTimerService {
    private static final Logger logger = LoggerFactory.getLogger(GameTimerService.class);
    private static final int BATCH_SIZE = 20;
    private static final int BROADCAST_INTERVAL_SECONDS = 5;
    
    // Flag to prevent concurrent execution of the scheduled task
    private final AtomicBoolean processingInProgress = new AtomicBoolean(false);
    
    // Maximum number of games to process in one run
    @Value("${game.timer.max-games:1000}")
    private int maxGamesToProcess;
    
    // Maximum execution time for the scheduled task in milliseconds
    @Value("${game.timer.max-execution-time:500}")
    private long maxExecutionTimeMs;

    private final GameRoomRepository gameRoomRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public GameTimerService(GameRoomRepository gameRoomRepository, SimpMessagingTemplate messagingTemplate) {
        this.gameRoomRepository = gameRoomRepository;
        this.messagingTemplate = messagingTemplate;
        logger.info("GameTimerService initialized at: {}", Instant.now());
        System.out.println("CRITICAL: GameTimerService initialized at: " + Instant.now());
    }

    /**
     * Process all active games in batches every second
     */
    @Scheduled(fixedRate = 1000)
    public void processAllActiveGames() {
        
        // Prevent concurrent execution
        if (!processingInProgress.compareAndSet(false, true)) {
            logger.debug("Previous processing still in progress, skipping this run");
            return;
        }
        
        Instant startTime = Instant.now();
        int processedGames = 0;
        
        try {
            // Fetch only active games from the repository, which is much more efficient
            List<GameRoom> activeGames = gameRoomRepository.findByGameOverFalse();

            // The old filtering logic is no longer needed here as it's handled by the repository query.
            // We can apply any additional in-memory filtering if necessary.
            
            processedGames = activeGames.size();
            
            if (activeGames.isEmpty()) {
                return;
            }
            
            logger.debug("Processing {} active games", activeGames.size());
            
            // Process games in batches
            for (int i = 0; i < activeGames.size(); i += BATCH_SIZE) {
                // Check if we've exceeded the maximum execution time
                if (Duration.between(startTime, Instant.now()).toMillis() > maxExecutionTimeMs) {
                    logger.warn("Maximum execution time exceeded, processed {}/{} games", 
                               i, activeGames.size());
                    break;
                }
                
                int end = Math.min(i + BATCH_SIZE, activeGames.size());
                processGameBatch(activeGames.subList(i, end));
            }
        } catch (Exception e) {
            logger.error("Error processing active games", e);
        } finally {
            processingInProgress.set(false);
            long executionTime = Duration.between(startTime, Instant.now()).toMillis();
            logger.debug("Processed {} games in {}ms", processedGames, executionTime);
        }
    }

    /**
     * Process a batch of games
     */
    private void processGameBatch(List<GameRoom> games) {
        if (games == null || games.isEmpty()) {
            return;
        }
        
        List<GameRoom> gamesNeedingSave = new ArrayList<>();
        
        for (GameRoom game : games) {
            try {
                if (game == null) {
                    continue;
                }
                
                // Skip games that are already over
                if (game.isGameOver()) {
                    continue;
                }
                
                // Update timers
                game.updateTimers();
                
                // Add debug logging for timer values
                logger.debug("Game {} - Black time: {}, White time: {}, Current player: {}, Timeout check: {}", 
                    game.getRoomId(), game.getBlackTime(), game.getWhiteTime(), 
                    game.getCurrentPlayerColor(), game.isTimeout());
                
                // Check for timeouts
                if (game.isTimeout()) {
                    logger.info("--> SENDING timeout for {}", game.getRoomId());   // add temporarily
                    handleTimeout(game);
                    gamesNeedingSave.add(game);
                    continue;
                }
                
                // Send updates every few seconds
                if (shouldBroadcastUpdate(game)) {
                    sendTimerUpdate(game);
                    game.setLastBroadcastTimestamp(Instant.now());
                    gamesNeedingSave.add(game);
                }
            } catch (Exception e) {
                logger.error("Error processing game {}: {}", 
                            game != null ? game.getRoomId() : "null", 
                            e.getMessage());
            }
        }
        
        // Batch save games that were modified
        if (!gamesNeedingSave.isEmpty()) {
            try {
                gameRoomRepository.saveAll(gamesNeedingSave);
            } catch (Exception e) {
                logger.error("Error saving {} games: {}", gamesNeedingSave.size(), e.getMessage());
                
                // Fallback: try to save games one by one
                for (GameRoom game : gamesNeedingSave) {
                    try {
                        gameRoomRepository.save(game);
                    } catch (Exception ex) {
                        logger.error("Error saving game {}: {}", game.getRoomId(), ex.getMessage());
                    }
                }
            }
        }
    }
    
    /**
     * Determine if we should broadcast an update for this game
     */
    private boolean shouldBroadcastUpdate(GameRoom game) {
        if (game == null || game.getLastBroadcastTimestamp() == null) {
            return false;
        }
        
        return ChronoUnit.SECONDS.between(game.getLastBroadcastTimestamp(), Instant.now()) 
            >= BROADCAST_INTERVAL_SECONDS;
    }

    /**
     * Handle a game timeout
     */
    private void handleTimeout(GameRoom game) {
        if (game == null) {
            logger.error("Attempted to handle timeout for null game");
            return;
        }
        
        // Add detailed logging about the game state
        logger.info("Handling timeout for game {} - Black time: {}, White time: {}, Current player: {}, GameOver: {}", 
            game.getRoomId(), game.getBlackTime(), game.getWhiteTime(), 
            game.getCurrentPlayerColor(), game.isGameOver());
        
        // Check if game is already marked as over to prevent duplicate notifications
        if (game.isGameOver()) {
            logger.debug("Game {} is already marked as over, skipping timeout handling", game.getRoomId());
            return;
        }
        
        String winner = game.getTimeoutWinner();
        
        // Mark the game as over
        game.endGameByTimeout();
        
        try {
            // Send timeout notification
            messagingTemplate.convertAndSend(
                    "/topic/game/" + game.getRoomId() + "/timeout",
                    Map.of("winner", winner)
            );
            
            // Send final timer update
            sendTimerUpdate(game);
            
            logger.info("Game {} timed out. Winner: {}", game.getRoomId(), winner);
        } catch (Exception e) {
            logger.error("Error sending timeout notification for game {}: {}", 
                        game.getRoomId(), e.getMessage());
        }
    }

    /**
     * Send timer update to clients
     */
    public void sendTimerUpdate(GameRoom game) {
        if (game == null) {
            return;
        }
        
        try {
            messagingTemplate.convertAndSend(
                    "/topic/game/" + game.getRoomId() + "/timer",
                    new GameTimerResponse(game.getBlackTime(), game.getWhiteTime())
            );
        } catch (Exception e) {
            logger.error("Error sending timer update for game {}: {}", 
                        game.getRoomId(), e.getMessage());
        }
    }

    /**
     * Send immediate timer update for a specific game
     */
    public void sendImmediateTimerUpdate(String gameId) {
        if (gameId == null || gameId.isEmpty()) {
            logger.warn("Attempted to send timer update for null or empty game ID");
            return;
        }
        
        try {
            GameRoom game = gameRoomRepository.findById(gameId)
                    .orElseThrow(() -> new RoomNotFoundException("Room not found: " + gameId));
            
            game.updateTimers();
            sendTimerUpdate(game);
            game.setLastBroadcastTimestamp(Instant.now());
            gameRoomRepository.save(game);
        } catch (RoomNotFoundException e) {
            logger.warn("Room not found for immediate timer update: {}", gameId);
        } catch (Exception e) {
            logger.error("Error sending immediate timer update for game {}: {}", 
                        gameId, e.getMessage());
        }
    }
} 