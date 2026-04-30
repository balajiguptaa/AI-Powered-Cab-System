package com.cabsystem.controller;

import com.cabsystem.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    @Autowired private RequestService requestService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(requestService.getAll()); }

    @GetMapping("/pending")
    public ResponseEntity<?> getPending() { return ResponseEntity.ok(requestService.getPending()); }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<?> getByEmployee(@PathVariable Long empId) {
        return ResponseEntity.ok(requestService.getByEmployee(empId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> data) {
        try {
            return ResponseEntity.ok(requestService.create(data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(requestService.updateStatus(id, body.get("status")));
    }
}
