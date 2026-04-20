package com.appraisal.service;

import com.appraisal.model.CommitteeReview;
import com.appraisal.repository.CommitteeReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommitteeReviewService {

    private final CommitteeReviewRepository repository;
    private final AppraisalSummaryService summaryService;
    private final com.appraisal.repository.UserRepository userRepository;
    private final com.appraisal.repository.AppraisalCycleRepository cycleRepository;

    @org.springframework.transaction.annotation.Transactional
    public CommitteeReview saveReview(CommitteeReview review) {
        // Fetch full entities to avoid proxy issues
        if (review.getEmployee() != null) {
            review.setEmployee(userRepository.findById(review.getEmployee().getId()).orElseThrow());
        }
        if (review.getReviewer() != null) {
            review.setReviewer(userRepository.findById(review.getReviewer().getId()).orElseThrow());
        }
        if (review.getCycle() != null) {
            review.setCycle(cycleRepository.findById(review.getCycle().getId()).orElseThrow());
        }

        // Check for existing review to prevent duplicates
        java.util.Optional<CommitteeReview> existing = repository.findByEmployeeIdAndCycleId(
            review.getEmployee().getId(), review.getCycle().getId());
        
        if (existing.isPresent()) {
            CommitteeReview cr = existing.get();
            cr.setFinalRating(review.getFinalRating());
            cr.setPromotionRecommendation(review.getPromotionRecommendation());
            cr.setComments(review.getComments());
            cr.setOverrideReason(review.getOverrideReason());
            cr.setReviewedAt(java.time.LocalDateTime.now());
            review = cr;
        } else {
            review.setReviewedAt(java.time.LocalDateTime.now());
        }

        CommitteeReview saved = repository.save(review);
        
        // Trigger summary computation after committee review
        summaryService.calculateAndSaveSummary(saved.getEmployee().getId(), saved.getCycle().getId());
        
        return saved;
    }

    public List<CommitteeReview> getReviewsByCycle(Long cycleId) {
        return repository.findByCycleId(cycleId);
    }

    public List<CommitteeReview> getAllReviews() {
        return repository.findAll();
    }
}
