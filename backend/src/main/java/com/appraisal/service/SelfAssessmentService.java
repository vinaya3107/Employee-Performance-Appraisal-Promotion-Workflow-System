package com.appraisal.service;

import com.appraisal.model.AppraisalCycle;
import com.appraisal.model.SelfAssessment;
import com.appraisal.model.enums.AssessmentStatus;
import com.appraisal.model.enums.CycleStatus;
import com.appraisal.repository.AppraisalCycleRepository;
import com.appraisal.repository.SelfAssessmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SelfAssessmentService {

    private final SelfAssessmentRepository repository;
    private final AppraisalCycleRepository cycleRepository;

    public SelfAssessment saveAssessment(SelfAssessment assessment) {
        // Validate cycle stage
        AppraisalCycle cycle = cycleRepository.findById(assessment.getCycle().getId())
                .orElseThrow(() -> new RuntimeException("Cycle not found"));
        
        if (cycle.getStatus() != CycleStatus.SELF_ASSESSMENT) {
            throw new RuntimeException("Self-assessment can only be saved when the cycle is in SELF_ASSESSMENT stage. Current stage: " + cycle.getStatus());
        }

        // Prevent duplicates: if ID is not provided, check if one already exists for this employee/cycle/kpi
        if (assessment.getId() == null) {
            List<SelfAssessment> existing = repository.findByEmployeeIdAndCycleId(
                    assessment.getEmployee().getId(), assessment.getCycle().getId());
            
            Optional<SelfAssessment> match = existing.stream()
                    .filter(sa -> sa.getKpi().getId().equals(assessment.getKpi().getId()))
                    .findFirst();
            
            if (match.isPresent()) {
                SelfAssessment toUpdate = match.get();
                toUpdate.setSelfRating(assessment.getSelfRating());
                toUpdate.setSelfComments(assessment.getSelfComments());
                return repository.save(toUpdate);
            }
        }

        return repository.save(assessment);
    }

    public SelfAssessment submitAssessment(Long id) {
        SelfAssessment assessment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
        
        // Also validate stage on submission
        if (assessment.getCycle().getStatus() != CycleStatus.SELF_ASSESSMENT) {
            throw new RuntimeException("Self-assessment can only be submitted when the cycle is in SELF_ASSESSMENT stage.");
        }

        assessment.setStatus(AssessmentStatus.SUBMITTED);
        assessment.setSubmittedAt(LocalDateTime.now());
        return repository.save(assessment);
    }

    public List<SelfAssessment> getAssessmentsByEmployeeAndCycle(Long employeeId, Long cycleId) {
        return repository.findByEmployeeIdAndCycleId(employeeId, cycleId);
    }
}
