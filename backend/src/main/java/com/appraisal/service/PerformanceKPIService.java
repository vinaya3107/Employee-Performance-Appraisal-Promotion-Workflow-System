package com.appraisal.service;

import com.appraisal.model.PerformanceKPI;
import com.appraisal.repository.PerformanceKPIRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceKPIService {

    private final PerformanceKPIRepository repository;

    public PerformanceKPI createKPI(PerformanceKPI kpi) {
        return repository.save(kpi);
    }

    public List<PerformanceKPI> getAllKPIs() {
        return repository.findAll();
    }

    public List<PerformanceKPI> getKPIsByDesignation(String designation) {
        return repository.findByApplicableDesignation(designation);
    }
}
