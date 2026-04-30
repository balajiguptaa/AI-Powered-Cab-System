package com.cabsystem.controller;

import com.cabsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private EmployeeRepository employeeRepo;
    @Autowired private CabRepository cabRepo;
    @Autowired private CabRequestRepository requestRepo;
    @Autowired private RouteRepository routeRepo;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalEmployees = employeeRepo.count();
        long totalCabs = cabRepo.count();
        long availableCabs = cabRepo.findByStatus("AVAILABLE").size();
        long pendingRequests = requestRepo.findByStatus("PENDING").size();
        long activeRoutes = routeRepo.findByStatus("ACTIVE").size() + routeRepo.findByStatus("PLANNED").size();
        long totalRequests = requestRepo.count();

        return ResponseEntity.ok(Map.of(
            "totalEmployees", totalEmployees,
            "totalCabs", totalCabs,
            "availableCabs", availableCabs,
            "pendingRequests", pendingRequests,
            "activeRoutes", activeRoutes,
            "totalRequests", totalRequests
        ));
    }
}
