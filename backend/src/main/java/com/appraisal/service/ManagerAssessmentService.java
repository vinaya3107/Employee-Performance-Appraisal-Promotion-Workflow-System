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
        if (assessment.getCycle() != null) {
            AppraisalCycle cycle = cycleRepository.findById(assessment.getCycle().getId())
                .orElseThrow(() -> new RuntimeException("Cycle not found"));
            if (cycle.getStatus() != CycleStatus.MANAGER_REVIEW) {
                throw new RuntimeException("Manager review is only allowed during MANAGER_REVIEW stage.");
            }
            assessment.setCycle(cycle);
        }
        
        // Fetch full entities to avoid NullPointerExceptions caused by partial frontend objects in Hibernate cache
        if (assessment.getEmployee() != null) {
            assessment.setEmployee(userRepository.findById(assessment.getEmployee().getId()).orElseThrow());
        }
        if (assessment.getManager() != null) {
            assessment.setManager(userRepository.findById(assessment.getManager().getId()).orElseThrow());
        }
        if (assessment.getKpi() != null) {
            assessment.setKpi(kpiRepository.findById(assessment.getKpi().getId()).orElseThrow());
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
        
        // Trigger summary recalculation
        if (saved.getEmployee() != null && saved.getCycle() != null) {
            summaryService.calculateAndSaveSummary(saved.getEmployee().getId(), saved.getCycle().getId());
        }
        
        return saved;
    }

    public List<ManagerAssessment> getAssessmentsByManagerAndCycle(Long managerId, Long cycleId) {
        return repository.findByManagerIdAndCycleId(managerId, cycleId);
    }

    public List<ManagerAssessment> getAssessmentsByEmployeeAndCycle(Long employeeId, Long cycleId) {
        return repository.findByEmployeeIdAndCycleId(employeeId, cycleId);
    }
}
