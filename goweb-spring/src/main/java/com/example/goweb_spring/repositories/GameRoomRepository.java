package com.example.goweb_spring.repositories;

import com.example.goweb_spring.model.GameRoom;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GameRoomRepository extends CrudRepository<GameRoom, String> {
    List<GameRoom> findByGameOverFalse();
}
