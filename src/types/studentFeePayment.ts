// src/types/studentFeePayment.ts
import { StudentAcademicYear } from './studentAcademicYear'; // Optional

export type StudentFeePayment = {
    id: number;
    student_academic_year_id: number;
    amount: number | string; // Backend sends string due to decimal cast, frontend might use number
    payment_date: string; // Format YYYY-MM-DD
    notes: string | null;
    // enrollment?: StudentAcademicYear; // Optional nested data
    created_at?: string;
    updated_at?: string;
};

export type StudentFeePaymentFormData = Omit<StudentFeePayment, 'id' | 'created_at' | 'updated_at' | 'enrollment'>;