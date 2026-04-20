package com.appraisal.service;

import com.appraisal.model.AppraisalSummary;
import com.appraisal.model.PromotionRecord;
import com.appraisal.model.enums.OverallRating;
import com.appraisal.repository.AppraisalSummaryRepository;
import com.appraisal.repository.PromotionRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRecordRepository repository;
    private final AppraisalSummaryRepository summaryRepository;

    public List<AppraisalSummary> getEligiblePromotions() {
        return summaryRepository.findByOverallRating(OverallRating.APPROVED)
                .stream()
                .filter(AppraisalSummary::getPromotionRecommended)
                .collect(Collectors.toList());
    }

    public PromotionRecord approvePromotion(PromotionRecord record) {
        record.setEffectiveDate(LocalDate.now());
        // Assume simple 20% mock hike.
        record.setNewSalary(record.getNewSalary() != null ? record.getNewSalary() : 100000.0 * 1.20);
        return repository.save(record);
    }

    public List<PromotionRecord> getPromotionsByEmployee(Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }

    public List<PromotionRecord> getAllPromotions() {
        return repository.findAll();
    }
}
