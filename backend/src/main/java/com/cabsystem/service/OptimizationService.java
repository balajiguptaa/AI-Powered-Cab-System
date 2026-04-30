package com.cabsystem.service;

import com.cabsystem.model.*;
import com.cabsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OptimizationService {

    @Autowired private CabRequestRepository requestRepo;
    @Autowired private CabRepository cabRepo;
    @Autowired private RouteRepository routeRepo;
    @Autowired private StopRepository stopRepo;
    @Autowired private NotificationRepository notifRepo;
    @Autowired private CabTrackingService trackingService;

    // Office/destination coordinates (can be made configurable)
    private static final double OFFICE_LAT = 12.9716;
    private static final double OFFICE_LNG = 77.5946;

    /**
     * Main entry point: clusters pending requests, builds routes, assigns cabs.
     */
    public List<Route> runOptimization() {
        List<CabRequest> pending = requestRepo.findByStatus("PENDING");
        if (pending.isEmpty()) return Collections.emptyList();

        int k = estimateK(pending.size());
        List<List<CabRequest>> clusters = kMeans(pending, k);

        List<Cab> availableCabs = cabRepo.findByStatus("AVAILABLE");
        List<Route> routes = new ArrayList<>();

        for (int i = 0; i < clusters.size(); i++) {
            List<CabRequest> cluster = clusters.get(i);
            if (cluster.isEmpty()) continue;

            Cab cab = findBestCab(availableCabs, cluster.size());
            if (cab == null) continue;

            List<CabRequest> ordered = nearestNeighborSort(cluster);
            Route route = buildRoute(ordered, cab, i);
            routes.add(route);
            trackingService.startTracking(route);

            cab.setStatus("ASSIGNED");
            cabRepo.save(cab);
            availableCabs.remove(cab);

            // Update request status and notify employees
            for (CabRequest req : ordered) {
                req.setStatus("ASSIGNED");
                req.setRoute(route);
                requestRepo.save(req);
                sendNotification(req.getEmployee().getUser(),
                    "Your cab has been assigned! Route: " + route.getName(), "SUCCESS");
            }
        }
        return routes;
    }

    // ─── K-Means Clustering ───────────────────────────────────────────────────

    private int estimateK(int n) {
        return Math.max(1, (int) Math.ceil(n / 4.0)); // ~4 per cab
    }

    private List<List<CabRequest>> kMeans(List<CabRequest> requests, int k) {
        int maxIter = 100;
        // Init centroids randomly
        List<double[]> centroids = new ArrayList<>();
        List<CabRequest> shuffled = new ArrayList<>(requests);
        Collections.shuffle(shuffled);
        for (int i = 0; i < Math.min(k, shuffled.size()); i++) {
            CabRequest r = shuffled.get(i);
            centroids.add(new double[]{r.getPickupLat(), r.getPickupLng()});
        }

        List<List<CabRequest>> clusters = null;
        for (int iter = 0; iter < maxIter; iter++) {
            clusters = new ArrayList<>();
            for (int i = 0; i < k; i++) clusters.add(new ArrayList<>());

            // Assign each request to nearest centroid
            for (CabRequest req : requests) {
                int best = 0;
                double bestDist = Double.MAX_VALUE;
                for (int i = 0; i < centroids.size(); i++) {
                    double d = haversine(req.getPickupLat(), req.getPickupLng(),
                                        centroids.get(i)[0], centroids.get(i)[1]);
                    if (d < bestDist) { bestDist = d; best = i; }
                }
                clusters.get(best).add(req);
            }

            // Recalculate centroids
            boolean changed = false;
            for (int i = 0; i < centroids.size(); i++) {
                if (clusters.get(i).isEmpty()) continue;
                double lat = clusters.get(i).stream().mapToDouble(CabRequest::getPickupLat).average().orElse(0);
                double lng = clusters.get(i).stream().mapToDouble(CabRequest::getPickupLng).average().orElse(0);
                if (Math.abs(centroids.get(i)[0] - lat) > 0.0001) changed = true;
                centroids.set(i, new double[]{lat, lng});
            }
            if (!changed) break;
        }
        return clusters;
    }

    // ─── Nearest Neighbor Route Optimization ─────────────────────────────────

    private List<CabRequest> nearestNeighborSort(List<CabRequest> requests) {
        if (requests.size() <= 1) return requests;

        List<CabRequest> unvisited = new ArrayList<>(requests);
        List<CabRequest> ordered = new ArrayList<>();

        // Start from the point farthest from office
        CabRequest start = unvisited.stream()
            .max(Comparator.comparingDouble(r -> haversine(r.getPickupLat(), r.getPickupLng(), OFFICE_LAT, OFFICE_LNG)))
            .orElse(unvisited.get(0));

        ordered.add(start);
        unvisited.remove(start);
        double curLat = start.getPickupLat(), curLng = start.getPickupLng();

        while (!unvisited.isEmpty()) {
            final double lat = curLat, lng = curLng;
            CabRequest nearest = unvisited.stream()
                .min(Comparator.comparingDouble(r -> haversine(r.getPickupLat(), r.getPickupLng(), lat, lng)))
                .orElseThrow();
            ordered.add(nearest);
            unvisited.remove(nearest);
            curLat = nearest.getPickupLat();
            curLng = nearest.getPickupLng();
        }
        return ordered;
    }

    // ─── Cab Allocation ───────────────────────────────────────────────────────

    private Cab findBestCab(List<Cab> cabs, int needed) {
        return cabs.stream()
            .filter(c -> c.getCapacity() >= needed)
            .min(Comparator.comparingInt(Cab::getCapacity)) // smallest that fits
            .orElse(cabs.stream()
                .max(Comparator.comparingInt(Cab::getCapacity))
                .orElse(null));
    }

    // ─── Route Building ───────────────────────────────────────────────────────

    private Route buildRoute(List<CabRequest> ordered, Cab cab, int clusterIdx) {
        Route route = new Route();
        route.setCab(cab);
        route.setName("Route-" + (clusterIdx + 1) + "-" + System.currentTimeMillis());
        route.setClusterGroup(clusterIdx);
        route.setScheduledTime(LocalDateTime.now().plusHours(1));
        route.setStatus("PLANNED");

        double total = 0;
        for (int i = 0; i < ordered.size() - 1; i++) {
            total += haversine(ordered.get(i).getPickupLat(), ordered.get(i).getPickupLng(),
                               ordered.get(i + 1).getPickupLat(), ordered.get(i + 1).getPickupLng());
        }
        if (!ordered.isEmpty()) {
            CabRequest last = ordered.get(ordered.size() - 1);
            total += haversine(last.getPickupLat(), last.getPickupLng(), OFFICE_LAT, OFFICE_LNG);
        }
        route.setTotalDistance(Math.round(total * 10.0) / 10.0);
        routeRepo.save(route);

        List<Stop> stops = new ArrayList<>();
        for (int i = 0; i < ordered.size(); i++) {
            CabRequest req = ordered.get(i);
            Stop stop = new Stop();
            stop.setRoute(route);
            stop.setEmployee(req.getEmployee());
            stop.setStopOrder(i + 1);
            stop.setLatitude(req.getPickupLat());
            stop.setLongitude(req.getPickupLng());
            stop.setAddress(req.getPickupAddress());
            stops.add(stopRepo.save(stop));
        }
        route.setStops(stops);
        return route;
    }

    // ─── Demand Prediction ────────────────────────────────────────────────────

    public List<Map<String, Object>> getDemandPrediction() {
        List<Object[]> raw = requestRepo.getRequestCountByHour();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> m = new HashMap<>();
            m.put("hour", row[0]);
            m.put("count", row[1]);
            m.put("slot", toSlotLabel((int) row[0]));
            result.add(m);
        }
        return result;
    }

    private String toSlotLabel(int hour) {
        if (hour >= 6 && hour < 10) return "Morning Rush";
        if (hour >= 10 && hour < 14) return "Mid Morning";
        if (hour >= 14 && hour < 18) return "Afternoon";
        if (hour >= 18 && hour < 22) return "Evening Rush";
        return "Night";
    }

    // ─── Haversine Distance (km) ──────────────────────────────────────────────

    public static double haversine(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ─── Notification Helper ──────────────────────────────────────────────────

    private void sendNotification(User user, String message, String type) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        n.setType(type);
        notifRepo.save(n);
    }
}
