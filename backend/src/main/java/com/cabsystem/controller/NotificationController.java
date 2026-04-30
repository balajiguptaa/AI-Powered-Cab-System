package com.cabsystem.controller;

import com.cabsystem.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private NotificationService notifService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notifService.getForUser(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<?> getUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", notifService.getUnreadCount(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        notifService.markRead(id);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllRead(@PathVariable Long userId) {
        notifService.markAllRead(userId);
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
