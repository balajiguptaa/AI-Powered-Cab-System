package com.cabsystem.repository;

import com.cabsystem.model.CabTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CabTrackingRepository extends JpaRepository<CabTracking, Long> {
    Optional<CabTracking> findByRouteId(Long routeId);
    Optional<CabTracking> findByCabId(Long cabId);
    List<CabTracking> findByStatus(String status);
}
