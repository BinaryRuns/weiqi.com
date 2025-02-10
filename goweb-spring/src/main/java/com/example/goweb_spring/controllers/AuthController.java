package com.example.goweb_spring.controllers;

import com.example.goweb_spring.dto.TokenResponse;
import com.example.goweb_spring.dto.User;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.model.ProviderUserInfo;
import com.example.goweb_spring.services.AuthService;
import com.example.goweb_spring.services.oauth.OAuthProviderService;
import com.example.goweb_spring.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtUtil jwtUtil;
    private final AuthService authService;


    // Inject all available OAuthProviderService beans in a Map (keyed by their name)
    private final Map<String, OAuthProviderService> oauthProviders;


    public AuthController(JwtUtil jwtUtil,  AuthService authService, Map<String, OAuthProviderService> oauthProviders) {
        this.jwtUtil = jwtUtil;
        this.authService = authService;
        this.oauthProviders = oauthProviders;
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



    @GetMapping("/oauth/{provider}")
    public void redirectToProvider(@PathVariable String provider, HttpServletResponse response) throws IOException {
        OAuthProviderService service = oauthProviders.get(provider.toLowerCase());
        if (service == null) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "Unsupported provider");
            return;
        }
        String authUrl = service.getAuthorizationUrl();
        response.sendRedirect(authUrl);
    }


    @GetMapping("/oauth/{provider}/callback")
    public void handleProviderCallback(
            @PathVariable String provider,
            @RequestParam String code,
            HttpServletResponse response) throws IOException {


        OAuthProviderService service = oauthProviders.get(provider.toLowerCase());

        if (service == null) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "Unsupported provider");
            return;
        }
        // Exchange the code for an access token
        String providerAccessToken = service.exchangeCodeForToken(code);
        // Fetch the user info from the provider
        ProviderUserInfo userInfo = service.fetchUserInfo(providerAccessToken);

        if (userInfo == null) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unable to fetch user info");
            return;
        }

        System.out.println(userInfo);

        // At this point, you can find or create a local user based on the provider's user info.
        TokenResponse tokenResponse = authService.loginOrRegisterOAuthUser(userInfo, provider, userInfo.getProviderUserId());

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
}
