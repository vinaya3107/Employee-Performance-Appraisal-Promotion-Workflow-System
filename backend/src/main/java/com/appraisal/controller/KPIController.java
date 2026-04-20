package com.appraisal.controller;

import com.appraisal.model.PerformanceKPI;
import com.appraisal.service.PerformanceKPIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kpis")
@RequiredArgsConstructor
public class KPIController {

    private final PerformanceKPIService service;

    @PostMapping
    public ResponseEntity<PerformanceKPI> createKPI(@RequestBody PerformanceKPI kpi) {
        return ResponseEntity.ok(service.createKPI(kpi));
    }

    @GetMapping
    public ResponseEntity<List<PerformanceKPI>> getAllKPIs() {
        return ResponseEntity.ok(service.getAllKPIs());
    }

    @GetMapping("/designation/{designation}")
    public ResponseEntity<List<PerformanceKPI>> getKPIsByDesignation(@PathVariable String designation) {
        return ResponseEntity.ok(service.getKPIsByDesignation(designation));
    }
}
