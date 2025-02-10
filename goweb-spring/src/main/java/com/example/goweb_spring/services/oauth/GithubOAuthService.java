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
import java.util.Collections;
import java.util.Map;

@Service("github")
public class GithubOAuthService implements OAuthProviderService {
    @Value("${oauth.github.clientId}")
    private String githubClientId;

    @Value("${oauth.github.clientSecret}")
    private String githubClientSecret;

    @Value("${oauth.github.redirectUri}")
    private String githubRedirectUri;

    private final RestTemplate restTemplate = new RestTemplate();



    /**
     * Constructs the GitHub authorization URL.
     */
    @Override
    public String getAuthorizationUrl() {
        return "https://github.com/login/oauth/authorize?" +
                "client_id=" + githubClientId +
                "&redirect_uri=" + URLEncoder.encode(githubRedirectUri, StandardCharsets.UTF_8) +
                "&scope=" + URLEncoder.encode("user:email", StandardCharsets.UTF_8);
    }

    /**
     * Exchanges the authorization code for an access token using GitHub's token endpoint.
     */
    @Override
    public String exchangeCodeForToken(String code) {
        String tokenEndpoint = "https://github.com/login/oauth/access_token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        // Request JSON response
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", githubClientId);
        params.add("client_secret", githubClientSecret);
        params.add("code", code);
        params.add("redirect_uri", githubRedirectUri);

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

    /**
     * Fetches the GitHub user's info using the provided access token.
     */
    @Override
    public ProviderUserInfo fetchUserInfo(String accessToken) {
        String userInfoEndpoint = "https://api.github.com/user";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    userInfoEndpoint,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                // Try to get the email from the primary user endpoint.
                String email = (String) body.get("email");
                String name = (String) body.get("name");
                if (name == null) {
                    name = (String) body.get("login");
                }
                // If email is null, try to fetch it from /user/emails
                if (email == null) {
                    email = fetchPrimaryEmail(accessToken, headers);
                    System.out.println("Fetched primary email: " + email);
                }
                // Extract the provider user ID from the "id" field
                String providerUserId = String.valueOf(body.get("id"));
                return new ProviderUserInfo(email, name, providerUserId);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }




    /**
     * Fetches the primary verified email from the GitHub /user/emails endpoint.
     */
    private String fetchPrimaryEmail(String accessToken, HttpHeaders headers) {
        String emailsEndpoint = "https://api.github.com/user/emails";
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Object[]> emailResponse = restTemplate.exchange(
                    emailsEndpoint,
                    HttpMethod.GET,
                    entity,
                    Object[].class
            );
            if (emailResponse.getStatusCode() == HttpStatus.OK && emailResponse.getBody() != null) {
                Object[] emails = emailResponse.getBody();
                // Each email object is represented as a Map.
                for (Object obj : emails) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> emailEntry = (Map<String, Object>) obj;
                    Boolean primary = (Boolean) emailEntry.get("primary");
                    Boolean verified = (Boolean) emailEntry.get("verified");
                    String emailAddress = (String) emailEntry.get("email");
                    if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified)) {
                        return emailAddress;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
