package com.example.goweb_spring.repositories;

import com.example.goweb_spring.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findBySupabaseUserId(String supabaseUserId);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.userSettings WHERE u.supabaseUserId = :supabaseUserId")
    Optional<UserEntity> findBySupabaseUserIdWithSettings(String supabaseUserId);
}
