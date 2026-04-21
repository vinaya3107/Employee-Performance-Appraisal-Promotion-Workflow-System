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
    private final com.appraisal.repository.UserRepository userRepository;

    public List<AppraisalSummary> getEligiblePromotions() {
        return summaryRepository.findByOverallRating(OverallRating.APPROVED)
                .stream()
                .filter(AppraisalSummary::getPromotionRecommended)
                .collect(Collectors.toList());
    }

    public PromotionRecord applyForPromotion(PromotionRecord record) {
        record.setStatus("APPLIED");
        record.setEffectiveDate(LocalDate.now());
        return repository.save(record);
    }

    public PromotionRecord approvePromotion(Long id) {
        PromotionRecord record = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion record not found"));

        if ("APPROVED".equals(record.getStatus())) {
            throw new RuntimeException("Promotion already approved");
        }

        record.setStatus("APPROVED");
        record.setEffectiveDate(LocalDate.now());

        // Update employee details
        com.appraisal.model.User employee = record.getEmployee();
        employee.setDesignation(record.getNewDesignation());
        employee.setSalary(record.getNewSalary());
        userRepository.save(employee);

        return repository.save(record);
    }

    public PromotionRecord rejectPromotion(Long id) {
        PromotionRecord record = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion record not found"));
        
        if ("APPROVED".equals(record.getStatus())) {
            throw new RuntimeException("Cannot reject an already approved promotion");
        }

        record.setStatus("REJECTED");
        return repository.save(record);
    }

    public List<PromotionRecord> getPromotionsByEmployee(Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }

    public List<PromotionRecord> getAllPromotions() {
        return repository.findAll();
    }
}
