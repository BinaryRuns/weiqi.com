package com.example.goweb_spring.repositories;

import com.example.goweb_spring.model.GameRoom;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface GameRoomRepository extends CrudRepository<GameRoom, String> {
}
