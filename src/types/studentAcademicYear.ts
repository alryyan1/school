// src/types/studentAcademicYear.ts
import { AcademicYear } from './academicYear';
import { Classroom } from './classroom';
import { GradeLevel } from './gradeLevel';
import { Student } from './student'; // Assuming simplified Student type for display

export type EnrollmentStatus = 'active' | 'transferred' | 'graduated' | 'withdrawn';

export type StudentAcademicYear = {
    id: number;
    student_id: number;
    academic_year_id: number;
    grade_level_id: number;
    classroom_id: number | null;
    status: EnrollmentStatus;
    // Nested data from resource
    student?: Pick<Student, 'id' | 'student_name' | 'goverment_id'>; // Only needed fields
    academic_year?: Pick<AcademicYear, 'id' | 'name'>;
    grade_level?: Pick<GradeLevel, 'id' | 'name' | 'code'>;
    classroom?: Pick<Classroom, 'id' | 'name'> | null;
    created_at?: string;
    updated_at?: string;
};

// Form for creating a new enrollment
export type StudentEnrollmentFormData = Pick<StudentAcademicYear,
    'student_id' | 'academic_year_id' | 'grade_level_id' | 'classroom_id' | 'status'
>;

// Form for updating an existing enrollment (only classroom & status)
export type StudentEnrollmentUpdateFormData = Pick<StudentAcademicYear,
    'classroom_id' | 'status'
>;

// Type for the enrollable students list
export type EnrollableStudent = Pick<Student, 'id' | 'student_name' | 'goverment_id'>;