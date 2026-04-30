package com.cabsystem.controller;

import com.cabsystem.service.CabTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracking")
public class CabTrackingController {

    @Autowired private CabTrackingService trackingService;

    // All active cabs (for admin map)
    @GetMapping("/active")
    public ResponseEntity<?> getActive() {
        return ResponseEntity.ok(trackingService.getAllActive());
    }

    // Specific route tracking (for employee "my cab" view)
    @GetMapping("/route/{routeId}")
    public ResponseEntity<?> getByRoute(@PathVariable Long routeId) {
        return trackingService.getByRoute(routeId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ETA for a specific employee stop
    @GetMapping("/route/{routeId}/eta/{stopIndex}")
    public ResponseEntity<?> getEta(@PathVariable Long routeId, @PathVariable int stopIndex) {
        return ResponseEntity.ok(trackingService.getEta(routeId, stopIndex));
    }
}
