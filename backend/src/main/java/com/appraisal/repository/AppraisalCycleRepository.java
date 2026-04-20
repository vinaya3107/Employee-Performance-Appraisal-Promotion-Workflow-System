package com.appraisal.repository;

import com.appraisal.model.AppraisalCycle;
import com.appraisal.model.enums.CycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppraisalCycleRepository extends JpaRepository<AppraisalCycle, Long> {
    List<AppraisalCycle> findByStatus(CycleStatus status);
    Optional<AppraisalCycle> findByStatusAndCycleName(CycleStatus status, String cycleName);
}
