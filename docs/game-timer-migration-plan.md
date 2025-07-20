# Game Timer System Migration Plan

## Overview

This document outlines the completed migration of the Weiqi.com game timer system from the previous polling-based approach to a more efficient event-driven architecture. The new system provides better scalability, more accurate timeouts, and reduced database load.

## Previous Implementation (Legacy)

The previous implementation used `GameTimeoutService`, which:

1. Ran a scheduled task every 5 seconds to check all active games
2. Queried the database for all games with status `IN_GAME` and not `gameOver`
3. Processed games in batches, calculating elapsed time since the last update
4. Updated game state and handled timeouts when detected

**Issues with the previous approach:**

- **Scalability**: Database query load increased linearly with the number of active games
- **Accuracy**: Timeout detection could be delayed by up to 5 seconds
- **Efficiency**: Processed all games on each run, even those not close to timing out
- **Database load**: Frequent queries to the database for all active games

## New Implementation

The new implementation uses `GameTimerManager`, which:

1. Uses in-memory timers scheduled for the exact moment a player's time will expire
2. Cancels and reschedules timers when moves are made
3. Hydrates timers on application startup for active games
4. Only accesses the database when game state changes or on startup

**Benefits of the new approach:**

- **Scalability**: Memory usage scales linearly with active games, but database load is constant
- **Accuracy**: Timeouts are detected immediately when they occur
- **Efficiency**: Only processes games when necessary (on move, on timeout)
- **Resilience**: Recovers correctly after application restarts

## Migration Steps

### Phase 1: Implementation (Completed)

- [x] Create `GameTimerManager` service for handling in-memory timers
- [x] Implement startup recovery mechanism to re-schedule timers after restart
- [x] Integrate `GameTimerManager` into core move-handling logic
- [x] Deprecate the old polling mechanism in `GameTimeoutService`

### Phase 2: Testing (Completed)

- [x] Add comprehensive unit tests for `GameTimerManager`
- [x] Test startup recovery with simulated application restarts
- [x] Test edge cases (very short time controls, high load)
- [x] Perform load testing with simulated concurrent games

### Phase 3: Deployment (Completed)

- [x] Deploy the new implementation alongside the old one
- [x] Monitor both systems in parallel
- [x] Compare timeout accuracy and system performance
- [x] Address issues discovered during monitoring

### Phase 4: Transition (Completed)

- [x] Gradually increase the polling interval of `GameTimeoutService`
- [x] Confirm `GameTimerManager` is handling all timeouts correctly
- [x] Disable `GameTimeoutService` scheduling

### Phase 5: Cleanup (Completed)

- [x] Remove `GameTimeoutService` dependency from `GameRoomService`
- [x] Remove `GameTimeoutService` class entirely
- [x] Update documentation to reflect the new architecture
- [x] Update application configuration

## Rollback Plan (No Longer Needed)

The migration has been successfully completed, and the rollback plan is no longer needed.

## Technical Details

### Timer Management

- Each active game has exactly one timer scheduled for the current player's time expiration
- When a move is made, the existing timer is cancelled and a new one is scheduled
- Timers are stored in a `ConcurrentHashMap` keyed by room ID

### Startup Recovery

On application startup, the system:

1. Queries the database for all active games
2. Calculates elapsed time since the last update for each game
3. Adjusts remaining time based on elapsed time
4. Schedules new timers for each active game
5. Handles any timeouts that occurred during downtime

### Error Handling

- Double-check timeout validity before processing to prevent false timeouts
- Graceful handling of missing games or invalid state
- Comprehensive logging for debugging and monitoring

## Performance Considerations

- The system uses a configurable thread pool for timer execution
- Memory usage is proportional to the number of active games
- Database access is minimized to only when game state changes

## Future Improvements

- Add metrics collection for timer accuracy and system performance
- Implement more sophisticated time controls (byo-yomi, Canadian overtime)
- Add support for game pausing and resuming
- Implement distributed timer management for horizontal scaling 