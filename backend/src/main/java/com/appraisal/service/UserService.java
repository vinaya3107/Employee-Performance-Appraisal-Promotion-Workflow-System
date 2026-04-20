package com.appraisal.service;

import com.appraisal.model.User;
import com.appraisal.model.enums.Role;
import com.appraisal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User getUserById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getUsersByRole(Role role) {
        return repository.findByRole(role);
    }

    public List<User> getDirectReports(Long managerId) {
        return repository.findByManagerId(managerId);
    }
}
