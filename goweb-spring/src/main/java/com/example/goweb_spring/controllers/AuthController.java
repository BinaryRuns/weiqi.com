package com.example.goweb_spring.controllers;

import com.example.goweb_spring.annotations.RequiresAuthentication;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.repositories.UserRepository;
import com.example.goweb_spring.services.UserService;
import com.example.goweb_spring.utils.SecurityUtils;
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
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final UserService userService;
    
    public AuthController(UserRepository userRepository, SecurityUtils securityUtils, UserService userService) {
        this.userRepository = userRepository;
        this.securityUtils = securityUtils;
        this.userService = userService;
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken() {
        logger.info("Verify token endpoint called");
        
        if (securityUtils.isAuthenticated()) {
            String supabaseUserId = securityUtils.requireUserId();
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
        
        logger.warn("User is not authenticated.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("authenticated", false, "message", "Not authenticated"));
    }
    

    /**
     * Creates a new user in the database based on Supabase authentication data.
     * This endpoint is deprecated and will be removed in a future version.
     * User creation is now handled automatically by the webhook system.
     */
    @PostMapping("/create-user")
    @RequiresAuthentication
    @Deprecated
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData) {
        logger.info("Create user endpoint called (DEPRECATED)");
        String supabaseUserId = securityUtils.requireUserId();
        
        // Check if user already exists
        Optional<UserEntity> existingUser = userRepository.findBySupabaseUserId(supabaseUserId);
        if (existingUser.isPresent()) {
            logger.warn("User already exists with Supabase ID: {}", supabaseUserId);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                        "success", false,
                        "message", "User already exists",
                        "userId", supabaseUserId,
                        "username", existingUser.get().getUsername()
                    ));
        }
        
        // Delegate to the UserService
        UserEntity createdUser = userService.createUserFromRequest(userData, supabaseUserId);
        
        if (createdUser == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Failed to create user"));
        }
        
        logger.info("User successfully created: {}", createdUser.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of(
                "success", true,
                "userId", supabaseUserId,
                "username", createdUser.getUsername(),
                "isNewUser", true
            ));
    }
    
    /**
     * Updates an existing user's profile data.
     * This endpoint should be used for profile updates after initial creation.
     */
    @PatchMapping("/update-user")
    @RequiresAuthentication
    public ResponseEntity<?> updateUser(@RequestBody Map<String, Object> userData) {
        logger.info("Update user endpoint called");
        String supabaseUserId = securityUtils.requireUserId();
        
        // Find the existing user
        Optional<UserEntity> existingUserOpt = userRepository.findBySupabaseUserId(supabaseUserId);
        if (existingUserOpt.isEmpty()) {
            logger.warn("User not found with Supabase ID: {}", supabaseUserId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        }
        
        UserEntity existingUser = existingUserOpt.get();
        
        // Update only the fields that are provided
        if (userData.containsKey("username")) {
            String newUsername = (String) userData.get("username");
            if (newUsername != null && !newUsername.equals(existingUser.getUsername())) {
                // Check if username is already taken
                if (userRepository.findByUsername(newUsername).isPresent()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of(
                                "success", false,
                                "message", "Username already taken",
                                "field", "username"
                            ));
                }
                existingUser.setUsername(newUsername);
            }
        }
        
        if (userData.containsKey("avatarUrl")) {
            String avatarUrl = (String) userData.get("avatarUrl");
            existingUser.setAvatarUrl(avatarUrl);
        }
        
        if (userData.containsKey("skillLevel")) {
            String skillLevel = (String) userData.get("skillLevel");
            if (skillLevel != null) {
                existingUser.setSkillLevel(skillLevel);
            }
        }
        
        // Always update the last synced timestamp
        existingUser.setLastSyncedAt(LocalDateTime.now());
        
        try {
            userRepository.save(existingUser);
            logger.info("User successfully updated: {}", existingUser.getUsername());
            
            return ResponseEntity.ok()
                    .body(Map.of(
                        "success", true,
                        "userId", supabaseUserId,
                        "username", existingUser.getUsername()
                    ));
        } catch (Exception e) {
            logger.error("Error updating user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "success", false,
                        "message", "Error updating user: " + e.getMessage()
                    ));
        }
    }
    
    /**
     * Legacy endpoint for backward compatibility.
     * Determines whether to create or update a user based on existence.
     */
    /**
     * Legacy endpoint for backward compatibility.
     * This endpoint is deprecated and will be removed in a future version.
     * User creation is now handled automatically by the webhook system.
     */
    @PostMapping("/sync-user")
    @RequiresAuthentication
    @Deprecated
    public ResponseEntity<?> syncUserData(@RequestBody Map<String, Object> userData) {
        logger.info("Sync user endpoint called (DEPRECATED)");
        String supabaseUserId = securityUtils.requireUserId();
        
        // Check if user exists to determine whether to create or update
        Optional<UserEntity> existingUser = userRepository.findBySupabaseUserId(supabaseUserId);
        
        if (existingUser.isPresent()) {
            // Just update the last synced timestamp for existing users
            UserEntity user = existingUser.get();
            user.setLastSyncedAt(LocalDateTime.now());
            userRepository.save(user);
            
            return ResponseEntity.ok()
                .body(Map.of(
                    "success", true,
                    "userId", supabaseUserId,
                    "username", user.getUsername(),
                    "isNewUser", false
                ));
        } else {
            // For new users, delegate to the create-user endpoint
            return createUser(userData);
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
    
    @RequestMapping(value = "/create-user", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleCreateUserOptions() {
        logger.info("OPTIONS request to /create-user endpoint");
        return ResponseEntity.ok().build();
    }
    
    @RequestMapping(value = "/update-user", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleUpdateUserOptions() {
        logger.info("OPTIONS request to /update-user endpoint");
        return ResponseEntity.ok().build();
    }
    
    /**
     * @deprecated This method is deprecated and will be removed in a future version.
     * Username generation is now handled by the UserService.
     */
    @Deprecated
    private String generateUniqueUsername(String baseUsername, String supabaseUserId) {
        return userService.generateUniqueUsername(baseUsername, supabaseUserId);
    }
}
