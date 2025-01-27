package com.example.goweb_spring.model;


import com.example.goweb_spring.dto.enums.BoardSize;
import com.example.goweb_spring.dto.enums.TimeControl;
import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.data.redis.core.RedisHash;

import java.io.Serializable;
import java.time.Instant;


@Data
@RedisHash("MatchmakingQueue")
public class MatchmakingEntry implements Serializable {
    @Id
    private String playerId; // Unique identifier for the player
    private int rating; // Player's current rating (e.g., Glicko-2 or Elo)
    private Instant enqueuedAt; // Preferred time control (e.g., "blitz", "rapid")
    private BoardSize boardSize; // Preferred board size (e.g '13x13")
    private TimeControl timeControl; // Timestamp when the player joined the queue


    public MatchmakingEntry(String playerId, int rating, TimeControl timeControl, BoardSize boardSize) {
        this.playerId = playerId;
        this.rating = rating;
        this.timeControl = timeControl;
        this.boardSize = boardSize;
        this.enqueuedAt =  Instant.now();
    }
}
