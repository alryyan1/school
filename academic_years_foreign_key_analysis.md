# Academic Years Table Foreign Key Analysis

## Overview
This document provides a comprehensive analysis of all tables that reference the `academic_years` table through foreign key relationships.

## Direct References to `academic_years` Table

### 1. `student_academic_years` Table
- **Foreign Key**: `academic_year_id`
- **Migration File**: `2025_04_05_203647_create_student_academic_years_table.php`
- **Relationship**: Many-to-one with `academic_years`
- **Purpose**: Links students to specific academic years with additional enrollment information

### 2. `academic_year_subjects` Table
- **Foreign Key**: `academic_year_id`
- **Migration File**: `2025_04_05_203827_create_academic_year_subjects_table.php`
- **Relationship**: Many-to-one with `academic_years`
- **Purpose**: Defines which subjects are taught in which academic years

## Indirect References (Through `student_academic_years`)

### 3. `student_absences` Table
- **Foreign Key**: `student_academic_year_id`
- **Migration File**: `2025_08_13_000001_create_student_absences_table.php`
- **Relationship**: Many-to-one with `student_academic_years`
- **Cascade**: `cascadeOnDelete()`

### 4. `student_warnings` Table
- **Foreign Key**: `student_academic_year_id`
- **Migration File**: `2025_08_13_000002_create_student_warnings_table.php`
- **Relationship**: Many-to-one with `student_academic_years`
- **Cascade**: `cascadeOnDelete()`

### 5. `fee_installments` Table
- **Foreign Key**: `student_academic_year_id`
- **Migration File**: `2025_04_22_154539_create_fee_installments_table.php`
- **Relationship**: Many-to-one with `student_academic_years`
- **Cascade**: `cascadeOnDelete()`

### 6. `student_transport_assignments` Table
- **Foreign Key**: `student_academic_year_id`
- **Migration File**: `2025_04_16_125150_create_student_transport_assignments_table.php`
- **Relationship**: Many-to-one with `student_academic_years`
- **Cascade**: `cascadeOnDelete()`

### 7. `exam_results` Table
- **Foreign Key**: `student_academic_year_id`
- **Migration File**: `2025_06_16_211506_create_exam_results_table.php`
- **Relationship**: Many-to-one with `student_academic_years`

### 8. `student_results` Table
- **Foreign Key**: `student_academic_year_id`
- **Migration File**: `2025_04_05_205139_create_student_results_table.php`
- **Relationship**: Many-to-one with `student_academic_years`

### 9. `student_fee_payments` Table
- **Foreign Key**: `student_academic_year_id`
- **Migration File**: `2025_04_05_204409_create_student_fee_payments_table.php`
- **Relationship**: Many-to-one with `student_academic_years`

### 10. `academic_year_fees` Table
- **Foreign Key**: `student_academic_year_id`
- **Migration File**: `2025_04_05_203742_create_academic_year_fees_table.php`
- **Relationship**: Many-to-one with `student_academic_years`

## Dependency Hierarchy

```
academic_years (Parent Table)
├── student_academic_years
│   ├── student_absences
│   ├── student_warnings
│   ├── fee_installments
│   ├── student_transport_assignments
│   ├── exam_results
│   ├── student_results
│   ├── student_fee_payments
│   └── academic_year_fees
└── academic_year_subjects
    └── student_results (also references this table)
```

## Tables to Drop (in order)

1. `student_absences`
2. `student_warnings`
3. `fee_installments`
4. `student_transport_assignments`
5. `exam_results`
6. `student_results`
7. `student_fee_payments`
8. `academic_year_fees`
9. `academic_year_subjects`
10. `student_academic_years`
11. `academic_years` (finally)

## Important Notes

- **Data Loss**: Dropping the `academic_years` table will result in the loss of all academic year data and all related data in the dependent tables.
- **Cascade Effects**: Some tables have `cascadeOnDelete()` constraints, which means they will automatically be cleaned up when `student_academic_years` records are deleted.
- **Backup Recommended**: Before dropping these tables, it's strongly recommended to create a database backup.
- **Application Impact**: This will affect all functionality related to academic years, student enrollments, fees, results, and attendance tracking.

## Alternative Approaches

Instead of dropping the table, consider:
1. **Archiving**: Move old academic year data to archive tables
2. **Soft Deletes**: Implement soft delete functionality
3. **Data Migration**: Migrate data to a new structure before dropping
4. **Partial Cleanup**: Only remove specific academic years instead of the entire table
