package com.example.goweb_spring.services;

import com.example.goweb_spring.model.GameRoom;

import java.util.*;

public class GoGameLogic {
    /**
     * Validates if a move is legal on the board
     * @param stones Current board state
     * @param x X coordinate of the move
     * @param y Y coordinate of the move
     * @param color Color of the stone being placed ("black" or "white")
     * @return true if move is legal, false otherwise
     */
    public static boolean isValidMove(List<List<Integer>> stones, int x, int y, String color) {
        int boardSize = stones.size();
        int playerVal = color.equals("black") ? 1 : 2;
        
        // Check if position is already occupied
        if (stones.get(y).get(x) != 0) {
            return false;
        }
        
        // Temporarily place the stone
        stones.get(y).set(x, playerVal);
        
        // Check for suicide rule
        boolean hasLiberties = hasLiberties(stones, x, y);
        
        // Check if the move captures any opponent stones
        boolean capturesOpponent = checkForCaptures(stones, x, y, color);
        
        // Remove the temporary stone
        stones.get(y).set(x, 0);
        
        // Move is valid if it either has liberties or captures opponent stones
        return hasLiberties || capturesOpponent;
    }
    
    /**
     * Checks if a group of stones has any liberties (empty adjacent points)
     */
    private static boolean hasLiberties(List<List<Integer>> stones, int x, int y) {
        int boardSize = stones.size();
        int stoneColor = stones.get(y).get(x);
        Set<String> visited = new HashSet<>();
        return checkLibertiesRecursive(stones, x, y, stoneColor, visited);
    }
    
    private static boolean checkLibertiesRecursive(List<List<Integer>> stones, int x, int y, 
                                                 int stoneColor, Set<String> visited) {
        int boardSize = stones.size();
        String pos = x + "," + y;
        
        if (visited.contains(pos)) {
            return false;
        }
        visited.add(pos);
        
        // Check adjacent positions
        int[][] directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        for (int[] dir : directions) {
            int newX = x + dir[0];
            int newY = y + dir[1];
            
            if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
                int adjacent = stones.get(newY).get(newX);
                if (adjacent == 0) {
                    return true; // Found a liberty
                }
                if (adjacent == stoneColor && 
                    checkLibertiesRecursive(stones, newX, newY, stoneColor, visited)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Checks if a move results in capturing opponent stones
     */
    private static boolean checkForCaptures(List<List<Integer>> stones, int x, int y, String color) {
        int boardSize = stones.size();
        int opponentVal = color.equals("black") ? 2 : 1;
        boolean captured = false;
        
        int[][] directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        for (int[] dir : directions) {
            int newX = x + dir[0];
            int newY = y + dir[1];
            
            if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
                if (stones.get(newY).get(newX) == opponentVal && !hasLiberties(stones, newX, newY)) {
                    captured = true;
                    removeGroup(stones, newX, newY);
                }
            }
        }
        return captured;
    }
    
    /**
     * Removes a captured group of stones from the board
     */
    private static void removeGroup(List<List<Integer>> stones, int x, int y) {
        int stoneColor = stones.get(y).get(x);
        Set<String> visited = new HashSet<>();
        removeGroupRecursive(stones, x, y, stoneColor, visited);
    }
    
    private static void removeGroupRecursive(List<List<Integer>> stones, int x, int y, 
                                           int stoneColor, Set<String> visited) {
        int boardSize = stones.size();
        String pos = x + "," + y;
        
        if (visited.contains(pos)) {
            return;
        }
        visited.add(pos);
        
        stones.get(y).set(x, 0); // Remove stone
        
        int[][] directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        for (int[] dir : directions) {
            int newX = x + dir[0];
            int newY = y + dir[1];
            
            if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
                if (stones.get(newY).get(newX) == stoneColor) {
                    removeGroupRecursive(stones, newX, newY, stoneColor, visited);
                }
            }
        }
    }
    
    /**
     * Determines the winner based on board position and time
     * @param gameRoom Current game room state
     * @return Map containing winner and score information
     */
    public static Map<String, Object> determineWinner(GameRoom gameRoom) {
        Map<String, Object> result = new HashMap<>();
        
        // Check for time-based win
        if (gameRoom.getBlackTime() <= 0) {
            result.put("winner", "white");
            result.put("winType", "timeout");
            return result;
        }
        if (gameRoom.getWhiteTime() <= 0) {
            result.put("winner", "black");
            result.put("winType", "timeout");
            return result;
        }
        
        // Calculate territory
        Map<String, Integer> territory = calculateTerritory(gameRoom.getStones());
        result.put("blackTerritory", territory.get("black"));
        result.put("whiteTerritory", territory.get("white"));
        
        // Add komi (compensation points for white)
        double whiteScore = territory.get("white") + 6.5; // Standard komi value
        
        if (territory.get("black") > whiteScore) {
            result.put("winner", "black");
        } else {
            result.put("winner", "white");
        }
        result.put("winType", "territory");
        
        return result;
    }
    
    /**
     * Calculates territory controlled by each player
     */
    private static Map<String, Integer> calculateTerritory(List<List<Integer>> stones) {
        int boardSize = stones.size();
        int blackTerritory = 0;
        int whiteTerritory = 0;
        Set<String> visited = new HashSet<>();
        
        for (int y = 0; y < boardSize; y++) {
            for (int x = 0; x < boardSize; x++) {
                if (stones.get(y).get(x) == 0 && !visited.contains(x + "," + y)) {
                    Map<String, Object> regionInfo = analyzeRegion(stones, x, y, visited);
                    if (regionInfo.get("owner").equals("black")) {
                        blackTerritory += (int) regionInfo.get("size");
                    } else if (regionInfo.get("owner").equals("white")) {
                        whiteTerritory += (int) regionInfo.get("size");
                    }
                }
            }
        }
        
        return Map.of("black", blackTerritory, "white", whiteTerritory);
    }
    
    /**
     * Analyzes an empty region to determine its owner
     */
    private static Map<String, Object> analyzeRegion(List<List<Integer>> stones, int x, int y, 
                                                    Set<String> visited) {
        int boardSize = stones.size();
        Set<String> region = new HashSet<>();
        Set<Integer> borderingColors = new HashSet<>();
        Queue<int[]> queue = new LinkedList<>();
        queue.offer(new int[]{x, y});
        
        while (!queue.isEmpty()) {
            int[] current = queue.poll();
            String pos = current[0] + "," + current[1];
            
            if (visited.contains(pos)) {
                continue;
            }
            
            visited.add(pos);
            region.add(pos);
            
            int[][] directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
            for (int[] dir : directions) {
                int newX = current[0] + dir[0];
                int newY = current[1] + dir[1];
                
                if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
                    int stone = stones.get(newY).get(newX);
                    if (stone == 0) {
                        queue.offer(new int[]{newX, newY});
                    } else {
                        borderingColors.add(stone);
                    }
                }
            }
        }
        
        String owner = "neutral";
        if (borderingColors.size() == 1) {
            owner = borderingColors.contains(1) ? "black" : "white";
        }
        
        return Map.of("owner", owner, "size", region.size());
    }
}