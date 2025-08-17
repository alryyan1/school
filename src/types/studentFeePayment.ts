// src/types/studentFeePayment.ts
import { FeeInstallment } from './feeInstallment'; // <-- Import
import { PaymentMethod } from './paymentMethod';
export type StudentFeePayment = {
    id: number;
    fee_installment_id: number; // <-- Updated FK
    amount: number | string;
    payment_date: string;
    notes: string | null;
    fee_installment?: FeeInstallment; // <-- Optional relation
    created_at?: string;
    updated_at?: string;
    payment_method_id: number;
    payment_method?: PaymentMethod;
};

// Form data needs installment ID now
export type StudentFeePaymentFormData = Omit<StudentFeePayment, 'id' | 'created_at' | 'updated_at' | 'fee_installment' | 'payment_method'>;