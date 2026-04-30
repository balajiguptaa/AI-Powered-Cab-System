package com.cabsystem.repository;

import com.cabsystem.model.Stop;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StopRepository extends JpaRepository<Stop, Long> {
    List<Stop> findByRouteIdOrderByStopOrder(Long routeId);
}
