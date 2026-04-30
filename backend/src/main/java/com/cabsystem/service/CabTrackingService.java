package com.cabsystem.service;

import com.cabsystem.model.*;
import com.cabsystem.repository.*;
import com.cabsystem.service.OptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CabTrackingService {

    @Autowired private CabTrackingRepository trackingRepo;
    @Autowired private RouteRepository routeRepo;

    private static final double OFFICE_LAT = 12.9716;
    private static final double OFFICE_LNG = 77.5946;
    private static final double SPEED_KMH  = 40.0;   // simulated cab speed

    // ── Start tracking when a route is created ────────────────────────────────
    public CabTracking startTracking(Route route) {
        // Remove old tracking for this route if exists
        trackingRepo.findByRouteId(route.getId()).ifPresent(trackingRepo::delete);

        List<Stop> stops = route.getStops();
        if (stops == null || stops.isEmpty()) return null;

        Stop firstStop = stops.stream()
            .min(Comparator.comparingInt(Stop::getStopOrder))
            .orElse(stops.get(0));

        // Cab starts slightly offset from first stop (simulates coming from depot)
        CabTracking tracking = new CabTracking();
        tracking.setRoute(route);
        tracking.setCab(route.getCab());
        tracking.setCurrentLat(firstStop.getLatitude() + 0.008);  // ~900m north
        tracking.setCurrentLng(firstStop.getLongitude() + 0.008);
        tracking.setCurrentStopIndex(0);
        tracking.setStatus("EN_ROUTE");
        tracking.setUpdatedAt(LocalDateTime.now());
        tracking.setSpeedKmh(SPEED_KMH);
        return trackingRepo.save(tracking);
    }

    // ── Scheduled: move all active cabs every 4 seconds ───────────────────────
    @Scheduled(fixedDelay = 4000)
    public void simulateMovement() {
        List<CabTracking> active = trackingRepo.findByStatus("EN_ROUTE");
        for (CabTracking tracking : active) {
            moveTowardsNextStop(tracking);
        }
    }

    private void moveTowardsNextStop(CabTracking tracking) {
        Route route = tracking.getRoute();
        if (route == null) return;

        // Reload route with stops
        Route fullRoute = routeRepo.findById(route.getId()).orElse(null);
        if (fullRoute == null || fullRoute.getStops() == null) return;

        List<Stop> stops = fullRoute.getStops().stream()
            .sorted(Comparator.comparingInt(Stop::getStopOrder))
            .toList();

        int idx = tracking.getCurrentStopIndex();

        // Determine target: next stop or office if all stops done
        double targetLat, targetLng;
        if (idx < stops.size()) {
            Stop target = stops.get(idx);
            targetLat = target.getLatitude();
            targetLng = target.getLongitude();
        } else {
            targetLat = OFFICE_LAT;
            targetLng = OFFICE_LNG;
        }

        double curLat = tracking.getCurrentLat();
        double curLng = tracking.getCurrentLng();
        double dist = OptimizationService.haversine(curLat, curLng, targetLat, targetLng);

        // Step size: speed * time_interval_hours
        double stepKm = SPEED_KMH * (4.0 / 3600.0); // 4 seconds

        if (dist <= stepKm) {
            // Arrived at this stop
            tracking.setCurrentLat(targetLat);
            tracking.setCurrentLng(targetLng);

            if (idx < stops.size()) {
                tracking.setCurrentStopIndex(idx + 1);
                tracking.setStatus("AT_STOP");
                // Will resume EN_ROUTE on next tick
            } else {
                tracking.setStatus("COMPLETED");
            }
        } else {
            // Move fraction toward target
            double fraction = stepKm / dist;
            tracking.setCurrentLat(curLat + fraction * (targetLat - curLat));
            tracking.setCurrentLng(curLng + fraction * (targetLng - curLng));
            tracking.setStatus("EN_ROUTE");
        }
        tracking.setUpdatedAt(LocalDateTime.now());
        trackingRepo.save(tracking);
    }

    // After AT_STOP pause, resume movement (called by scheduler below)
    @Scheduled(fixedDelay = 6000)
    public void resumeFromStops() {
        trackingRepo.findByStatus("AT_STOP").forEach(t -> {
            t.setStatus("EN_ROUTE");
            trackingRepo.save(t);
        });
    }

    // ── Public API methods ────────────────────────────────────────────────────

    public Optional<CabTracking> getByRoute(Long routeId) {
        return trackingRepo.findByRouteId(routeId);
    }

    public List<CabTracking> getAllActive() {
        List<CabTracking> list = new ArrayList<>();
        list.addAll(trackingRepo.findByStatus("EN_ROUTE"));
        list.addAll(trackingRepo.findByStatus("AT_STOP"));
        return list;
    }

    // ETA calculation: distance remaining / speed
    public Map<String, Object> getEta(Long routeId, int stopIndex) {
        CabTracking t = trackingRepo.findByRouteId(routeId).orElse(null);
        if (t == null) return Map.of("eta", "Unknown");

        Route fullRoute = routeRepo.findById(routeId).orElse(null);
        if (fullRoute == null || fullRoute.getStops() == null) return Map.of("eta", "Unknown");

        List<Stop> stops = fullRoute.getStops().stream()
            .sorted(Comparator.comparingInt(Stop::getStopOrder))
            .toList();

        // Sum distance from cab → remaining stops up to target
        double totalDist = 0;
        double lat = t.getCurrentLat(), lng = t.getCurrentLng();
        int curIdx = t.getCurrentStopIndex();

        for (int i = curIdx; i <= stopIndex && i < stops.size(); i++) {
            Stop s = stops.get(i);
            totalDist += OptimizationService.haversine(lat, lng, s.getLatitude(), s.getLongitude());
            lat = s.getLatitude();
            lng = s.getLongitude();
        }

        double etaMinutes = (totalDist / SPEED_KMH) * 60;
        return Map.of(
            "etaMinutes", Math.round(etaMinutes),
            "distanceKm", Math.round(totalDist * 10.0) / 10.0,
            "cabLat", t.getCurrentLat(),
            "cabLng", t.getCurrentLng(),
            "status", t.getStatus()
        );
    }
}
