package com.example.goweb_spring.dto.enums;

import lombok.Getter;

import java.io.Serializable;

/**
 * Enum representing different time control options for Go games.
 * Supports three main timing systems:
 * 1. Fischer - Initial time + increment after each move
 * 2. Japanese Byo-yomi - Initial time + fixed time periods for each move in overtime
 * 3. Canadian Byo-yomi - Initial time + fixed time for a specified number of moves in overtime
 */
@Getter
public enum TimeControl implements Serializable {
    /**
     * Blitz - Fast-paced games with 5 minutes initial time and 10 seconds increment.
     * Uses Fischer timing system.
     */
    BLITZ("Blitz", 300, 10, 0, 0, 0, "fischer"),
    
    /**
     * Standard - Balanced time control with 10 minutes initial time and 30 seconds increment.
     * Uses Fischer timing system.
     */
    STANDARD("Standard", 600, 30, 0, 0, 0, "fischer"),
    
    /**
     * Classical - Traditional timing with 30 minutes initial time and 60 seconds increment.
     * Uses Fischer timing system.
     */
    CLASSICAL("Classical", 1800, 60, 0, 0, 0, "fischer"),
    
    /**
     * Japanese Byo-yomi - 15 minutes main time followed by 30 seconds per move with 5 periods.
     * Common in Asian tournaments.
     */
    JAPANESE("Japanese", 900, 0, 30, 5, 0, "japanese"),
    
    /**
     * Fast Japanese - 5 minutes main time followed by 20 seconds per move with 3 periods.
     * For faster games with Japanese timing.
     */
    FAST_JAPANESE("Fast Japanese", 300, 0, 20, 3, 0, "japanese"),
    
    /**
     * Canadian Byo-yomi - 15 minutes main time followed by 5 minutes for 25 moves.
     * Common in Western tournaments.
     */
    CANADIAN("Canadian", 900, 0, 300, 0, 25, "canadian"),
    
    /**
     * Fast Canadian - 5 minutes main time followed by 3 minutes for 20 moves.
     * For faster games with Canadian timing.
     */
    FAST_CANADIAN("Fast Canadian", 300, 0, 180, 0, 20, "canadian"),
    
    /**
     * TEST - For development and testing purposes only.
     * Very short time control (30 seconds) with no increment.
     * This should not be used in production environments.
     */
    TEST("Test", 30, 0, 0, 0, 0, "simple");
    
    private final String label;
    private final int initialTime;    // Main time in seconds
    private final int increment;      // Fischer increment in seconds
    private final int byoyomiTime;    // Time for byo-yomi period (Japanese) or time for N moves (Canadian)
    private final int byoyomiPeriods; // Number of byo-yomi periods (Japanese only)
    private final int byoyomiMoves;   // Number of moves per byo-yomi period (Canadian only)
    private final String type;        // "fischer", "japanese", "canadian", or "simple"

    TimeControl(String label, int initialTime, int increment, int byoyomiTime, 
                int byoyomiPeriods, int byoyomiMoves, String type) {
        this.label = label;
        this.initialTime = initialTime;
        this.increment = increment;
        this.byoyomiTime = byoyomiTime;
        this.byoyomiPeriods = byoyomiPeriods;
        this.byoyomiMoves = byoyomiMoves;
        this.type = type;
    }
    
    /**
     * Determines if this time control uses Japanese Byo-yomi.
     * @return true if this is a Japanese Byo-yomi time control
     */
    public boolean isJapanese() {
        return "japanese".equals(type);
    }
    
    /**
     * Determines if this time control uses Canadian Byo-yomi.
     * @return true if this is a Canadian Byo-yomi time control
     */
    public boolean isCanadian() {
        return "canadian".equals(type);
    }
    
    /**
     * Determines if this time control uses Fischer time.
     * @return true if this is a Fischer time control
     */
    public boolean isFischer() {
        return "fischer".equals(type);
    }
    
    /**
     * Determines if this time control uses a simple countdown with no overtime.
     * @return true if this is a simple time control
     */
    public boolean isSimple() {
        return "simple".equals(type);
    }
}
