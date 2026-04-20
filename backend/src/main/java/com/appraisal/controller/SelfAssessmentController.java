package com.appraisal.controller;

import com.appraisal.model.SelfAssessment;
import com.appraisal.service.SelfAssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/self-assessments")
@RequiredArgsConstructor
public class SelfAssessmentController {

    private final SelfAssessmentService service;

    @PostMapping
    public ResponseEntity<SelfAssessment> saveAssessment(@RequestBody SelfAssessment assessment) {
        return ResponseEntity.ok(service.saveAssessment(assessment));
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<SelfAssessment> submitAssessment(@PathVariable Long id) {
        return ResponseEntity.ok(service.submitAssessment(id));
    }

    @GetMapping("/employee/{employeeId}/cycle/{cycleId}")
    public ResponseEntity<List<SelfAssessment>> getByEmployeeAndCycle(
            @PathVariable Long employeeId,
            @PathVariable Long cycleId) {
        return ResponseEntity.ok(service.getAssessmentsByEmployeeAndCycle(employeeId, cycleId));
    }
}
