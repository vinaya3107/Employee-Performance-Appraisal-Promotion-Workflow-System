package com.appraisal.controller;

import com.appraisal.model.AppraisalSummary;
import com.appraisal.service.AppraisalSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appraisal-summary")
@RequiredArgsConstructor
public class AppraisalSummaryController {

    private final AppraisalSummaryService service;

    @GetMapping("/employee/{employeeId}/cycle/{cycleId}")
    public ResponseEntity<AppraisalSummary> getByEmployeeAndCycle(
            @PathVariable Long employeeId,
            @PathVariable Long cycleId) {
        return service.getSummaryByEmployeeAndCycle(employeeId, cycleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<List<AppraisalSummary>> getByCycle(@PathVariable Long cycleId) {
        return ResponseEntity.ok(service.getByCycleId(cycleId));
    }
}
