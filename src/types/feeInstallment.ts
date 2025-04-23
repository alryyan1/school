// src/types/feeInstallment.ts
import { StudentAcademicYear } from './studentAcademicYear';
import { StudentFeePayment } from './studentFeePayment'; // Import Payment type

export type InstallmentStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';

export type FeeInstallment = {
    id: number;
    student_academic_year_id: number;
    title: string;
    amount_due: number | string;
    amount_paid: number | string;
    due_date: string; // YYYY-MM-DD
    status: InstallmentStatus;
    notes: string | null;
    created_at?: string;
    updated_at?: string;
    
    // Optional nested data
    student_enrollment?: StudentAcademicYear;
    payments?: StudentFeePayment[]; // Array of payments FOR this installment
};

export type FeeInstallmentFormData = Omit<FeeInstallment, 'id' | 'amount_paid' | 'status' | 'created_at' | 'updated_at' | 'student_enrollment' | 'payments'>;