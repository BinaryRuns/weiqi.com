//package com.example.goweb_spring.services;
//
//import org.springframework.context.ApplicationListener;
//import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
//import org.springframework.stereotype.Component;
//import org.springframework.web.socket.messaging.SessionDisconnectEvent;
//
//@Component
//public class WebSocketDisconnectHandler implements ApplicationListener<SessionDisconnectEvent> {
//
//    private final GameRoomService gameRoomService;
//
//    public WebSocketDisconnectHandler(GameRoomService gameRoomService) {
//        this.gameRoomService = gameRoomService;
//    }
//
//    @Override
//    public void onApplicationEvent(SessionDisconnectEvent event) {
//        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
//        String sessionId = accessor.getSessionId();
//
//        // Handle timer stop or cleanup logic here
//        System.out.println("WebSocket session disconnected: " + sessionId);
//        gameRoomService.handlePlayerDisconnect(sessionId);
//    }
//}
