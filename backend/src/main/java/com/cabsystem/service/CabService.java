package com.cabsystem.service;

import com.cabsystem.model.Cab;
import com.cabsystem.repository.CabRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CabService {

    @Autowired private CabRepository cabRepo;

    public List<Cab> getAll() { return cabRepo.findAll(); }

    public Cab getById(Long id) {
        return cabRepo.findById(id).orElseThrow(() -> new RuntimeException("Cab not found"));
    }

    public Cab create(Cab cab) {
        if (cab.getStatus() == null) cab.setStatus("AVAILABLE");
        return cabRepo.save(cab);
    }

    public Cab update(Long id, Map<String, Object> data) {
        Cab cab = getById(id);
        if (data.containsKey("number")) cab.setNumber((String) data.get("number"));
        if (data.containsKey("driverName")) cab.setDriverName((String) data.get("driverName"));
        if (data.containsKey("driverPhone")) cab.setDriverPhone((String) data.get("driverPhone"));
        if (data.containsKey("capacity")) cab.setCapacity(Integer.parseInt(data.get("capacity").toString()));
        if (data.containsKey("status")) cab.setStatus((String) data.get("status"));
        if (data.containsKey("type")) cab.setType((String) data.get("type"));
        return cabRepo.save(cab);
    }

    public void delete(Long id) { cabRepo.deleteById(id); }

    public List<Cab> getAvailable() { return cabRepo.findByStatus("AVAILABLE"); }
}
