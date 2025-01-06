package com.example.goweb_spring.dto;


import lombok.Getter;

import java.io.Serializable;

@Getter
public enum TimeControl implements Serializable {
    BLITZ("Blitz", 300, 10), // 300 seconds (5 minutes) + 10 seconds increment
    STANDARD("Standard", 600, 30), // 600 seconds (10 minutes) + 30 seconds increment
    CLASSICAL("Classical", 1800,60); // 1800 seconds (30 minutes) + 60 seconds increment

    private final String label;
    private final int initialTime;
    private final int increment;

    TimeControl(String label, int initialTime, int increment) {
        this.label = label;
        this.initialTime = initialTime;
        this.increment = increment;
    }

}
