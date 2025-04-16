// src/types/academicYearSubject.ts
import { AcademicYear } from './academicYear';
import { GradeLevel } from './gradeLevel';
import { Subject } from './subject';
import { Teacher } from './teacher';

export type AcademicYearSubject = {
    id: number;
    academic_year_id: number;
    grade_level_id: number;
    subject_id: number;
    teacher_id: number | null;
    // Optional nested data from resource
    academic_year?: AcademicYear;
    grade_level?: GradeLevel;
    subject?: Subject;
    teacher?: Teacher | null;
    created_at?: string;
    updated_at?: string;
};

// Type for assigning/updating
export type AcademicYearSubjectFormData = Pick<AcademicYearSubject,
    'academic_year_id' | 'grade_level_id' | 'subject_id' | 'teacher_id'
>;