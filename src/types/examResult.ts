import { Enrollment } from './enrollment';
import { ExamSchedule } from './examSchedule';
import { User } from './user';

export type ExamResult = {
    id: number;
    student_academic_year_id: number;
    exam_schedule_id: number;
    marks_obtained: number | string | null; // Allow string for form input
    grade_letter: string | null;
    is_absent: boolean;
    remarks: string | null;
    entered_by_user_id?: number | null;
    updated_by_user_id?: number | null;
    created_at?: string;
    updated_at?: string;
    // For display
    student_name?: string;
    subject_name?: string;
    exam_max_marks?: number | string; // From schedule
    student_enrollment?: Pick<Enrollment, 'id' | 'student'>; // Simplified
};

export type ExamResultFormData = {
    student_academic_year_id: number;
    marks_obtained: string; // Use string for input, convert to number or null
    grade_letter?: string;
    is_absent: boolean;
    remarks?: string;
};