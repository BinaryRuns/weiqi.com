package com.example.goweb_spring.services;

import com.example.goweb_spring.dto.GameTimerResponse;
import com.example.goweb_spring.exceptions.RoomNotFoundException;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.repositories.GameRoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@EnableScheduling
public class GameTimerService {
    private static final Logger logger = LoggerFactory.getLogger(GameTimerService.class);
    private static final int BATCH_SIZE = 20;
    private static final int BROADCAST_INTERVAL_SECONDS = 5;

    private final GameRoomRepository gameRoomRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public GameTimerService(GameRoomRepository gameRoomRepository, SimpMessagingTemplate messagingTemplate) {
        this.gameRoomRepository = gameRoomRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Process all active games in batches every second
     */
    @Scheduled(fixedRate = 1000)
    public void processAllActiveGames() {
        try {
            // Get all game rooms from repository
            Iterable<GameRoom> allRooms = gameRoomRepository.findAll();
            
            // Filter for active games (games with players)
            List<GameRoom> activeGames = StreamSupport.stream(allRooms.spliterator(), false)
                    .filter(room -> room.getCurrentPlayers() > 0)
                    .collect(Collectors.toList());
            
            if (activeGames.isEmpty()) {
                return;
            }
            
            logger.debug("Processing {} active games", activeGames.size());
            
            // Process games in batches
            for (int i = 0; i < activeGames.size(); i += BATCH_SIZE) {
                int end = Math.min(i + BATCH_SIZE, activeGames.size());
                processGameBatch(activeGames.subList(i, end));
            }
        } catch (Exception e) {
            logger.error("Error processing active games", e);
        }
    }

    /**
     * Process a batch of games
     */
    private void processGameBatch(List<GameRoom> games) {
        List<GameRoom> gamesNeedingSave = new ArrayList<>();
        
        for (GameRoom game : games) {
            try {
                // Update timers
                game.updateTimers();
                
                // Check for timeouts
                if (game.isTimeout()) {
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
                logger.error("Error processing game {}", game.getRoomId(), e);
            }
        }
        
        // Batch save games that were modified
        if (!gamesNeedingSave.isEmpty()) {
            gameRoomRepository.saveAll(gamesNeedingSave);
        }
    }
    
    /**
     * Determine if we should broadcast an update for this game
     */
    private boolean shouldBroadcastUpdate(GameRoom game) {
        if (game.getLastBroadcastTimestamp() == null) {
            return true;
        }
        
        return ChronoUnit.SECONDS.between(game.getLastBroadcastTimestamp(), Instant.now()) 
            >= BROADCAST_INTERVAL_SECONDS;
    }

    /**
     * Handle a game timeout
     */
    private void handleTimeout(GameRoom game) {
        String winner = game.getTimeoutWinner();
        
        // Send timeout notification
        messagingTemplate.convertAndSend(
                "/topic/game/" + game.getRoomId() + "/timeout",
                Map.of("winner", winner)
        );
        
        // Send final timer update
        sendTimerUpdate(game);
        
        logger.info("Game {} timed out. Winner: {}", game.getRoomId(), winner);
    }

    /**
     * Send timer update to clients
     */
    public void sendTimerUpdate(GameRoom game) {
        messagingTemplate.convertAndSend(
                "/topic/game/" + game.getRoomId() + "/timer",
                new GameTimerResponse(game.getBlackTime(), game.getWhiteTime())
        );
    }

    /**
     * Send immediate timer update for a specific game
     */
    public void sendImmediateTimerUpdate(String gameId) {
        try {
            GameRoom game = gameRoomRepository.findById(gameId)
                    .orElseThrow(() -> new RoomNotFoundException("Room not found: " + gameId));
            
            game.updateTimers();
            sendTimerUpdate(game);
            game.setLastBroadcastTimestamp(Instant.now());
            gameRoomRepository.save(game);
        } catch (Exception e) {
            logger.error("Error sending immediate timer update for game {}", gameId, e);
        }
    }
} 