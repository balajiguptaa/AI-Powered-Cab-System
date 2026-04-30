package com.cabsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CabAllocationApplication {
    public static void main(String[] args) {
        SpringApplication.run(CabAllocationApplication.class, args);
    }
}
