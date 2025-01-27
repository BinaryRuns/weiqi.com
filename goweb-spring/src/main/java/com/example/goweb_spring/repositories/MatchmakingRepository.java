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

    public void enqueue(MatchmakingEntry entry) {
        try {
            String json = objectMapper.writeValueAsString(entry);
            String key = getQueueKey(entry.getTimeControl().name(), entry.getBoardSize().name());
            redisTemplate.opsForZSet().add(key, json, entry.getRating());
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public void remove(MatchmakingEntry entry) {
        try {
            String json = objectMapper.writeValueAsString(entry);
            String key = getQueueKey(entry.getTimeControl().name(), entry.getBoardSize().name());
            redisTemplate.opsForZSet().remove(key, json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public Set<ZSetOperations.TypedTuple<String>> rangeByScore(String timeControl, String boardSize, double min, double max) {
        String key = getQueueKey(timeControl, boardSize);
        return redisTemplate.opsForZSet().rangeByScoreWithScores(key, min, max);
    }
}