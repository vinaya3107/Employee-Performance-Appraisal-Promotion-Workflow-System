package com.appraisal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "committee_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommitteeReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "username", "password", "manager", "createdAt"})
    private User employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewer_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "username", "password", "manager", "createdAt"})
    private User reviewer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cycle_id", nullable = false)
    private AppraisalCycle cycle;

    @Column(nullable = false)
    private Integer finalRating;

    @Column(nullable = false)
    private Boolean promotionRecommendation;

    @Column(length = 1000)
    private String comments;

    @Column(length = 500)
    private String overrideReason;

    private LocalDateTime reviewedAt;
}
