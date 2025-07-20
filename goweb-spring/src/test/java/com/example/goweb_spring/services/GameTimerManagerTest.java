package com.example.goweb_spring.services;

import com.example.goweb_spring.dto.enums.TimeControl;
import com.example.goweb_spring.model.GameRoom;
import com.example.goweb_spring.model.RoomStatus;
import com.example.goweb_spring.repositories.GameRoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GameTimerManagerTest {

    @Mock
    private GameRoomRepository gameRoomRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private GameTimerManager gameTimerManager;
    private GameRoom testGameRoom;

    @BeforeEach
    void setUp() {
        // Use a fixed thread pool size of 4 for testing
        gameTimerManager = new GameTimerManager(gameRoomRepository, messagingTemplate, 4);
        
        // Create a test game room
        testGameRoom = new GameRoom("Test Room", 2, 9, TimeControl.TEST);
        testGameRoom.setStatus(RoomStatus.IN_GAME);
        testGameRoom.setLastTimeUpdateTimestamp(Instant.now());
        testGameRoom.setLastMoveTimestamp(Instant.now());
    }

    @Test
    void testScheduleTimeout() {
        // Test scheduling a timeout
        gameTimerManager.scheduleTimeout(testGameRoom.getRoomId(), testGameRoom);
        
        // No direct way to verify the scheduler was called, but we can verify no exceptions were thrown
    }

    @Test
    void testCancelTimeout() {
        // Schedule a timeout first
        gameTimerManager.scheduleTimeout(testGameRoom.getRoomId(), testGameRoom);
        
        // Then cancel it
        gameTimerManager.cancelTimeout(testGameRoom.getRoomId());
        
        // No direct way to verify the cancellation, but we can verify no exceptions were thrown
    }

    @Test
    void testHandleTimeout() throws Exception {
        // Set up the game room to be returned when findById is called
        when(gameRoomRepository.findById(anyString())).thenReturn(Optional.of(testGameRoom));
        
        // Trigger a timeout
        gameTimerManager.scheduleTimeout(testGameRoom.getRoomId(), testGameRoom);
        
        // Force the timeout to happen immediately by using reflection to access the private method
        java.lang.reflect.Method handleTimeoutMethod = GameTimerManager.class.getDeclaredMethod("handleTimeout", String.class);
        handleTimeoutMethod.setAccessible(true);
        handleTimeoutMethod.invoke(gameTimerManager, testGameRoom.getRoomId());
        
        // Verify that the game room was updated and saved
        verify(gameRoomRepository).save(any(GameRoom.class));
        
        // Verify that the messaging template was called to send notifications
        verify(messagingTemplate).convertAndSend(
            eq("/topic/game/" + testGameRoom.getRoomId() + "/timeout"),
            any(Map.class)
        );
        
        verify(messagingTemplate).convertAndSend(
            eq("/topic/game/" + testGameRoom.getRoomId()),
            any(Map.class)
        );
    }

    @Test
    void testInitializeTimersOnStartup() {
        // Set up the repository to return a list of active games
        when(gameRoomRepository.findByGameOverFalseAndStatus(RoomStatus.IN_GAME))
            .thenReturn(Collections.singletonList(testGameRoom));
        
        // Call the method
        gameTimerManager.initializeTimersOnStartup();
        
        // Verify that the game room was updated and saved
        verify(gameRoomRepository).save(any(GameRoom.class));
    }
} 