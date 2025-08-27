// src/types/studentAcademicYear.ts
import { AcademicYear } from './academicYear';
import { Classroom } from './classroom';
import { GradeLevel } from './gradeLevel';
import { School } from './school';
import { Student } from './student'; // Assuming simplified Student type for display

export type EnrollmentStatus = 'active' | 'transferred' | 'graduated' | 'withdrawn';
export type EnrollmentType = 'regular' | 'scholarship';

export type StudentAcademicYear = {
    id: number | string;
    student_id: number | string;
    academic_year_id: number | string;
    grade_level_id: number | string;
    classroom_id: number | null;
    school_id:number|string;
    fees?: number|string;
    discount?: number|string;
    status: EnrollmentStatus;
    enrollment_type?: EnrollmentType;
    // Aggregated totals for this enrollment (provided by backend resource)
    total_amount_required?: number;
    total_amount_paid?: number;
    // Nested data from resource
    student?: Pick<Student, 'id' | 'student_name' | 'goverment_id'>; // Only needed fields
    academic_year?: Pick<AcademicYear, 'id' | 'name'>;
    grade_level?: Pick<GradeLevel, 'id' | 'name' | 'code'>;
    classroom?: Pick<Classroom, 'id' | 'name'> | null;
    created_at?: string;
    updated_at?: string;
     // --- Ensure these keys match the Resource ---
     school?: Pick<School, 'id' | 'name'>; // <-- Key is 'school'
     // ------------------------------------------
};

// Form for creating a new enrollment
export type StudentEnrollmentFormData =
  Pick<StudentAcademicYear, 'student_id' | 'academic_year_id' | 'grade_level_id' | 'classroom_id' | 'status' | 'school_id'>
  & Partial<Pick<StudentAcademicYear, 'enrollment_type' | 'fees' | 'discount'>>;

// Form for updating an existing enrollment (only classroom & status)
export type StudentEnrollmentUpdateFormData = Partial<Pick<StudentAcademicYear,
    'classroom_id' | 'status' | 'fees' | 'enrollment_type'
>>;

// Type for the enrollable students list
export type EnrollableStudent = Pick<Student, 'id' | 'student_name' | 'goverment_id'>;