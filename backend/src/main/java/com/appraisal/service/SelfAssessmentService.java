package com.appraisal.service;

import com.appraisal.model.SelfAssessment;
import com.appraisal.model.AppraisalCycle;
import com.appraisal.model.User;
import com.appraisal.model.enums.AssessmentStatus;
import com.appraisal.model.enums.CycleStatus;
import com.appraisal.repository.SelfAssessmentRepository;
import com.appraisal.repository.AppraisalCycleRepository;
import com.appraisal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SelfAssessmentService {

    // Dummy comment to trigger re-compile
    private final SelfAssessmentRepository repository;
    private final AppraisalCycleRepository cycleRepository;
    private final UserRepository userRepository;
    private final com.appraisal.repository.PerformanceKPIRepository kpiRepository;

    public SelfAssessment saveAssessment(SelfAssessment assessment) {
        if (assessment.getCycle() != null) {
            AppraisalCycle cycle = cycleRepository.findById(assessment.getCycle().getId())
                .orElseThrow(() -> new RuntimeException("Cycle not found"));
            if (cycle.getStatus() != CycleStatus.ACTIVE && cycle.getStatus() != CycleStatus.SELF_ASSESSMENT) {
                throw new RuntimeException("Self-assessment is only allowed during ACTIVE or SELF_ASSESSMENT stage.");
            }
            assessment.setCycle(cycle);
        }
        
        // Fetch full employee to avoid serialization issues with partial objects
        if (assessment.getEmployee() != null) {
            User fullEmployee = userRepository.findById(assessment.getEmployee().getId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            assessment.setEmployee(fullEmployee);
        }

        if (assessment.getKpi() != null) {
            assessment.setKpi(kpiRepository.findById(assessment.getKpi().getId()).orElseThrow());
        }
        
        return repository.save(assessment);
    }

    public SelfAssessment submitAssessment(Long id) {
        SelfAssessment assessment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
        assessment.setStatus(AssessmentStatus.SUBMITTED);
        assessment.setSubmittedAt(LocalDateTime.now());
        return repository.save(assessment);
    }

    public List<SelfAssessment> getAssessmentsByEmployeeAndCycle(Long employeeId, Long cycleId) {
        return repository.findByEmployeeIdAndCycleId(employeeId, cycleId);
    }
}
