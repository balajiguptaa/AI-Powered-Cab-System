package com.cabsystem.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password","hibernateLazyInitializer"})
    private User user;

    private String message;
    private String type; // INFO, SUCCESS, WARNING
    @Column(name = "is_read")
    private boolean read = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}
