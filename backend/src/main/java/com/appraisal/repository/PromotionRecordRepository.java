package com.appraisal.repository;

import com.appraisal.model.PromotionRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PromotionRecordRepository extends JpaRepository<PromotionRecord, Long> {
    List<PromotionRecord> findByEmployeeId(Long employeeId);
    List<PromotionRecord> findByCycleId(Long cycleId);
}
