package com.example.goweb_spring.entities;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_oauth", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"provider", "providerUserId"})
})
@Data
@NoArgsConstructor
public class UserOAuthEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false)
    private String providerUserId;

    // This links back to the main user table.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
}
