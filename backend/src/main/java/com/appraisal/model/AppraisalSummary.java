package com.appraisal.model;

import com.appraisal.model.enums.OverallRating;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "appraisal_summaries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppraisalSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    private AppraisalCycle cycle;

    private Double avgManagerScore;
    private Double avgCommitteeScore;

    private Boolean promotionRecommended;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OverallRating overallRating = OverallRating.PENDING;
}
