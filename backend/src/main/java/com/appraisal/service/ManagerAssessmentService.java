package com.appraisal.service;

import com.appraisal.model.ManagerAssessment;
import com.appraisal.repository.ManagerAssessmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManagerAssessmentService {

    private final ManagerAssessmentRepository repository;
    private final AppraisalSummaryService summaryService;

    public ManagerAssessment saveAssessment(ManagerAssessment assessment) {
        log.info("Saving manager assessment for employee {} in cycle {}", 
                assessment.getEmployee().getId(), assessment.getCycle().getId());
                
        assessment.setSubmittedAt(LocalDateTime.now());
        
        // Prevent duplicates
        if (assessment.getId() == null) {
            List<ManagerAssessment> existing = repository.findByEmployeeIdAndCycleId(
                    assessment.getEmployee().getId(), assessment.getCycle().getId());
            
            Optional<ManagerAssessment> match = existing.stream()
                    .filter(ma -> ma.getKpi().getId().equals(assessment.getKpi().getId()))
                    .findFirst();
            
            if (match.isPresent()) {
                ManagerAssessment toUpdate = match.get();
                toUpdate.setManagerRating(assessment.getManagerRating());
                toUpdate.setManagerComment(assessment.getManagerComment());
                toUpdate.setSubmittedAt(LocalDateTime.now());
                ManagerAssessment saved = repository.save(toUpdate);
                summaryService.calculateAndSaveSummary(assessment.getEmployee().getId(), assessment.getCycle().getId());
                return saved;
            }
        }

        ManagerAssessment saved = repository.save(assessment);
        
        // Trigger appraisal summary recalculation after manager submits
        summaryService.calculateAndSaveSummary(assessment.getEmployee().getId(), assessment.getCycle().getId());
        
        return saved;
    }

    public List<ManagerAssessment> getAssessmentsByManagerAndCycle(Long managerId, Long cycleId) {
        return repository.findByManagerIdAndCycleId(managerId, cycleId);
    }

    public List<ManagerAssessment> getAssessmentsByEmployeeAndCycle(Long employeeId, Long cycleId) {
        return repository.findByEmployeeIdAndCycleId(employeeId, cycleId);
    }
}
