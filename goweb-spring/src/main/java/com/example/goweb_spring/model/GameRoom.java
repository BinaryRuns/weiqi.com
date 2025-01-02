package com.example.goweb_spring.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@RedisHash("GameRoom")
public class GameRoom {
    @Id
    private String roomId;
    private String roomName;
    private int maxPlayers;
    private int currentPlayers;
    private Set<String> players = new HashSet<>();

    public GameRoom(String roomId, String roomName, int maxPlayers) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.maxPlayers = maxPlayers;
    }

    public void addPlayer(String userId) {
        players.add(userId);
        currentPlayers = players.size();
    }

    public void removePlayer(String userId) {
        players.remove(userId);
        currentPlayers = players.size();
    }

    public boolean isFull() {
        return players.size() >= maxPlayers;
    }
}