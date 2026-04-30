package com.cabsystem.repository;

import com.cabsystem.model.CabRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CabRequestRepository extends JpaRepository<CabRequest, Long> {
    List<CabRequest> findByEmployeeId(Long employeeId);
    List<CabRequest> findByStatus(String status);

    @Query("SELECT HOUR(r.requestedTime) as hour, COUNT(r) as count FROM CabRequest r GROUP BY HOUR(r.requestedTime) ORDER BY hour")
    List<Object[]> getRequestCountByHour();
}
