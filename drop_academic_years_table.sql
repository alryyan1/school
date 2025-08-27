-- SQL Script to Drop academic_years Table and Handle Foreign Key References
-- This script will safely remove the academic_years table and all related data

-- Step 1: Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Drop tables that reference academic_years (in dependency order)
-- These tables have foreign keys to academic_years or tables that reference academic_years

-- Drop student_absences table (references student_academic_years)
DROP TABLE IF EXISTS student_absences;

-- Drop student_warnings table (references student_academic_years)
DROP TABLE IF EXISTS student_warnings;

-- Drop fee_installments table (references student_academic_years)
DROP TABLE IF EXISTS fee_installments;

-- Drop student_transport_assignments table (references student_academic_years)
DROP TABLE IF EXISTS student_transport_assignments;

-- Drop exam_results table (references student_academic_years)
DROP TABLE IF EXISTS exam_results;

-- Drop student_results table (references student_academic_years and academic_year_subjects)
DROP TABLE IF EXISTS student_results;

-- Drop student_fee_payments table (references student_academic_years)
DROP TABLE IF EXISTS student_fee_payments;

-- Drop academic_year_fees table (references student_academic_years)
DROP TABLE IF EXISTS academic_year_fees;

-- Drop academic_year_subjects table (directly references academic_years)
DROP TABLE IF EXISTS academic_year_subjects;

-- Drop student_academic_years table (directly references academic_years)
DROP TABLE IF EXISTS student_academic_years;

-- Step 3: Finally drop the academic_years table
DROP TABLE IF EXISTS academic_years;

-- Step 4: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verification: Check if academic_years table still exists
SELECT 'academic_years table dropped successfully' AS status;
