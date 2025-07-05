package com.example.goweb_spring.dto.enums;


import lombok.Getter;

import java.io.Serializable;

/**
 * Enum representing different time control options for Go games.
 * Each time control specifies the initial time, increment (for Fischer time),
 * byoyomi time (for Japanese time), and number of byoyomi periods.
 */
@Getter
public enum TimeControl implements Serializable {
    /**
     * Blitz - Fast-paced games with 5 minutes initial time and 10 seconds increment.
     * Uses Fischer timing system.
     */
    BLITZ("Blitz", 300, 10, 0, 0, "fischer"),
    
    /**
     * Standard - Balanced time control with 10 minutes initial time and 30 seconds increment.
     * Uses Fischer timing system.
     */
    STANDARD("Standard", 600, 30, 0, 0, "fischer"),
    
    /**
     * Classical - Traditional timing with 30 minutes initial time and 60 seconds increment.
     * Uses Fischer timing system.
     */
    CLASSICAL("Classical", 1800, 60, 0, 0, "fischer"),
    
    /**
     * TEST - For development and testing purposes only.
     * Very short time control (30 seconds) with no increment.
     * This should not be used in production environments.
     */
    TEST("Test", 30, 0, 0, 0, "simple");
    
    private final String label;
    private final int initialTime;
    private final int increment;
    private final int byoyomi;
    private final int byoyomiPeriods;
    private final String type;

    TimeControl(String label, int initialTime, int increment, int byoyomi, int byoyomiPeriods, String type) {
        this.label = label;
        this.initialTime = initialTime;
        this.increment = increment;
        this.byoyomi = byoyomi;
        this.byoyomiPeriods = byoyomiPeriods;
        this.type = type;
    }
}
