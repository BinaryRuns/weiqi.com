package com.example.goweb_spring.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

/**
 * Global exception handler for authentication-related exceptions.
 * Provides consistent error responses for authentication failures across the application.
 */
@ControllerAdvice
public class AuthenticationAdvice {

    /**
     * Handles IllegalStateException thrown when authentication is required but not provided.
     * This is typically thrown by SecurityUtils.requireUserId().
     *
     * @param ex The exception thrown
     * @return A 401 Unauthorized response with a consistent error message
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleAuthenticationException(IllegalStateException ex) {
        if (ex.getMessage().contains("not authenticated")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Authentication required",
                            "error", ex.getMessage()
                    ));
        }
        // Let other IllegalStateExceptions be handled by default handlers
        throw ex;
    }
}