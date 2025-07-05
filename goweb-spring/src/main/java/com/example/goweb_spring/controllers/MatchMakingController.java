package com.example.goweb_spring.controllers;


import com.example.goweb_spring.annotations.RequiresAuthentication;
import com.example.goweb_spring.dto.MatchMakingRequest;
import com.example.goweb_spring.model.MatchmakingEntry;
import com.example.goweb_spring.services.MatchMakingService;
import com.example.goweb_spring.utils.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchMakingController {
    private final MatchMakingService matchmakingService;
    private final SecurityUtils securityUtils;

    public MatchMakingController(MatchMakingService matchmakingService, SecurityUtils securityUtils) {
        this.matchmakingService = matchmakingService;
        this.securityUtils = securityUtils;
    }

    /**
     * Joins the authenticated user to the matchmaking queue.
     * 
     * @param request The matchmaking request containing rating, time control, and board size preferences
     * @return ResponseEntity with a success message if the player was successfully added to the queue
     * @throws IllegalStateException if the user is not authenticated
     */
    @PostMapping("/join")
    @RequiresAuthentication
    public ResponseEntity<String> joinQueue(@RequestBody MatchMakingRequest request) {
        // The @RequiresAuthentication annotation ensures the user is authenticated
        // and the aspect will throw an exception if not, which will be handled by AuthenticationAdvice
        String userId = securityUtils.requireUserId();
        
        MatchmakingEntry entry = new MatchmakingEntry(
                userId,
                request.getRating(),
                request.getTimeControl(),
                request.getBoardSize()
        );

        matchmakingService.enqueuePlayer(entry);
        return ResponseEntity.ok("Player enqueued successfully.");
    }

    /**
     * Cancels the authenticated user's active matchmaking request.
     * 
     * @return ResponseEntity with a success message if the player was successfully removed from the queue
     * @throws RuntimeException if the player entry cannot be found or removed from the queue
     * @throws IllegalStateException if the user is not authenticated
     */
    @DeleteMapping("/cancel")
    @RequiresAuthentication
    public ResponseEntity<String> cancelQueue() {
        // The @RequiresAuthentication annotation ensures the user is authenticated
        String userId = securityUtils.requireUserId();
        matchmakingService.removePlayerById(userId);
        return ResponseEntity.ok("Player removed from queue.");
    }
}
