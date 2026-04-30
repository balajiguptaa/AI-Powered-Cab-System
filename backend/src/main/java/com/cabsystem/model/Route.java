package com.cabsystem.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "routes")
@Data
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cab_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer"})
    private Cab cab;

    private String name;
    private double totalDistance;
    private int clusterGroup;
    private LocalDateTime scheduledTime;
    private String status;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"route"})
    private List<Stop> stops;
}
