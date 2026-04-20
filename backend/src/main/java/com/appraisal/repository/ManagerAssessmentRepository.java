package com.appraisal.repository;

import com.appraisal.model.ManagerAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManagerAssessmentRepository extends JpaRepository<ManagerAssessment, Long> {
    List<ManagerAssessment> findByManagerIdAndCycleId(Long managerId, Long cycleId);
    List<ManagerAssessment> findByEmployeeIdAndCycleId(Long employeeId, Long cycleId);
}
