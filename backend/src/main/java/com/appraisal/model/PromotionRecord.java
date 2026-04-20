package com.appraisal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "promotion_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionRecord {

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

    @Column(nullable = false)
    private String oldDesignation;

    @Column(nullable = false)
    private String newDesignation;

    private Double newSalary;
    private LocalDate effectiveDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approved_by")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled", "username", "password", "manager", "createdAt"})
    private User approvedBy;
}
