package com.example.goweb_spring.dto.webhook.supabase;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Represents the entire payload for the Supabase 'auth.before_user_created' webhook.
 * The nested classes represent the structure of the JSON payload.
 */
@Data
public class BeforeUserCreatedPayload {

    private SupabaseWebhookMetadata metadata;
    private SupabaseUser user;

    /**
     * Nested DTO for the "user" object within the Supabase payload.
     */
    @Data
    public static class SupabaseUser {
        private String id;
        private String aud;
        private String role;
        private String email;
        private String phone;
        
        @JsonProperty("app_metadata")
        private Map<String, Object> appMetadata;
        
        @JsonProperty("user_metadata")
        private Map<String, Object> userMetadata;
        
        private List<Object> identities;
        
        @JsonProperty("created_at")
        private Instant createdAt;
        
        @JsonProperty("updated_at")
        private Instant updatedAt;
        
        @JsonProperty("is_anonymous")
        private boolean isAnonymous;
    }

    /**
     * Nested DTO for the "metadata" object within the Supabase payload.
     */
    @Data
    public static class SupabaseWebhookMetadata {
        private String uuid;
        private String time;
        private String name;
        
        @JsonProperty("ip_address")
        private String ipAddress;
    }
}