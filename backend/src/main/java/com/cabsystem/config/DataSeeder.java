package com.cabsystem.config;

import com.cabsystem.model.*;
import com.cabsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepo;
    @Autowired private EmployeeRepository employeeRepo;
    @Autowired private CabRepository cabRepo;

    @Override
    public void run(String... args) {
        // Only seed if empty
        if (userRepo.count() > 0) return;

        // Admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword("admin123");
        admin.setRole("ADMIN");
        admin.setEmail("admin@company.com");
        admin.setPhone("9999999999");
        userRepo.save(admin);

        // Employee users with Bangalore coordinates
        createEmployee("emp1", "pass123", "Arjun Kumar", "Engineering", "Koramangala", 12.9279, 77.6271);
        createEmployee("emp2", "pass123", "Priya Sharma", "Marketing", "Indiranagar", 12.9784, 77.6408);
        createEmployee("emp3", "pass123", "Ravi Patel", "Finance", "Whitefield", 12.9698, 77.7500);
        createEmployee("emp4", "pass123", "Sneha Rao", "HR", "Jayanagar", 12.9308, 77.5838);
        createEmployee("emp5", "pass123", "Kiran Nair", "Engineering", "HSR Layout", 12.9116, 77.6389);

        // Cabs
        createCab("KA01AB1234", "Suresh M", "9876543210", 4, "SEDAN");
        createCab("KA02CD5678", "Ramesh K", "9876543211", 6, "SUV");
        createCab("KA03EF9012", "Ganesh B", "9876543212", 8, "MINIVAN");
        createCab("KA04GH3456", "Mahesh R", "9876543213", 4, "SEDAN");

        System.out.println("✅ Seed data loaded. Login: admin/admin123 or emp1/pass123");
    }

    private void createEmployee(String username, String password, String name, String dept, String address, double lat, double lng) {
        User u = new User();
        u.setUsername(username);
        u.setPassword(password);
        u.setRole("EMPLOYEE");
        u.setEmail(username + "@company.com");
        userRepo.save(u);

        Employee e = new Employee();
        e.setUser(u);
        e.setName(name);
        e.setDepartment(dept);
        e.setAddress(address + ", Bangalore");
        e.setLatitude(lat);
        e.setLongitude(lng);
        e.setShift("MORNING");
        employeeRepo.save(e);
    }

    private void createCab(String number, String driver, String phone, int capacity, String type) {
        Cab c = new Cab();
        c.setNumber(number);
        c.setDriverName(driver);
        c.setDriverPhone(phone);
        c.setCapacity(capacity);
        c.setType(type);
        c.setStatus("AVAILABLE");
        cabRepo.save(c);
    }
}
