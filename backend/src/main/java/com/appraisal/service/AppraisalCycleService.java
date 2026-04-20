package com.appraisal.service;

import com.appraisal.model.AppraisalCycle;
import com.appraisal.model.enums.CycleStatus;
import com.appraisal.repository.AppraisalCycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppraisalCycleService {

    private final AppraisalCycleRepository repository;

    public AppraisalCycle createCycle(AppraisalCycle cycle) {
        cycle.setStatus(CycleStatus.DRAFT);
        return repository.save(cycle);
    }

    public AppraisalCycle activateCycle(Long id) {
        AppraisalCycle cycle = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));
        cycle.setStatus(CycleStatus.ACTIVE);
        return repository.save(cycle);
    }

    public AppraisalCycle transitionCycle(Long id, CycleStatus status) {
        AppraisalCycle cycle = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));
        cycle.setStatus(status);
        return repository.save(cycle);
    }

    public List<AppraisalCycle> getAllCycles() {
        return repository.findAll();
    }

    public List<AppraisalCycle> getActiveCycles() {
        return repository.findByStatus(CycleStatus.ACTIVE);
    }
}
