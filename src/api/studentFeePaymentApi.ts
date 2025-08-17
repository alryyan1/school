// src/api/studentFeePaymentApi.ts
import axiosClient from "../axios-client";
import {
  StudentFeePayment,
  StudentFeePaymentFormData,
} from "@/types/studentFeePayment";

type CollectionResponse = { data: StudentFeePayment[] };
type ResourceResponse = { data: StudentFeePayment };

export const StudentFeePaymentApi = {
  // Get payments for a specific INSTALLMENT ID
  getAll: (feeInstallmentId: number) =>
    axiosClient.get<CollectionResponse>("/student-fee-payments", {
      params: { fee_installment_id: feeInstallmentId }, // <-- Filter changed
    }),

  // Data now includes fee_installment_id
  create: (data: StudentFeePaymentFormData) =>
    axiosClient.post<ResourceResponse>("/student-fee-payments", data),

  // Can only update amount, date, notes
  update: (
    id: number,
    data: Partial<
      Pick<StudentFeePaymentFormData, "amount" | "payment_date" | "notes" | "payment_method_id">
    >
  ) => axiosClient.put<ResourceResponse>(`/student-fee-payments/${id}`, data),

  delete: (id: number) => axiosClient.delete(`/student-fee-payments/${id}`),
};
