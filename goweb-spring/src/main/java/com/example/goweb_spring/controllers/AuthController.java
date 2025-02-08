package com.example.goweb_spring.controllers;

import com.example.goweb_spring.dto.GoogleTokenRequest;
import com.example.goweb_spring.dto.TokenResponse;
import com.example.goweb_spring.dto.User;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.model.GoogleUser;
import com.example.goweb_spring.model.ProviderUserInfo;
import com.example.goweb_spring.services.AuthService;
import com.example.goweb_spring.services.oauth.GoogleOAuthService;
import com.example.goweb_spring.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;

    @Value("${oauth.google.clientId}")
    private String googleClientId;

    @Value("${oauth.google.clientSecret}")
    private String googleClientSecret;

    @Value("${oauth.google.redirectUri}")
    private String googleRedirectUri;


    public AuthController(JwtUtil jwtUtil,  AuthService authService, GoogleOAuthService googleOAuthService) {
        this.jwtUtil = jwtUtil;
        this.authService = authService;
        this.googleOAuthService = googleOAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            TokenResponse tokens = authService.loginUser(user.getUsername(), user.getPassword());

            // Set Refresh Token in an HttpOnly Cookie
            ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", tokens.getRefreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .path("/api/auth/refresh")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                    .body(new TokenResponse(tokens.getAccessToken(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            UserEntity newUser = authService.registerUser(
                    user.getUsername(),
                    user.getEmail(),
                    user.getPassword(),
                    user.getSkillLevel()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully: " + newUser.getUsername());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        try {
            TokenResponse tokenResponse = authService.refreshToken(refreshToken);

            // Set the new refresh token in an HTTP-only cookie
            ResponseCookie cookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .path("/api/auth/refresh")
                    .maxAge(7 * 24 * 60 * 60) // 7 days
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new TokenResponse(tokenResponse.getAccessToken(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/api/auth/refresh")
                .maxAge(0) // Remove the cookie immediately
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body("Logged out successfully");
    }


    @PostMapping("/oauth")
    public ResponseEntity<?> oauth(@RequestBody GoogleTokenRequest request, HttpServletResponse response) {

        System.out.println("making a request");

        ProviderUserInfo userInfo = googleOAuthService.verifyToken(request.getIdToken());
        if (userInfo == null) {
            return ResponseEntity.status(401).body("Invalid Google token");
        }

        TokenResponse tokenResponse = authService.loginOrRegisterGoogleUser(userInfo);

//        // Set the new refresh token in an HTTP-only cookie
//        ResponseCookie cookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
//                .httpOnly(true)
//                .secure(true)
//                .path("/api/auth/refresh")
//                .maxAge(7 * 24 * 60 * 60) // 7 days
//                .build();

        return ResponseEntity.ok()
                .body(new TokenResponse(tokenResponse.getAccessToken(), tokenResponse.getRefreshToken()));
    }



    @GetMapping("/oauth/{provider}")
    public void redirectToProvider(@PathVariable String provider, HttpServletResponse response) throws IOException {
        String authUrl = "";
        if ("google".equalsIgnoreCase(provider)) {
            authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                    "client_id=" + googleClientId +
                    "&redirect_uri=" + URLEncoder.encode(googleRedirectUri, StandardCharsets.UTF_8) +
                    "&response_type=code" +
                    "&scope=" + URLEncoder.encode("openid email profile", StandardCharsets.UTF_8);
        }
        // Add more providers as needed

        // Redirect the user to the OAuth provider’s login page
        response.sendRedirect(authUrl);
    }


    @GetMapping("/oauth/{provider}/callback")
    public void handleProviderCallback(
            @PathVariable String provider,
            @RequestParam String code,
            HttpServletResponse response) throws IOException {

        // Exchange the code for an access token with the provider
        // (You can use RestTemplate, WebClient, or another HTTP client library)
        String providerAccessToken = exchangeCodeForToken(provider, code);

        // Use the access token (or an ID token, if provided) to fetch user info.
        ProviderUserInfo userInfo = fetchUserInfo(provider, providerAccessToken);

        if (userInfo == null) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unable to fetch user info");
            return;
        }

        // At this point, you can find or create a local user based on the provider's user info.
        TokenResponse tokenResponse = authService.loginOrRegisterGoogleUser(userInfo);

        // Set refresh token in an HTTP‑only cookie
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
                .httpOnly(true)
                .secure(true) // use secure cookies in production
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        
        String frontendRedirectUrl = "http://localhost:3000/auth/callback?accessToken=" + tokenResponse.getAccessToken();
        response.sendRedirect(frontendRedirectUrl);
    }

    // Helper methods for exchanging code and fetching user info
    private String exchangeCodeForToken(String provider, String code) {
        RestTemplate restTemplate = new RestTemplate();
        String tokenEndpoint = "https://oauth2.googleapis.com/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // Build the POST parameters.
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", googleClientId);
        params.add("client_secret", googleClientSecret);
        params.add("redirect_uri", googleRedirectUri);
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenEndpoint, request, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                return (String) body.get("access_token");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private ProviderUserInfo fetchUserInfo(String provider, String providerAccessToken) {
        RestTemplate restTemplate = new RestTemplate();
        String userInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(providerAccessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    userInfoEndpoint,
                    HttpMethod.GET,
                    entity,
                    Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String email = (String) body.get("email");
                String name = (String) body.get("name");
                return new ProviderUserInfo(email, name);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
