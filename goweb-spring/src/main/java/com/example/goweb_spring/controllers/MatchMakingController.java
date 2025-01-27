package com.example.goweb_spring.controllers;


import com.example.goweb_spring.dto.MatchMakingRequest;
import com.example.goweb_spring.model.MatchmakingEntry;
import com.example.goweb_spring.services.MatchMakingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchMakingController {
    private final MatchMakingService matchmakingService;

    public MatchMakingController(MatchMakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    @PostMapping("/join")
    public ResponseEntity<String> joinQueue(@RequestBody MatchMakingRequest request) {

        MatchmakingEntry entry = new MatchmakingEntry(
                request.getUserId(),
                request.getRating(),
                request.getTimeControl(),
                request.getBoardSize()
        );

        matchmakingService.enqueuePlayer(entry);
        return ResponseEntity.ok("Player enqueued successfully.");
    }

    @PostMapping("/cancel/{playerId}")
    public ResponseEntity<String> cancelQueue(@PathVariable String playerId) {
//        matchMakingService.removePlayer(matchMakingRequest.getUserId());
        return ResponseEntity.ok("Player removed from queue.");
    }
}
