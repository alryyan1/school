// src/types/feeInstallment.ts
import { Student } from './student';
import { StudentFeePayment } from './studentFeePayment'; // Import Payment type
import { Enrollment } from './enrollment'; // Import Enrollment type

export type InstallmentStatus = 'قيد الانتظار' | 'دفع جزئي' | 'مدفوع' | 'متأخر';

export type FeeInstallment = {
    id: number;
    enrollment_id: number; // Changed from student_id to enrollment_id
    title: string;
    amount_due: number | string;
    amount_paid: number | string;
    due_date: string; // YYYY-MM-DD
    status: InstallmentStatus;
    notes: string | null;
    created_at?: string;
    updated_at?: string;
    
    // Optional nested data
    enrollment?: Pick<Enrollment, 'id' | 'academic_year' | 'status'> & {
        student?: Pick<Student, 'id' | 'student_name' | 'goverment_id'>;
    };
    payments?: StudentFeePayment[]; // Array of payments FOR this installment
};

export type FeeInstallmentFormData = Omit<FeeInstallment, 'id' | 'amount_paid' | 'status' | 'created_at' | 'updated_at' | 'enrollment' | 'payments'>;