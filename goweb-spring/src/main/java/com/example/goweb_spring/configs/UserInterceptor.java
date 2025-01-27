package com.example.goweb_spring.configs;

import com.example.goweb_spring.utils.JwtUtil;
import com.sun.security.auth.UserPrincipal;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

public class UserInterceptor extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {

        // Extract token from query parameters
        String userId = request.getURI().getQuery().split("=")[1];

        if (userId != null) {
            return new UserPrincipal(userId);
        }
        return null;
    }
}
