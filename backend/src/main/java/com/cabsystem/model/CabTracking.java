package com.cabsystem.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "cab_tracking")
@Data
public class CabTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "route_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"stops","requests"})
    private Route route;

    @ManyToOne
    @JoinColumn(name = "cab_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer"})
    private Cab cab;

    private double currentLat;
    private double currentLng;
    private int currentStopIndex; // which stop is next
    private String status;        // EN_ROUTE, AT_STOP, COMPLETED
    private LocalDateTime updatedAt;
    private double speedKmh;      // simulated speed
}
