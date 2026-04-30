package com.cabsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "stops")
@Data
public class Stop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "route_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"stops","requests"})
    private Route route;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"user","hibernateLazyInitializer"})
    private Employee employee;

    private int stopOrder;
    private double latitude;
    private double longitude;
    private String address;
}
