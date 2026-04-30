package com.cabsystem.service;

import com.cabsystem.model.Employee;
import com.cabsystem.model.User;
import com.cabsystem.repository.EmployeeRepository;
import com.cabsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired private UserRepository userRepo;
    @Autowired private EmployeeRepository employeeRepo;

    public Map<String, Object> login(String username, String password) {
        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password) || !userOpt.get().isActive()) {
            throw new RuntimeException("Invalid credentials");
        }
        User user = userOpt.get();
        Map<String, Object> resp = new HashMap<>();
        resp.put("userId", user.getId());
        resp.put("username", user.getUsername());
        resp.put("role", user.getRole());
        resp.put("email", user.getEmail());

        if ("EMPLOYEE".equals(user.getRole())) {
            employeeRepo.findByUserId(user.getId()).ifPresent(e -> {
                resp.put("employeeId", e.getId());
                resp.put("name", e.getName());
            });
        }
        return resp;
    }
}
