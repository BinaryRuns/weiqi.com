package com.example.goweb_spring.services.oauth;

import com.example.goweb_spring.model.ProviderUserInfo;

public interface OAuthProviderService {

    /**
     * Returns the URL for initiating the OAuth flow.
     */
    String getAuthorizationUrl();


    /**
     * Exchanges the authorization code for an access token.
     */
    String exchangeCodeForToken(String code);


    /**
     * Fetches user information using the access token.
     */
    ProviderUserInfo fetchUserInfo(String accessToken);
}
