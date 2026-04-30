package com.cabsystem.service;

import com.cabsystem.model.Notification;
import com.cabsystem.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired private NotificationRepository notifRepo;

    public List<Notification> getForUser(Long userId) {
        return notifRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notifRepo.countByUserIdAndRead(userId, false);
    }

    public void markRead(Long id) {
        notifRepo.findById(id).ifPresent(n -> {
            n.setRead(true);
            notifRepo.save(n);
        });
    }

    public void markAllRead(Long userId) {
        notifRepo.findByUserIdOrderByCreatedAtDesc(userId).forEach(n -> {
            n.setRead(true);
            notifRepo.save(n);
        });
    }
}
