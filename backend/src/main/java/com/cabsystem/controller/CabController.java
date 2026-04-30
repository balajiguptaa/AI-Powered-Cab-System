package com.cabsystem.controller;

import com.cabsystem.model.Cab;
import com.cabsystem.service.CabService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cabs")
public class CabController {

    @Autowired private CabService cabService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(cabService.getAll()); }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailable() { return ResponseEntity.ok(cabService.getAvailable()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(cabService.getById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Cab cab) {
        return ResponseEntity.ok(cabService.create(cab));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(cabService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        cabService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
