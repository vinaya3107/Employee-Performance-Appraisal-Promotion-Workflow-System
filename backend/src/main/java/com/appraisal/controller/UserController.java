package com.appraisal.controller;

import com.appraisal.model.User;
import com.appraisal.model.enums.Role;
import com.appraisal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getUserById(id));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(service.getUsersByRole(role));
    }

    @GetMapping("/{id}/direct-reports")
    public ResponseEntity<List<User>> getDirectReports(@PathVariable Long id) {
        return ResponseEntity.ok(service.getDirectReports(id));
    }
}
