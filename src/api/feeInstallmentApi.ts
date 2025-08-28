// src/api/feeInstallmentApi.ts
import axiosClient from "../axios-client";
import { FeeInstallment, FeeInstallmentFormData } from "@/types/feeInstallment";

type CollectionResponse = { data: FeeInstallment[] };
type ResourceResponse = { data: FeeInstallment };

export const FeeInstallmentApi = {
  getAll: (studentId: number) =>
    axiosClient.get<CollectionResponse>("/fee-installments", {
      params: { student_id: studentId },
    }),
  create: (data: FeeInstallmentFormData) =>
    axiosClient.post<ResourceResponse>("/fee-installments", data),
  update: (id: number, data: Partial<FeeInstallmentFormData>) =>
    axiosClient.put<ResourceResponse>(`/fee-installments/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/fee-installments/${id}`),
    // --- NEW: Generate Installments ---
    generateInstallments: (
        studentId: number,
        totalAmount: number,
        numberOfInstallments: number
    ) => {
        const url = `/students/${studentId}/generate-installments`;
        const payload = {
            total_amount: totalAmount,
            number_of_installments: numberOfInstallments,
        };
        // Returns the newly generated installments { data: FeeInstallment[] }
        return axiosClient.post<CollectionResponse>(url, payload);
    },
     // --- NEW: Get Installments Due Soon ---
    /**
     * Fetches fee installments due within a specified number of days.
     * @param days Number of days ahead to check (default: 7)
     */
    getDueSoon: (days: number = 7) =>
      axiosClient.get<CollectionResponse>('/fee-installments/due-soon', {
          params: { days }
      }),
};
