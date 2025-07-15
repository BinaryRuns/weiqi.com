package com.example.goweb_spring.controllers;

import com.example.goweb_spring.dto.webhook.supabase.SupabaseInsertPayload;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.services.UserService;
import com.example.goweb_spring.utils.WebhookUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller for handling webhook requests from external services.
 */
@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private static final Logger logger = LoggerFactory.getLogger(WebhookController.class);
    
    private final WebhookUtils webhookUtils;
    private final ObjectMapper objectMapper;
    private final UserService userService;
    
    @Value("${SUPABASE_BEFORE_USER_CREATED_SECRET}")
    private String supabaseSecret;
    
    @Autowired
    public WebhookController(WebhookUtils webhookUtils, ObjectMapper objectMapper, UserService userService) {
        this.webhookUtils = webhookUtils;
        this.objectMapper = objectMapper;
        this.userService = userService;
    }
    
    /**
     * Endpoint for handling the Supabase 'Before User Created' webhook.
     * This endpoint will be called by Supabase before a user is created.
     * 
     * @param payload The raw request body
     * @param headers The request headers including signature header from Supabase
     * @return 200 OK if the user creation is allowed, or an error response if not
     */
    @PostMapping("/supabase/before-user-created")
    public ResponseEntity<?> handleBeforeUserCreated(
            @RequestBody String payload,
            @RequestHeader Map<String, String> headers) {
        
        logger.info("Received webhook request at /api/webhooks/supabase/before-user-created");
        
        // Log headers for debugging (redact any sensitive values)
        logger.info("Webhook headers: {}", headers.entrySet().stream()
            .filter(e -> !e.getKey().toLowerCase().contains("secret") && !e.getKey().toLowerCase().contains("auth"))
            .collect(java.util.stream.Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)));
            
        // Check for required headers
        if (!headers.containsKey("webhook-signature") || !headers.containsKey("webhook-timestamp")) {
            logger.error("Missing required webhook headers. Required: webhook-signature, webhook-timestamp");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Missing required webhook headers"));
        }
        
        try {
            // Verify the webhook signature
            try {
                // Ensure the secret is properly formatted (without prefix)
                String cleanSecret = supabaseSecret;
                if (cleanSecret.startsWith("v1,whsec_")) {
                    cleanSecret = cleanSecret.replace("v1,whsec_", "");
                    logger.info("Stripped prefix from webhook secret");
                }
                
                // Use the new verifyStandardWebhook method that takes the headers map
                webhookUtils.verifyStandardWebhook(payload, headers, cleanSecret);
            } catch (WebhookUtils.WebhookVerificationException e) {
                logger.error("Webhook verification failed", e);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid signature"));
            }
            
            // Parse the payload into our DTO
            SupabaseInsertPayload webhookPayload = objectMapper.readValue(payload, SupabaseInsertPayload.class);
            
            // Log the user information
            logger.info("User creation request for email: {}", webhookPayload.getRecord().getEmail());
            
            // Pass the user record directly to the UserService
            SupabaseInsertPayload.UserRecord userRecord = webhookPayload.getRecord();
            
            // Create the user in our database
            UserEntity createdUser = userService.createUserFromWebhook(userRecord);
            
            if (createdUser == null) {
                // If user creation failed, return an error to prevent Supabase from creating the user
                logger.error("Failed to create user in database for email: {}", webhookPayload.getRecord().getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                            "error", Map.of(
                                "message", "Failed to create user in database",
                                "http_code", 400
                            )
                        ));
            }
            
            // User was created successfully, allow Supabase to proceed with auth user creation
            // Returning an empty object with a 200 or 204 status code allows the request to proceed
            logger.info("User created successfully: {}", createdUser.getUsername());
            return ResponseEntity.ok(Map.of());
            
        } catch (Exception e) {
            logger.error("Error processing webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}