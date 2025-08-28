// src/types/feeInstallment.ts
import { Student } from './student';
import { StudentFeePayment } from './studentFeePayment'; // Import Payment type

export type InstallmentStatus = 'قيد الانتظار' | 'دفع جزئي' | 'مدفوع' | 'متأخر';

export type FeeInstallment = {
    id: number;
    student_id: number; // Changed from student_academic_year_id
    title: string;
    amount_due: number | string;
    amount_paid: number | string;
    due_date: string; // YYYY-MM-DD
    status: InstallmentStatus;
    notes: string | null;
    created_at?: string;
    updated_at?: string;
    
    // Optional nested data
    student?: Pick<Student, 'id' | 'student_name' | 'goverment_id'>;
    payments?: StudentFeePayment[]; // Array of payments FOR this installment
};

export type FeeInstallmentFormData = Omit<FeeInstallment, 'id' | 'amount_paid' | 'status' | 'created_at' | 'updated_at' | 'student' | 'payments'>;