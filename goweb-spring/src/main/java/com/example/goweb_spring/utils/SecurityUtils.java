package com.example.goweb_spring.utils;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

/**
 * Utility class for security and authentication-related operations.
 * Provides common methods for controllers to handle authentication checks and user ID extraction.
 */
@Component
public class SecurityUtils {

    /**
     * Gets the current authenticated user ID.
     *
     * @return Optional containing the user ID if authenticated, empty otherwise
     */
    public Optional<String> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            return Optional.of(authentication.getName());
        }
        return Optional.empty();
    }

    /**
     * Checks if a user is authenticated.
     *
     * @return true if the user is authenticated, false otherwise
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken);
    }

    /**
     * Gets the current authenticated user ID or throws an exception if not authenticated.
     *
     * @return The authenticated user ID
     * @throws IllegalStateException if the user is not authenticated
     */
    public String requireUserId() {
        return getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));
    }

    /**
     * Executes an authenticated action, returning an unauthorized response if not authenticated.
     *
     * @param action The action to execute if authenticated
     * @return The result of the action if authenticated, or an unauthorized response
     */
    public ResponseEntity<?> withAuthentication(Function<String, ResponseEntity<?>> action) {
        return getCurrentUserId()
                .map(action)
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Not authenticated")));
    }
}