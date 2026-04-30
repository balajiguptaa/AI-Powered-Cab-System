package com.cabsystem.repository;

import com.cabsystem.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByStatus(String status);
}
