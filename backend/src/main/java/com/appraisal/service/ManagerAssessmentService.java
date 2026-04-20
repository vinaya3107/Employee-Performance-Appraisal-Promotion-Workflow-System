package com.appraisal.service;

import com.appraisal.model.ManagerAssessment;
import com.appraisal.repository.ManagerAssessmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManagerAssessmentService {

    private final ManagerAssessmentRepository repository;

    public ManagerAssessment saveAssessment(ManagerAssessment assessment) {
        assessment.setSubmittedAt(LocalDateTime.now());
        return repository.save(assessment);
    }

    public List<ManagerAssessment> getAssessmentsByManagerAndCycle(Long managerId, Long cycleId) {
        return repository.findByManagerIdAndCycleId(managerId, cycleId);
    }

    public List<ManagerAssessment> getAssessmentsByEmployeeAndCycle(Long employeeId, Long cycleId) {
        return repository.findByEmployeeIdAndCycleId(employeeId, cycleId);
    }
}
