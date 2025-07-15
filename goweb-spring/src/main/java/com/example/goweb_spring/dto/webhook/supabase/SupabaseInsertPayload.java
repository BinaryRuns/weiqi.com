package com.example.goweb_spring.dto.webhook.supabase;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.Instant;
import java.util.Map;

/**
 * Represents the payload for Supabase database insert webhook events.
 */
@Data
public class SupabaseInsertPayload {
    private String type;
    private String table;
    private UserRecord record;
    private String schema;
    
    @JsonProperty("old_record")
    private Object oldRecord;
    
    /**
     * Nested DTO for the "record" object within the Supabase payload.
     */
    @Data
    public static class UserRecord {
        private String id;
        private String aud;
        private String role;
        private String email;
        private String phone;
        
        @JsonProperty("created_at")
        private String createdAt;
        
        @JsonProperty("deleted_at")
        private String deletedAt;
        
        @JsonProperty("invited_at")
        private String invitedAt;
        
        @JsonProperty("updated_at")
        private String updatedAt;
        
        @JsonProperty("instance_id")
        private String instanceId;
        
        @JsonProperty("is_sso_user")
        private Boolean isSsoUser;
        
        @JsonProperty("banned_until")
        private String bannedUntil;
        
        @JsonProperty("confirmed_at")
        private String confirmedAt;
        
        @JsonProperty("email_change")
        private String emailChange;
        
        @JsonProperty("is_anonymous")
        private Boolean isAnonymous;
        
        @JsonProperty("phone_change")
        private String phoneChange;
        
        @JsonProperty("is_super_admin")
        private Boolean isSuperAdmin;
        
        @JsonProperty("recovery_token")
        private String recoveryToken;
        
        @JsonProperty("last_sign_in_at")
        private String lastSignInAt;
        
        @JsonProperty("recovery_sent_at")
        private String recoverySentAt;
        
        @JsonProperty("raw_app_meta_data")
        private Map<String, Object> rawAppMetaData;
        
        @JsonProperty("confirmation_token")
        private String confirmationToken;
        
        @JsonProperty("email_confirmed_at")
        private String emailConfirmedAt;
        
        @JsonProperty("encrypted_password")
        private String encryptedPassword;
        
        @JsonProperty("phone_change_token")
        private String phoneChangeToken;
        
        @JsonProperty("phone_confirmed_at")
        private String phoneConfirmedAt;
        
        @JsonProperty("raw_user_meta_data")
        private Map<String, Object> rawUserMetaData;
        
        @JsonProperty("confirmation_sent_at")
        private String confirmationSentAt;
        
        @JsonProperty("email_change_sent_at")
        private String emailChangeSentAt;
        
        @JsonProperty("phone_change_sent_at")
        private String phoneChangeSentAt;
        
        @JsonProperty("email_change_token_new")
        private String emailChangeTokenNew;
        
        @JsonProperty("reauthentication_token")
        private String reauthenticationToken;
        
        @JsonProperty("reauthentication_sent_at")
        private String reauthenticationSentAt;
        
        @JsonProperty("email_change_token_current")
        private String emailChangeTokenCurrent;
        
        @JsonProperty("email_change_confirm_status")
        private Integer emailChangeConfirmStatus;
    }
} 