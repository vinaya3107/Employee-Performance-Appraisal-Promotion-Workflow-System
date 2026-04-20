package com.appraisal.service;

import com.appraisal.model.SelfAssessment;
import com.appraisal.model.enums.AssessmentStatus;
import com.appraisal.repository.SelfAssessmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SelfAssessmentService {

    private final SelfAssessmentRepository repository;

    public SelfAssessment saveAssessment(SelfAssessment assessment) {
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
