package com.appraisal.repository;

import com.appraisal.model.SelfAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SelfAssessmentRepository extends JpaRepository<SelfAssessment, Long> {
    List<SelfAssessment> findByEmployeeIdAndCycleId(Long employeeId, Long cycleId);
    List<SelfAssessment> findByCycleId(Long cycleId);
}
