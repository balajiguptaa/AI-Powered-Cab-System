package com.cabsystem.controller;

import com.cabsystem.service.OptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/optimize")
public class OptimizationController {

    @Autowired private OptimizationService optimizationService;

    @PostMapping("/run")
    public ResponseEntity<?> runOptimization() {
        try {
            return ResponseEntity.ok(optimizationService.runOptimization());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/demand")
    public ResponseEntity<?> getDemand() {
        return ResponseEntity.ok(optimizationService.getDemandPrediction());
    }
}
