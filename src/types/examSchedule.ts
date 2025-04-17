// src/types/examSchedule.ts
import { Exam } from './exam';
import { Subject } from './subject';
import { GradeLevel } from './gradeLevel';
import { Classroom } from './classroom';
import { Teacher } from './teacher';

export type ExamSchedule = {
    id: number;
    exam_id: number;
    subject_id: number;
    grade_level_id: number;
    classroom_id: number | null;
    teacher_id: number | null; // Invigilator ID
    exam_date: string; // YYYY-MM-DD
    start_time: string; // HH:MM:SS or HH:MM
    end_time: string;   // HH:MM:SS or HH:MM
    max_marks: number | string; // Allow string for easier form handling initially
    pass_marks?: number | string | null;
    // Nested data
    exam?: Exam;
    subject?: Subject;
    grade_level?: GradeLevel;
    classroom?: Classroom | null;
    teacher?: Teacher | null; // Invigilator
    created_at?: string;
    updated_at?: string;
};

// Form data type (mostly uses IDs)
export type ExamScheduleFormData = Omit<ExamSchedule,
    'id' | 'created_at' | 'updated_at' | 'exam' | 'subject' | 'grade_level' | 'classroom' | 'teacher'
> & {
     // Use string for number inputs to avoid controlled/uncontrolled issues
     max_marks: string;
     pass_marks: string | null; // Keep as string or null
};