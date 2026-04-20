package com.appraisal.controller;

import com.appraisal.model.ManagerAssessment;
import com.appraisal.service.ManagerAssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager-assessments")
@RequiredArgsConstructor
public class ManagerAssessmentController {

    private final ManagerAssessmentService service;

    @PostMapping
    public ResponseEntity<ManagerAssessment> saveAssessment(@RequestBody ManagerAssessment assessment) {
        return ResponseEntity.ok(service.saveAssessment(assessment));
    }

    @GetMapping("/team/{managerId}/cycle/{cycleId}")
    public ResponseEntity<List<ManagerAssessment>> getByManagerAndCycle(
            @PathVariable Long managerId,
            @PathVariable Long cycleId) {
        return ResponseEntity.ok(service.getAssessmentsByManagerAndCycle(managerId, cycleId));
    }
}
