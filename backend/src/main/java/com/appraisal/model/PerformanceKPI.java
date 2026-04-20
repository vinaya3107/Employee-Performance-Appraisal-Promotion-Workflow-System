package com.appraisal.model;

import com.appraisal.model.enums.KPICategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "performance_kpis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PerformanceKPI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String kpiName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KPICategory category;

    @Column(nullable = false)
    private Double weightage;

    @Column(nullable = false)
    private String applicableDesignation;
}
