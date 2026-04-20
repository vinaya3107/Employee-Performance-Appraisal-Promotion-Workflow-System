package com.appraisal.repository;

import com.appraisal.model.CommitteeReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommitteeReviewRepository extends JpaRepository<CommitteeReview, Long> {
    List<CommitteeReview> findByCycleId(Long cycleId);
    Optional<CommitteeReview> findByEmployeeIdAndCycleId(Long employeeId, Long cycleId);
}
