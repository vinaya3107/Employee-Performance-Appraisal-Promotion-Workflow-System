package com.appraisal.service;

import com.appraisal.model.ManagerAssessment;
import com.appraisal.model.AppraisalCycle;
import com.appraisal.model.enums.CycleStatus;
import com.appraisal.repository.ManagerAssessmentRepository;
import com.appraisal.repository.AppraisalCycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManagerAssessmentService {

    private final ManagerAssessmentRepository repository;
    private final AppraisalSummaryService summaryService;
    private final AppraisalCycleRepository cycleRepository;
    private final com.appraisal.repository.UserRepository userRepository;
    private final com.appraisal.repository.PerformanceKPIRepository kpiRepository;

    @org.springframework.transaction.annotation.Transactional
    public ManagerAssessment saveAssessment(ManagerAssessment assessment) {
        try {
            System.out.println("Processing manager assessment for employee: " + 
                (assessment.getEmployee() != null ? assessment.getEmployee().getId() : "null") + 
                ", cycle: " + (assessment.getCycle() != null ? assessment.getCycle().getId() : "null") +
                ", kpi: " + (assessment.getKpi() != null ? assessment.getKpi().getId() : "null"));

            if (assessment.getManagerRating() == null) {
                throw new RuntimeException("Manager rating is required.");
            }

            if (assessment.getManagerRating() <= 2 && (assessment.getManagerComment() == null || assessment.getManagerComment().trim().isEmpty())) {
                throw new RuntimeException("Comment is required for ratings of 2 or below.");
            }

            if (assessment.getCycle() != null) {
                AppraisalCycle cycle = cycleRepository.findById(assessment.getCycle().getId())
                    .orElseThrow(() -> new RuntimeException("Cycle not found with ID: " + assessment.getCycle().getId()));
                
                System.out.println("Cycle status: " + cycle.getStatus());
                if (cycle.getStatus() != CycleStatus.MANAGER_REVIEW && 
                    cycle.getStatus() != CycleStatus.SELF_ASSESSMENT &&
                    cycle.getStatus() != CycleStatus.ACTIVE) {
                    throw new RuntimeException("Manager review is only allowed during ACTIVE, SELF_ASSESSMENT or MANAGER_REVIEW stage. Current: " + cycle.getStatus());
                }
                assessment.setCycle(cycle);
            }
            
            // Fetch full entities to avoid NullPointerExceptions caused by partial frontend objects in Hibernate cache
            if (assessment.getEmployee() != null) {
                assessment.setEmployee(userRepository.findById(assessment.getEmployee().getId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + assessment.getEmployee().getId())));
            }
            if (assessment.getManager() != null) {
                assessment.setManager(userRepository.findById(assessment.getManager().getId())
                    .orElseThrow(() -> new RuntimeException("Manager not found with ID: " + assessment.getManager().getId())));
            }
            if (assessment.getKpi() != null) {
                assessment.setKpi(kpiRepository.findById(assessment.getKpi().getId())
                    .orElseThrow(() -> new RuntimeException("KPI not found with ID: " + assessment.getKpi().getId())));
            }

            // Check for existing assessment to avoid duplicates
            java.util.List<ManagerAssessment> existing = repository.findByEmployeeIdAndCycleId(
                assessment.getEmployee().getId(), assessment.getCycle().getId());
            
            ManagerAssessment toSave = assessment;
            for (ManagerAssessment ma : existing) {
                if (ma.getKpi().getId().equals(assessment.getKpi().getId())) {
                    ma.setManagerRating(assessment.getManagerRating());
                    ma.setManagerComment(assessment.getManagerComment());
                    ma.setSubmittedAt(java.time.LocalDateTime.now());
                    toSave = ma;
                    break;
                }
            }

            if (toSave == assessment) {
                assessment.setSubmittedAt(java.time.LocalDateTime.now());
            }
            
            ManagerAssessment saved = repository.save(toSave);
            System.out.println("Successfully saved manager assessment. Triggering summary recalculation.");
            
            // Trigger summary recalculation
            if (saved.getEmployee() != null && saved.getCycle() != null) {
                summaryService.calculateAndSaveSummary(saved.getEmployee().getId(), saved.getCycle().getId());
            }
            
            return saved;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in saveAssessment: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<ManagerAssessment> getAssessmentsByManagerAndCycle(Long managerId, Long cycleId) {
        return repository.findByManagerIdAndCycleId(managerId, cycleId);
    }

    public List<ManagerAssessment> getAssessmentsByEmployeeAndCycle(Long employeeId, Long cycleId) {
        return repository.findByEmployeeIdAndCycleId(employeeId, cycleId);
    }
}
