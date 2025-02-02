package com.example.goweb_spring.services.oauth;

import com.example.goweb_spring.model.GoogleUser;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleOAuthService {

    // Replace with your actual Google Client ID
    private static final String CLIENT_ID = "532310787557-tqb0gnir6s3l7udsc2klrf4e86kjb9t7.apps.googleusercontent.com";

    public GoogleUser verifyToken(String accessToken) {
        try {
            // Create a JSON factory for parsing the ID token
            GsonFactory gsonFactory = GsonFactory.getDefaultInstance();

            // Build the token verifier
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    gsonFactory
            )
                    .setAudience(Collections.singleton(CLIENT_ID)) // Ensure token was issued for your app
                    .build();

            // Verify the token
            GoogleIdToken idToken = verifier.verify(accessToken);

            if (idToken != null) {
                // Token is valid; extract user info from the payload
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Return a custom DTO with basic user info
                return new GoogleUser(email, name);
            } else {
                // idToken is null if verification failed
                return null;
            }
        } catch (Exception e) {
            // Log or handle the exception as appropriate in production
            e.printStackTrace();
            return null;
        }
    }
}