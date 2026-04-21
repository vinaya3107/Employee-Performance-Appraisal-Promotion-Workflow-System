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

    @PostMapping("/apply")
    public ResponseEntity<PromotionRecord> applyForPromotion(@RequestBody PromotionRecord record) {
        return ResponseEntity.ok(service.applyForPromotion(record));
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<PromotionRecord> approvePromotion(@PathVariable Long id) {
        return ResponseEntity.ok(service.approvePromotion(id));
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<PromotionRecord> rejectPromotion(@PathVariable Long id) {
        return ResponseEntity.ok(service.rejectPromotion(id));
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
