package com.appraisal.service;

import com.appraisal.dto.RegisterRequest;
import com.appraisal.model.User;
import com.appraisal.model.enums.Role;
import com.appraisal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(RegisterRequest request, String creatorEmail) {
        User creator = repository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("Creator not found"));
        
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        Role creatorRole = creator.getRole();
        Role targetRole = request.getRole();

        if (creatorRole == Role.ADMIN) {
            if (targetRole == Role.ADMIN) {
                throw new RuntimeException("ADMIN cannot create another ADMIN");
            }
        } else if (creatorRole == Role.HR_MANAGER) {
            if (targetRole == Role.ADMIN || targetRole == Role.REVIEW_COMMITTEE || targetRole == Role.HR_MANAGER) {
                throw new RuntimeException("HR_MANAGER can only create MANAGER and EMPLOYEE");
            }
        } else {
            throw new RuntimeException("User does not have permission to create users");
        }

        User manager = null;
        if (targetRole == Role.EMPLOYEE) {
            if (request.getManagerId() == null) {
                throw new RuntimeException("Manager ID is required for EMPLOYEE");
            }
            manager = repository.findById(request.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found with ID: " + request.getManagerId()));
            if (manager.getRole() != Role.MANAGER) {
                throw new RuntimeException("Assigned user is not a MANAGER");
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(targetRole)
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .joiningDate(request.getJoiningDate())
                .manager(manager)
                .build();

        return repository.save(user);
    }

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

    public User updateUserRole(Long id, Role role) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return repository.save(user);
    }

    public void deleteUser(Long id) {
        repository.deleteById(id);
    }
}
