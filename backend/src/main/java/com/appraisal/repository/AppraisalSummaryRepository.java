package com.appraisal.repository;

import com.appraisal.model.AppraisalSummary;
import com.appraisal.model.enums.OverallRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppraisalSummaryRepository extends JpaRepository<AppraisalSummary, Long> {
    Optional<AppraisalSummary> findByEmployeeIdAndCycleId(Long employeeId, Long cycleId);
    List<AppraisalSummary> findByCycleId(Long cycleId);
    List<AppraisalSummary> findByOverallRating(OverallRating overallRating);
}
