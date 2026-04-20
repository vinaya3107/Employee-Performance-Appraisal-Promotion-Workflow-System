package com.appraisal.controller;

import com.appraisal.model.CommitteeReview;
import com.appraisal.service.CommitteeReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/committee-reviews")
@RequiredArgsConstructor
public class CommitteeReviewController {

    private final CommitteeReviewService service;

    @PostMapping
    public ResponseEntity<CommitteeReview> saveReview(@RequestBody CommitteeReview review) {
        return ResponseEntity.ok(service.saveReview(review));
    }

    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<List<CommitteeReview>> getByCycle(@PathVariable Long cycleId) {
        return ResponseEntity.ok(service.getReviewsByCycle(cycleId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<CommitteeReview>> getPendingReviews() {
        return ResponseEntity.ok(service.getAllReviews());
    }
}
