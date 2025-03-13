package com.example.goweb_spring.repositories;

import com.example.goweb_spring.dto.User;
import com.example.goweb_spring.entities.UserEntity;
import com.example.goweb_spring.entities.UserSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettingsEntity, Long> {
    Optional<UserSettingsEntity> findByUser(UserEntity user);
}
