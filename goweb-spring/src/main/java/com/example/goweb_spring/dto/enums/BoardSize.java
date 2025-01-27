package com.example.goweb_spring.dto.enums;

import lombok.Data;
import lombok.Getter;

import java.io.Serializable;

@Getter
public enum BoardSize implements Serializable {
    NINE("9x9", 9),
    THIRTEEN("13x13", 13),
    NINETEEN("19x19", 19);

    private final String label;
    private final int size;

    BoardSize(String label, int size) {
        this.label = label;
        this.size = size;
    }

    public static BoardSize fromSize(int size) {
        for (BoardSize boardSize : BoardSize.values()) {
            if (boardSize.size == size) {
                return boardSize;
            }
        }

        throw new IllegalArgumentException("Invalid BoardSize: " + size);
    }

}
