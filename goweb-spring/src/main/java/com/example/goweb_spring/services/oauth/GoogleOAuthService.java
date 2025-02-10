package com.example.goweb_spring.services.oauth;

import com.example.goweb_spring.model.ProviderUserInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;


@Service("google")
public class GoogleOAuthService implements OAuthProviderService{
    @Value("${oauth.google.clientId}")
    private String googleClientId;

    @Value("${oauth.google.clientSecret}")
    private String googleClientSecret;

    @Value("${oauth.google.redirectUri}")
    private String googleRedirectUri;


    private final RestTemplate restTemplate = new RestTemplate();


    @Override
    public String getAuthorizationUrl() {
        return "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + googleClientId +
                "&redirect_uri=" + URLEncoder.encode(googleRedirectUri, StandardCharsets.UTF_8) +
                "&response_type=code" +
                "&scope=" + URLEncoder.encode("openid email profile", StandardCharsets.UTF_8);
    }

    @Override
    public String exchangeCodeForToken(String code) {
        String tokenEndpoint = "https://oauth2.googleapis.com/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

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

    @Override
    public ProviderUserInfo fetchUserInfo(String accessToken) {
        String userInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(userInfoEndpoint, HttpMethod.GET, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String email = (String) body.get("email");
                String name = (String) body.get("name");
                // Extract the provider user ID; Google returns it in the "id" field.
                String providerUserId = (String) body.get("id");
                if (providerUserId == null && body.get("id") != null) {
                    providerUserId = body.get("id").toString();
                }
                return new ProviderUserInfo(email, name, providerUserId);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
