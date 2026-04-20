package com.appraisal.controller;

import com.appraisal.model.AppraisalSummary;
import com.appraisal.model.PromotionRecord;
import com.appraisal.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService service;

    @GetMapping("/eligible")
    public ResponseEntity<List<AppraisalSummary>> getEligiblePromotions() {
        return ResponseEntity.ok(service.getEligiblePromotions());
    }

    @PostMapping("/approve")
    public ResponseEntity<PromotionRecord> approvePromotion(@RequestBody PromotionRecord record) {
        return ResponseEntity.ok(service.approvePromotion(record));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PromotionRecord>> getPromotionsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(service.getPromotionsByEmployee(employeeId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<PromotionRecord>> getAllPromotions() {
        return ResponseEntity.ok(service.getAllPromotions());
    }
}
