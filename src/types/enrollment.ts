// src/types/enrollment.ts
import { Classroom } from './classroom';
import { GradeLevel } from './gradeLevel';
import { School } from './school';
import { Student } from './student';

export type EnrollmentStatus = 'active' | 'transferred' | 'graduated' | 'withdrawn';
export type EnrollmentType = 'regular' | 'scholarship' | 'free';

export type Enrollment = {
    id: number | string;
    student_id: number | string;
    school_id: number | string;
    academic_year: string; // String format like "2024/2025"
    grade_level_id: number | string;
    classroom_id: number | null;
    status: EnrollmentStatus;
    enrollment_type: EnrollmentType;
    fees: number;
    discount: number;
    created_at?: string;
    updated_at?: string;
    
    // Nested data from resource
    student?: Pick<Student, 'id' | 'student_name' | 'goverment_id'>;
    school?: Pick<School, 'id' | 'name'>;
    grade_level?: Pick<GradeLevel, 'id' | 'name' | 'code'>;
    classroom?: Pick<Classroom, 'id' | 'name'> | null;
};

// Form for creating a new enrollment
export type EnrollmentFormData = Omit<Enrollment, 'id' | 'created_at' | 'updated_at' | 'student' | 'school' | 'grade_level' | 'classroom'> & {
    fees?: number; // Make fees optional since backend will auto-fill it
};

// Form for updating an existing enrollment
export type EnrollmentUpdateFormData = Partial<Pick<Enrollment, 'classroom_id' | 'status' | 'fees' | 'enrollment_type' | 'discount'>>;

// Type for the enrollable students list
export type EnrollableStudent = Pick<Student, 'id' | 'student_name' | 'goverment_id'>;
