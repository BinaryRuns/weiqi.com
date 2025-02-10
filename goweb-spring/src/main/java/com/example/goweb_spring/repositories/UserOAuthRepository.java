package com.example.goweb_spring.repositories;

import com.example.goweb_spring.entities.UserOAuthEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserOAuthRepository extends JpaRepository<UserOAuthEntity, Long> {
    Optional<UserOAuthEntity> findByProviderAndProviderUserId(String provider, String providerUserId);
}