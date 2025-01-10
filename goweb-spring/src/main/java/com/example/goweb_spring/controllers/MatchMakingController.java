package com.example.goweb_spring.controllers;


import com.example.goweb_spring.dto.MatchMakingRequest;
import com.example.goweb_spring.services.MatchMakingService;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchMakingController {
    private final MatchMakingService matchMakingService;

    public MatchMakingController(MatchMakingService matchMakingService) {
        this.matchMakingService = matchMakingService;
    }

    public void joinQueue(@Payload  MatchMakingRequest matchMakingRequest) {
        matchMakingService.addToQueue(
                matchMakingRequest.getUserId(),
                matchMakingRequest.getBoardSize(),
                matchMakingRequest.getTimeControl());
    }
}
