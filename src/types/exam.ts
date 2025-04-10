// src/types/exam.ts
import { School } from './school';

export type Exam = {
    id: number;
    name: string;
    school_id: number;
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
    description: string | null;
    school?: School; // Nested data
    created_at?: string;
    updated_at?: string;
};

export type ExamFormData = Omit<Exam, 'id' | 'created_at' | 'updated_at' | 'school'>;