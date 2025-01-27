package com.example.goweb_spring.services;

import com.example.goweb_spring.dto.enums.TimeControl;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.model.MatchmakingEntry;
import com.example.goweb_spring.repositories.MatchmakingRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class MatchMakingService {
    private final MatchmakingRepository matchmakingRepository;
    private final ObjectMapper objectMapper;
    private final GameRoomService gameRoomService;
    private final SimpMessagingTemplate simpMessagingTemplate;


    public MatchMakingService(MatchmakingRepository matchmakingRepository, ObjectMapper objectMapper,
                              GameRoomService gameRoomService, SimpMessagingTemplate simpMessagingTemplate
    ) {
        this.matchmakingRepository = matchmakingRepository;
        this.objectMapper = objectMapper;
        this.gameRoomService = gameRoomService;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public void enqueuePlayer(MatchmakingEntry entry) {
        matchmakingRepository.enqueue(entry);

        String queueKey = "matchmakingQueue:" + entry.getTimeControl().name() + ":" + entry.getBoardSize().name();
        matchmakingRepository.addActiveQueue(queueKey);

        System.out.println("Enqueued " + entry + " in queue: " + queueKey);
    }

    public void removePlayer(MatchmakingEntry entry) {
        matchmakingRepository.remove(entry);
        System.out.println("Removing " + entry);
    }

    private int[] computeDynamicRange(int rating, Instant enqueuedAt) {
        long waitingSeconds = Duration.between(enqueuedAt, Instant.now()).toSeconds();
        int baseOffset = 100;
        int increment = (int) (waitingSeconds / baseOffset);
        int maxOffset = 1000;
        int range = Math.min(baseOffset + increment, maxOffset);
        return new int[]{rating - range, rating + range};
    }


    @Scheduled(fixedRate = 1000)
    public void runMatchmaking() {
        // Retrieve active queue keys dynamically

        Set<String> activeQueues = matchmakingRepository.getActiveQueues();

        if (activeQueues != null) {
            for (String queue : activeQueues) {
                // Parse the key: "matchmakingQueue:{timeControl}:{boardSize}"
                String[] parts = queue.split(":");

                if (parts.length != 3) continue;

                String timeControl = parts[1];
                String boardSize = parts[2];

                processQueueFor(timeControl, boardSize);
            }
        }
    }

    private void processQueueFor(String timeControl, String boardSize) {
        Set<ZSetOperations.TypedTuple<String>> candidates = matchmakingRepository.rangeByScore(
                timeControl, boardSize, 0, Double.MAX_VALUE);

        if (candidates == null) return;

        for (ZSetOperations.TypedTuple<String> candidate : candidates) {
            try {
                MatchmakingEntry playerA = objectMapper.readValue(candidate.getValue(), MatchmakingEntry.class);
                int[] range = computeDynamicRange(playerA.getRating(), playerA.getEnqueuedAt());
                double minRating = range[0];
                double maxRating = range[1];

                Set<ZSetOperations.TypedTuple<String>> potentialOpponents = matchmakingRepository
                        .rangeByScore(timeControl, boardSize, minRating, maxRating);


                for (ZSetOperations.TypedTuple<String> opponentTuple : potentialOpponents) {
                    MatchmakingEntry playerB = objectMapper.readValue(opponentTuple.getValue(), MatchmakingEntry.class);

                    if (playerA.getPlayerId().equals(playerB.getPlayerId())) continue; // If match same player

                    removePlayer(playerB);
                    removePlayer(playerA);

                    System.out.println("Match found between " + playerA.getPlayerId() + " and " + playerB.getPlayerId());
                    createGameSession(playerA, playerB);
                    break;
                }

            } catch (Exception e) {
                System.out.println(e);
            }
        }
    }

    private void createGameSession(MatchmakingEntry playerA, MatchmakingEntry playerB) {
        int boardSize = playerA.getBoardSize().getSize();
        TimeControl timeControl = playerA.getTimeControl();
        List<String> playerIds = List.of(playerA.getPlayerId(), playerB.getPlayerId());
        GameRoom gameRoom = gameRoomService.createGameSession(boardSize, timeControl, playerIds);

        Map<String, Object> payload = Map.of(
                "roomId", gameRoom.getRoomId(),
                "boardSize", gameRoom.getBoardSize(),
                "timeControl", gameRoom.getTimeControl().toString()
        );

        for (String playerId : playerIds) {
            simpMessagingTemplate.convertAndSendToUser(
                    playerId,
                    "/queue/match-found",
                    payload
            );

            System.out.println("Sent to user: " + playerId);
        }
    }
}