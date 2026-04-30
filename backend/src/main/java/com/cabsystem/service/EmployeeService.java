package com.cabsystem.service;

import com.cabsystem.model.Employee;
import com.cabsystem.model.User;
import com.cabsystem.repository.EmployeeRepository;
import com.cabsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EmployeeService {

    @Autowired private EmployeeRepository employeeRepo;
    @Autowired private UserRepository userRepo;

    public List<Employee> getAll() { return employeeRepo.findAll(); }

    public Employee getById(Long id) {
        return employeeRepo.findById(id).orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public Employee getByUserId(Long userId) {
        return employeeRepo.findByUserId(userId).orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public Employee create(Map<String, Object> data) {
        User user = new User();
        user.setUsername((String) data.get("username"));
        user.setPassword((String) data.get("password"));
        user.setRole("EMPLOYEE");
        user.setEmail((String) data.get("email"));
        user.setPhone((String) data.get("phone"));
        userRepo.save(user);

        Employee emp = new Employee();
        emp.setUser(user);
        emp.setName((String) data.get("name"));
        emp.setDepartment((String) data.get("department"));
        emp.setAddress((String) data.get("address"));
        emp.setLatitude(Double.parseDouble(data.get("latitude").toString()));
        emp.setLongitude(Double.parseDouble(data.get("longitude").toString()));
        emp.setShift((String) data.getOrDefault("shift", "MORNING"));
        return employeeRepo.save(emp);
    }

    public Employee update(Long id, Map<String, Object> data) {
        Employee emp = getById(id);
        if (data.containsKey("name")) emp.setName((String) data.get("name"));
        if (data.containsKey("department")) emp.setDepartment((String) data.get("department"));
        if (data.containsKey("address")) emp.setAddress((String) data.get("address"));
        if (data.containsKey("latitude")) emp.setLatitude(Double.parseDouble(data.get("latitude").toString()));
        if (data.containsKey("longitude")) emp.setLongitude(Double.parseDouble(data.get("longitude").toString()));
        if (data.containsKey("shift")) emp.setShift((String) data.get("shift"));
        return employeeRepo.save(emp);
    }

    public void delete(Long id) {
        Employee emp = getById(id);
        emp.getUser().setActive(false);
        userRepo.save(emp.getUser());
    }
}
