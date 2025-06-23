package com.example.goweb_spring.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken() {
        logger.info("Verify token endpoint called");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        logger.info("Authentication object: {}", authentication);
        
        // Accept all authenticated users by checking simpler conditions
        if (authentication != null && authentication.isAuthenticated()) {
            String userId = authentication.getName();
            logger.info("User is authenticated: {}", userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", true);
            response.put("userId", userId);
            
            // Return simple 200 OK with appropriate CORS headers
            return ResponseEntity.ok(response);
        }
        
        logger.warn("User is not authenticated. Authentication: {}", authentication);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("authenticated", false, "message", "Not authenticated"));
    }
    
    @RequestMapping(value = "/verify", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleVerifyOptions() {
        logger.info("OPTIONS request to /verify endpoint");
        return ResponseEntity.ok().build();
    }
}
