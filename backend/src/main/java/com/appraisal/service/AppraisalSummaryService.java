package com.appraisal.service;

import com.appraisal.model.AppraisalSummary;
import com.appraisal.model.CommitteeReview;
import com.appraisal.model.ManagerAssessment;
import com.appraisal.model.User;
import com.appraisal.model.AppraisalCycle;
import com.appraisal.model.enums.OverallRating;
import com.appraisal.repository.AppraisalSummaryRepository;
import com.appraisal.repository.CommitteeReviewRepository;
import com.appraisal.repository.ManagerAssessmentRepository;
import com.appraisal.repository.UserRepository;
import com.appraisal.repository.AppraisalCycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AppraisalSummaryService {

    private final AppraisalSummaryRepository summaryRepository;
    private final ManagerAssessmentRepository managerAssessmentRepository;
    private final CommitteeReviewRepository committeeReviewRepository;
    private final UserRepository userRepository;
    private final AppraisalCycleRepository cycleRepository;

    public AppraisalSummary calculateAndSaveSummary(Long employeeId, Long cycleId) {
        List<ManagerAssessment> managerAssessments = managerAssessmentRepository.findByEmployeeIdAndCycleId(employeeId, cycleId);
        Optional<CommitteeReview> committeeReviewOptional = committeeReviewRepository.findByEmployeeIdAndCycleId(employeeId, cycleId);

        double totalManagerScore = 0;
        double totalWeight = 0;
        
        for (ManagerAssessment assessment : managerAssessments) {
            double weight = assessment.getKpi().getWeightage();
            totalManagerScore += assessment.getManagerRating() * weight;
            totalWeight += weight;
        }

        double avgManagerScore = totalWeight > 0 ? totalManagerScore / totalWeight : 0;
        double finalScore = avgManagerScore;
        boolean committeePromoRecommendation = false;

        if (committeeReviewOptional.isPresent()) {
            CommitteeReview cr = committeeReviewOptional.get();
            finalScore = cr.getFinalRating();
            committeePromoRecommendation = cr.getPromotionRecommendation();
        }

        boolean eligibleForPromotion = (avgManagerScore >= 3.0) && (finalScore >= 4.0) && committeePromoRecommendation;

        User employee = userRepository.findById(employeeId).orElseThrow();
        AppraisalCycle cycle = cycleRepository.findById(cycleId).orElseThrow();

        Optional<AppraisalSummary> existingSummary = summaryRepository.findByEmployeeIdAndCycleId(employeeId, cycleId);
        AppraisalSummary summary;
        
        if (existingSummary.isPresent()) {
            summary = existingSummary.get();
            summary.setAvgManagerScore(avgManagerScore);
            summary.setAvgCommitteeScore(finalScore);
            summary.setPromotionRecommended(eligibleForPromotion);
            summary.setOverallRating(eligibleForPromotion ? OverallRating.APPROVED : OverallRating.REJECTED);
        } else {
            summary = AppraisalSummary.builder()
                    .employee(employee)
                    .cycle(cycle)
                    .avgManagerScore(avgManagerScore)
                    .avgCommitteeScore(finalScore)
                    .promotionRecommended(eligibleForPromotion)
                    .overallRating(eligibleForPromotion ? OverallRating.APPROVED : OverallRating.REJECTED)
                    .build();
        }
        
        return summaryRepository.save(summary);
    }

    public Optional<AppraisalSummary> getSummaryByEmployeeAndCycle(Long employeeId, Long cycleId) {
        return summaryRepository.findByEmployeeIdAndCycleId(employeeId, cycleId);
    }

    public List<AppraisalSummary> getByCycleId(Long cycleId) {
        return summaryRepository.findByCycleId(cycleId);
    }
}
