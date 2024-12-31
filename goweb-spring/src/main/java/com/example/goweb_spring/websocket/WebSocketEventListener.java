package com.example.goweb_spring.websocket;


import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;

@Component
public class WebSocketEventListener {
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        System.out.println("New web socket conection estalished");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionConnectedEvent event) {
        System.out.println("New web socket disconection estalished");
    }
}
