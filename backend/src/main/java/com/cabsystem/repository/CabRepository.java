package com.cabsystem.repository;

import com.cabsystem.model.Cab;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CabRepository extends JpaRepository<Cab, Long> {
    List<Cab> findByStatus(String status);
}
