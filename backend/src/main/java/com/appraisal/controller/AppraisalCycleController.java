package com.appraisal.controller;

import com.appraisal.model.AppraisalCycle;
import com.appraisal.model.enums.CycleStatus;
import com.appraisal.service.AppraisalCycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cycles")
@RequiredArgsConstructor
public class AppraisalCycleController {

    private final AppraisalCycleService service;

    @PostMapping
    public ResponseEntity<AppraisalCycle> createCycle(@RequestBody AppraisalCycle cycle) {
        return ResponseEntity.ok(service.createCycle(cycle));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<AppraisalCycle> activateCycle(@PathVariable Long id) {
        return ResponseEntity.ok(service.activateCycle(id));
    }

    @PutMapping("/{id}/transition")
    public ResponseEntity<AppraisalCycle> transitionCycle(@PathVariable Long id, @RequestParam CycleStatus status) {
        return ResponseEntity.ok(service.transitionCycle(id, status));
    }

    @GetMapping
    public ResponseEntity<List<AppraisalCycle>> getAllCycles() {
        return ResponseEntity.ok(service.getAllCycles());
    }

    @GetMapping("/active")
    public ResponseEntity<List<AppraisalCycle>> getActiveCycles() {
        return ResponseEntity.ok(service.getActiveCycles());
    }
}
