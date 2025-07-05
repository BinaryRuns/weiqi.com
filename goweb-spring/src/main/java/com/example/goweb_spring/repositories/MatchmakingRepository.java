package com.example.goweb_spring.repositories;


import com.example.goweb_spring.dto.enums.TimeControl;
import com.example.goweb_spring.model.MatchmakingEntry;
import com.example.goweb_spring.services.GameRoomService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public class MatchmakingRepository {
    private static final String QUEUE_KEY_PREFIX = "matchmakingQueue:";
    private static final String ACTIVE_QUEUES_KEY = "activeMatchmakingQueues";
    private static final String PLAYER_ENTRIES_KEY = "matchmakingPlayerEntries";
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;


    public MatchmakingRepository(RedisTemplate<String, String> redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    private String getQueueKey(String timeControl, String boardSize) {
        return QUEUE_KEY_PREFIX + timeControl + ":" + boardSize;
    }

    public void addActiveQueue(String key) {
        redisTemplate.opsForSet().add(ACTIVE_QUEUES_KEY, key);
    }

    public Set<String> getActiveQueues() {
        return redisTemplate.opsForSet().members(ACTIVE_QUEUES_KEY);
    }

    public void removeActiveQueue(String key) {
        redisTemplate.opsForSet().remove(ACTIVE_QUEUES_KEY, key);
    }

    /**
     * Adds a matchmaking entry to the appropriate Redis sorted set queue and stores its JSON representation in a Redis hash keyed by player ID.
     *
     * @param entry the matchmaking entry to enqueue
     * @throws RuntimeException if JSON serialization of the entry fails
     */
    public void enqueue(MatchmakingEntry entry) {
        try {
            String json = objectMapper.writeValueAsString(entry);
            String key = getQueueKey(entry.getTimeControl().name(), entry.getBoardSize().name());
            redisTemplate.opsForZSet().add(key, json, entry.getRating());
            
            // Store the entry by player ID for easy retrieval during cancellation
            storePlayerEntry(entry.getPlayerId(), json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Removes a matchmaking entry from both the corresponding Redis sorted set queue and the player entries hash.
     *
     * @param entry the matchmaking entry to remove
     * @throws RuntimeException if JSON serialization of the entry fails
     */
    public void remove(MatchmakingEntry entry) {
        try {
            String json = objectMapper.writeValueAsString(entry);
            String key = getQueueKey(entry.getTimeControl().name(), entry.getBoardSize().name());
            redisTemplate.opsForZSet().remove(key, json);
            
            // Remove the entry from the player entries hash
            removePlayerEntry(entry.getPlayerId());
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Stores or updates the JSON representation of a player's matchmaking entry in Redis, indexed by player ID.
     *
     * @param playerId   the unique identifier of the player
     * @param entryJson  the JSON string representing the player's matchmaking entry
     */
    public void storePlayerEntry(String playerId, String entryJson) {
        redisTemplate.opsForHash().put(PLAYER_ENTRIES_KEY, playerId, entryJson);
    }
    
    /**
     * Retrieves the JSON representation of a matchmaking entry for the specified player ID from Redis.
     *
     * @param playerId the unique identifier of the player
     * @return the JSON string of the player's matchmaking entry, or null if not found
     */
    public String getPlayerEntry(String playerId) {
        return (String) redisTemplate.opsForHash().get(PLAYER_ENTRIES_KEY, playerId);
    }
    
    /**
     * Removes the matchmaking entry for the specified player from the Redis hash.
     *
     * @param playerId the unique identifier of the player whose entry should be removed
     */
    public void removePlayerEntry(String playerId) {
        redisTemplate.opsForHash().delete(PLAYER_ENTRIES_KEY, playerId);
    }
    
    /**
     * Retrieves matchmaking entries from the Redis sorted set for the specified time control and board size,
     * where the entry scores (typically player ratings) fall within the given range.
     *
     * @param timeControl the time control category of the queue
     * @param boardSize the board size category of the queue
     * @param min the minimum score (inclusive)
     * @param max the maximum score (inclusive)
     * @return a set of typed tuples containing entry JSON strings and their associated scores
     */
    public Set<ZSetOperations.TypedTuple<String>> rangeByScore(String timeControl, String boardSize, double min, double max) {
        String key = getQueueKey(timeControl, boardSize);
        return redisTemplate.opsForZSet().rangeByScoreWithScores(key, min, max);
    }
}