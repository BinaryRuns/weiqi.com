package com.example.goweb_spring.repositories;

import com.example.goweb_spring.entities.MoveEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MoveRepository extends JpaRepository<MoveEntity, Long> {
    List<MoveEntity> findByGameRoom_RoomIdOrderByMoveNumber(String roomId); 
}
