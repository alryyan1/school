// src/types/classroom.ts
import { GradeLevel } from './gradeLevel';
import { School } from './school';
import { Teacher } from './teacher';

export type Classroom = {
    id: number;
    name: string;
    capacity: number;
    grade_level_id: number;
    teacher_id: number | null; // Homeroom teacher ID
    school_id: number;
    // Nested data from resource
    grade_level?: GradeLevel;
    homeroom_teacher?: Teacher | null;
    school?: School;
    created_at?: string;
    updated_at?: string;
    students_count?: number; // <-- Add count

};

export type ClassroomFormData = Omit<Classroom, 'id' | 'created_at' | 'updated_at' | 'grade_level' | 'homeroom_teacher' | 'school'>;