package com.cabsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cabs")
@Data
public class Cab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String number;      // vehicle number plate
    private String driverName;
    private String driverPhone;
    private int capacity;
    private String status;      // AVAILABLE, ASSIGNED, MAINTENANCE
    private String type;        // SEDAN, SUV, MINIVAN
}
