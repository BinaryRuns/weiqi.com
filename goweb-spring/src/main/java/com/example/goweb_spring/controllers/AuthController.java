package com.example.goweb_spring.controllers;

import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken() {
        logger.info("Verify token endpoint called");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        logger.info("Authentication object: {}", authentication);
        
        // Accept all authenticated users by checking simpler conditions
        if (authentication != null && authentication.isAuthenticated()) {
            String supabaseUserId = authentication.getName();
            logger.info("User is authenticated with Supabase ID: {}", supabaseUserId);
            
            // Check if user exists in our database
            Optional<UserEntity> userEntity = userRepository.findBySupabaseUserId(supabaseUserId);
            boolean userExistsInDatabase = userEntity.isPresent();
            
            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", true);
            response.put("userId", supabaseUserId);
            response.put("existsInDatabase", userExistsInDatabase);
            
            if (userExistsInDatabase) {
                response.put("username", userEntity.get().getUsername());
                response.put("email", userEntity.get().getEmail());
            }
            
            // Return simple 200 OK with appropriate CORS headers
            return ResponseEntity.ok(response);
        }
        
        logger.warn("User is not authenticated. Authentication: {}", authentication);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("authenticated", false, "message", "Not authenticated"));
    }
    
    @PostMapping("/sync-user")
    public ResponseEntity<?> syncUserData(@RequestBody Map<String, Object> userData) {
        logger.info("Sync user endpoint called");
        // This endpoint will be called by the frontend after successful Supabase login
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Attempted to sync user without authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not authenticated"));
        }
        
        String supabaseUserId = authentication.getName();
        String email = (String) userData.get("email");
        String username = (String) userData.get("username"); 
        String avatarUrl = (String) userData.get("avatarUrl");
        String skillLevel = (String) userData.getOrDefault("skillLevel", "beginner");
        
        logger.info("Syncing user data for user ID: {}, email: {}", supabaseUserId, email);
        
        // First check if a user with this email already exists
        if (email != null && !email.isEmpty()) {
            Optional<UserEntity> existingUserByEmail = userRepository.findByEmail(email);
            if (existingUserByEmail.isPresent()) {
                UserEntity existingUser = existingUserByEmail.get();
                logger.warn("User with email {} already exists with different Supabase ID: {} vs {}", 
                    email, existingUser.getSupabaseUserId(), supabaseUserId);
                
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                        "success", false,
                        "message", "User with this email already exists",
                        "existingUserId", existingUser.getSupabaseUserId()
                    ));
            }
        }
        
        // Check if user with this Supabase ID already exists
        Optional<UserEntity> existingUserById = userRepository.findBySupabaseUserId(supabaseUserId);
        
        UserEntity user;
        boolean isNewUser = false;
        
        if (existingUserById.isPresent()) {
            // Update existing user
            user = existingUserById.get();
            logger.info("Updating existing user: {}", user.getUsername());
            if (email != null) user.setEmail(email);
            if (username != null) user.setUsername(username);
            if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
            if (skillLevel != null) user.setSkillLevel(skillLevel);
            user.setLastSyncedAt(LocalDateTime.now());
        } else {
            // Create new user
            isNewUser = true;
            logger.info("Creating new user with Supabase ID: {}", supabaseUserId);
            user = new UserEntity();
            user.setSupabaseUserId(supabaseUserId);
            user.setEmail(email != null ? email : "");
            user.setUsername(username != null ? username : "player_" + supabaseUserId.substring(0, 8));
            user.setAvatarUrl(avatarUrl);
            user.setSkillLevel(skillLevel != null ? skillLevel : "beginner");
        }
        
        try {
            userRepository.save(user);
            logger.info("User successfully synchronized: {}", user.getUsername());
            
            return ResponseEntity.status(isNewUser ? HttpStatus.CREATED : HttpStatus.OK)
                .body(Map.of(
                    "success", true,
                    "userId", supabaseUserId,
                    "username", user.getUsername(),
                    "isNewUser", isNewUser
                ));
        } catch (Exception e) {
            logger.error("Error saving user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Error saving user: " + e.getMessage()
                ));
        }
    }
    
    @RequestMapping(value = "/verify", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleVerifyOptions() {
        logger.info("OPTIONS request to /verify endpoint");
        return ResponseEntity.ok().build();
    }
    
    @RequestMapping(value = "/sync-user", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleSyncUserOptions() {
        logger.info("OPTIONS request to /sync-user endpoint");
        return ResponseEntity.ok().build();
    }
}
