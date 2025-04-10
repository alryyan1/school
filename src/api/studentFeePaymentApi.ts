// src/api/studentFeePaymentApi.ts
import axiosClient from '../axios-client';
import { StudentFeePayment, StudentFeePaymentFormData } from '@/types/studentFeePayment';

type CollectionResponse = { data: StudentFeePayment[] };
type ResourceResponse = { data: StudentFeePayment };

export const StudentFeePaymentApi = {
    // Get payments for a specific enrollment ID
    getAll: (studentAcademicYearId: number) =>
        axiosClient.get<CollectionResponse>('/student-fee-payments', {
            params: { student_academic_year_id: studentAcademicYearId }
        }),

    create: (data: StudentFeePaymentFormData) =>
        axiosClient.post<ResourceResponse>('/student-fee-payments', data),

    update: (id: number, data: Partial<StudentFeePaymentFormData>) =>
        axiosClient.put<ResourceResponse>(`/student-fee-payments/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/student-fee-payments/${id}`),
};