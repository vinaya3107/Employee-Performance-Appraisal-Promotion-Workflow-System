package com.appraisal.model;

import com.appraisal.model.enums.AssessmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "self_assessments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelfAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "username", "password", "manager", "createdAt"})
    private User employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cycle_id", nullable = false)
    private AppraisalCycle cycle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kpi_id", nullable = false)
    private PerformanceKPI kpi;

    @Column(nullable = false)
    private Integer selfRating;

    @Column(length = 1000)
    private String selfComments;

    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AssessmentStatus status = AssessmentStatus.DRAFT;
}
