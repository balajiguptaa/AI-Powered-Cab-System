package com.cabsystem.service;

import com.cabsystem.model.CabRequest;
import com.cabsystem.model.Employee;
import com.cabsystem.repository.CabRequestRepository;
import com.cabsystem.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class RequestService {

    @Autowired private CabRequestRepository requestRepo;
    @Autowired private EmployeeRepository employeeRepo;

    public List<CabRequest> getAll() { return requestRepo.findAll(); }

    public List<CabRequest> getByEmployee(Long employeeId) {
        return requestRepo.findByEmployeeId(employeeId);
    }

    public List<CabRequest> getPending() { return requestRepo.findByStatus("PENDING"); }

    public CabRequest create(Map<String, Object> data) {
        Long employeeId = Long.parseLong(data.get("employeeId").toString());
        Employee emp = employeeRepo.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        CabRequest req = new CabRequest();
        req.setEmployee(emp);
        req.setPickupLat(Double.parseDouble(data.get("pickupLat").toString()));
        req.setPickupLng(Double.parseDouble(data.get("pickupLng").toString()));
        req.setPickupAddress((String) data.get("pickupAddress"));
        req.setRequestedTime(LocalDateTime.parse((String) data.get("requestedTime")));
        req.setStatus("PENDING");
        return requestRepo.save(req);
    }

    public CabRequest updateStatus(Long id, String status) {
        CabRequest req = requestRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        req.setStatus(status);
        return requestRepo.save(req);
    }
}
