// src/api/ledgerApi.ts
import axiosClient from '@/axios-client';
import { StudentLedger } from '@/types/ledger';

export interface GetLedgerEntriesByPaymentMethodParams {
  payment_method: string;
  start_date?: string;
  end_date?: string;
}

export interface LedgerEntriesByPaymentMethodResponse {
  data: StudentLedger[];
  total: number;
  summary: {
    total_amount: number;
    total_entries: number;
  };
}

/**
 * Get all ledger entries filtered by payment method and date range
 */
export const getLedgerEntriesByPaymentMethod = async (
  params: GetLedgerEntriesByPaymentMethodParams
): Promise<LedgerEntriesByPaymentMethodResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('payment_method', params.payment_method);
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);

  const response = await axiosClient.get(`/student-ledgers/by-payment-method?${queryParams}`);
  return response.data;
};

