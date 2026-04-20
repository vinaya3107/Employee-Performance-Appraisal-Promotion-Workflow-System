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

    public CommitteeReview saveReview(CommitteeReview review) {
        review.setReviewedAt(LocalDateTime.now());
        CommitteeReview saved = repository.save(review);
        
        // Trigger summary computation after committee review
        summaryService.calculateAndSaveSummary(saved.getEmployee().getId(), saved.getCycle().getId());
        
        return saved;
    }

    public List<CommitteeReview> getReviewsByCycle(Long cycleId) {
        return repository.findByCycleId(cycleId);
    }
}
