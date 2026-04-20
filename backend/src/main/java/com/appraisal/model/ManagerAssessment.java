package com.appraisal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "manager_assessments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "username", "password", "manager", "createdAt"})
    private User employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manager_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "username", "password", "manager", "createdAt"})
    private User manager;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cycle_id", nullable = false)
    private AppraisalCycle cycle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kpi_id", nullable = false)
    private PerformanceKPI kpi;

    @Column(nullable = false)
    private Integer managerRating;

    @Column(length = 1000)
    private String managerComment;

    private LocalDateTime submittedAt;
}
