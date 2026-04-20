CREATE DATABASE IF NOT EXISTS appraisaldb;
USE appraisaldb;

CREATE TABLE Users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('ADMIN', 'HR_MANAGER', 'REVIEW_COMMITTEE', 'MANAGER', 'EMPLOYEE') NOT NULL,
    department VARCHAR(255),
    designation VARCHAR(255),
    joining_date DATE,
    manager_id BIGINT,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (manager_id) REFERENCES Users(id)
);

CREATE TABLE AppraisalCycle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cycle_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    self_assessment_deadline DATE NOT NULL,
    manager_assessment_deadline DATE NOT NULL,
    committee_review_deadline DATE NOT NULL,
    status ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL
);

CREATE TABLE PerformanceKPI (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    kpi_name VARCHAR(255) NOT NULL,
    category ENUM('TECHNICAL', 'SOFT_SKILL', 'MANAGERIAL') NOT NULL,
    weightage INT NOT NULL,
    applicable_designation VARCHAR(255)
);

CREATE TABLE SelfAssessment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    cycle_id BIGINT NOT NULL,
    kpi_id BIGINT NOT NULL,
    self_rating INT CHECK (self_rating BETWEEN 1 AND 5),
    self_comments TEXT,
    submitted_at DATETIME,
    status ENUM('DRAFT', 'SUBMITTED') NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Users(id),
    FOREIGN KEY (cycle_id) REFERENCES AppraisalCycle(id),
    FOREIGN KEY (kpi_id) REFERENCES PerformanceKPI(id)
);

CREATE TABLE ManagerAssessment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    manager_id BIGINT NOT NULL,
    cycle_id BIGINT NOT NULL,
    kpi_id BIGINT NOT NULL,
    manager_rating INT CHECK (manager_rating BETWEEN 1 AND 5),
    manager_comments TEXT,
    submitted_at DATETIME,
    FOREIGN KEY (employee_id) REFERENCES Users(id),
    FOREIGN KEY (manager_id) REFERENCES Users(id),
    FOREIGN KEY (cycle_id) REFERENCES AppraisalCycle(id),
    FOREIGN KEY (kpi_id) REFERENCES PerformanceKPI(id)
);

CREATE TABLE CommitteeReview (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    cycle_id BIGINT NOT NULL,
    final_rating INT CHECK (final_rating BETWEEN 1 AND 5),
    promotion_recommendation ENUM('YES', 'NO') NOT NULL,
    comments TEXT,
    reviewed_at DATETIME,
    FOREIGN KEY (employee_id) REFERENCES Users(id),
    FOREIGN KEY (reviewer_id) REFERENCES Users(id),
    FOREIGN KEY (cycle_id) REFERENCES AppraisalCycle(id)
);

CREATE TABLE AppraisalSummary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    cycle_id BIGINT NOT NULL,
    avg_manager_score DOUBLE,
    avg_committee_score DOUBLE,
    promotion_recommended BOOLEAN,
    overall_rating ENUM('APPROVED', 'REJECTED', 'PENDING') NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Users(id),
    FOREIGN KEY (cycle_id) REFERENCES AppraisalCycle(id)
);

CREATE TABLE PromotionRecord (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    cycle_id BIGINT NOT NULL,
    old_designation VARCHAR(255) NOT NULL,
    new_designation VARCHAR(255) NOT NULL,
    new_salary DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL,
    approved_by BIGINT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Users(id),
    FOREIGN KEY (cycle_id) REFERENCES AppraisalCycle(id),
    FOREIGN KEY (approved_by) REFERENCES Users(id)
);

CREATE TABLE AuditLog (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    cycle_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    performed_by BIGINT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Users(id),
    FOREIGN KEY (cycle_id) REFERENCES AppraisalCycle(id),
    FOREIGN KEY (performed_by) REFERENCES Users(id)
);
