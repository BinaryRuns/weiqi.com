package com.example.goweb_spring.exceptions;

/**
 * Exception thrown when validation of input data fails.
 */
public class ValidationException extends RuntimeException {
    
    public ValidationException(String message) {
        super(message);
    }
    
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
} 