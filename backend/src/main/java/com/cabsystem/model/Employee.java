package com.cabsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "employees")
@Data
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password","hibernateLazyInitializer"})
    private User user;

    private String name;
    private String department;
    private String address;
    private double latitude;
    private double longitude;
    private String shift; // MORNING, EVENING, NIGHT
}
