package com.cabsystem.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "requests")
@Data
public class CabRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"user","hibernateLazyInitializer"})
    private Employee employee;

    private double pickupLat;
    private double pickupLng;
    private String pickupAddress;

    private LocalDateTime requestedTime;
    private LocalDateTime createdAt = LocalDateTime.now();

    private String status; // PENDING, ASSIGNED, COMPLETED, CANCELLED

    @ManyToOne
    @JoinColumn(name = "route_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"stops","requests","cab"})
    private Route route;
}
