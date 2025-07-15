package com.example.goweb_spring.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Map;

/**
 * Utility class for webhook-related operations, particularly signature verification.
 * This implements StandardWebhooks verification (used by Supabase).
 */
@Component
public class WebhookUtils {
    private static final Logger logger = LoggerFactory.getLogger(WebhookUtils.class);
    private static final String HMAC_SHA256 = "HmacSHA256";
    
    // Header names used by StandardWebhooks
    private static final String HEADER_SIGNATURE = "webhook-signature";
    private static final String HEADER_TIMESTAMP = "webhook-timestamp";
    private static final String HEADER_ID = "webhook-id";
    
    /**
     * Verifies a webhook using the StandardWebhooks verification method.
     * 
     * @param payload The raw JSON payload as string
     * @param headers Map of request headers
     * @param secret The webhook secret (plain text UUID format)
     * @throws WebhookVerificationException If verification fails
     */
    public void verifyStandardWebhook(String payload, Map<String, String> headers, String secret) 
            throws WebhookVerificationException {
        // Extract required headers
        String signatureHeader = headers.get(HEADER_SIGNATURE);
        String timestamp = headers.get(HEADER_TIMESTAMP);
        String id = headers.get(HEADER_ID);
        
        if (payload == null || signatureHeader == null || timestamp == null || secret == null || id == null) {
            logger.error("Missing required webhook data - signature: {}, timestamp: {}, id: {}", 
                    signatureHeader != null, timestamp != null, id != null);
            throw new WebhookVerificationException("Missing required webhook data");
        }
        
        // Clean secret if it still has prefix
        if (secret.startsWith("v1,whsec_")) {
            secret = secret.replace("v1,whsec_", "");
            logger.info("Stripped prefix from webhook secret");
        }
        
        try {
            // The signature header should be in format "v1,<signature>"
            String[] parts = signatureHeader.split(",");
            if (parts.length != 2 || !parts[0].equals("v1")) {
                throw new WebhookVerificationException("Invalid signature format. Expected 'v1,<signature>'");
            }
            String signature = parts[1];
            
            // StandardWebhooks signs: id + "." + timestamp + "." + payload
            String signedContent = id + "." + timestamp + "." + payload;
            String expectedSignature = computeHmacSha256Base64(signedContent, secret);
            
            // Debug logging
            logger.debug("Received signature: {}", signature);
            logger.debug("Expected signature: {}", expectedSignature);
            logger.debug("Timestamp: {}", timestamp);
            logger.debug("Webhook ID: {}", id);
            logger.debug("Signed content: {}", signedContent);
            
            // Compare using Base64-aware constant-time comparison
            if (!isEqualBase64(signature, expectedSignature)) {
                logger.error("Signature mismatch - received: '{}', expected: '{}'", signature, expectedSignature);
                throw new WebhookVerificationException("Signature mismatch");
            }
            
            logger.info("Webhook signature verified successfully");
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("Error verifying webhook signature", e);
            throw new WebhookVerificationException("Error verifying signature: " + e.getMessage(), e);
        }
    }
    
    /**
     * Computes the HMAC-SHA256 signature for the given data and secret, encoded in Base64.
     * This version treats the secret as plain text (not Base64 encoded).
     */
    private String computeHmacSha256Base64(String data, String secret) 
            throws NoSuchAlgorithmException, InvalidKeyException {
        // Use the secret as plain text bytes (not Base64 decoded)
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, HMAC_SHA256);
        Mac mac = Mac.getInstance(HMAC_SHA256);
        mac.init(secretKeySpec);
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        String result = Base64.getEncoder().encodeToString(hmacBytes);
        logger.debug("HMAC calculation - signed content: {}", data);
        logger.debug("HMAC calculation - result (base64): {}", result);
        return result;
    }
    
    /**
     * Constant-time comparison of two Base64 encoded strings.
     */
    private boolean isEqualBase64(String a, String b) {
        try {
            byte[] aBytes = Base64.getDecoder().decode(a);
            byte[] bBytes = Base64.getDecoder().decode(b);
            logger.debug("Comparing decoded bytes - a length: {}, b length: {}", aBytes.length, bBytes.length);
            return MessageDigest.isEqual(aBytes, bBytes);
        } catch (IllegalArgumentException e) {
            logger.error("Error decoding Base64 string for comparison", e);
            return false;
        }
    }

    /**
     * Exception thrown when webhook verification fails.
     */
    public static class WebhookVerificationException extends Exception {
        public WebhookVerificationException(String message) {
            super(message);
        }
        
        public WebhookVerificationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}