// src/api/ledgerDeletions.ts
import axiosClient from '@/axios-client';
import { StudentLedgerDeletionsResponse } from '@/types/ledgerDeletion';

export interface GetLedgerDeletionsParams {
  page?: number;
  per_page?: number;
  start_date?: string;
  end_date?: string;
  student_id?: number;
  enrollment_id?: number;
  deleted_by?: number;
}

/**
 * Get all ledger deletions with pagination and filters
 */
export const getLedgerDeletions = async (params?: GetLedgerDeletionsParams): Promise<StudentLedgerDeletionsResponse> => {
  const response = await axiosClient.get('/student-ledger-deletions', { params });
  return response.data;
};

/**
 * Delete a ledger entry
 */
export const deleteLedgerEntry = async (ledgerEntryId: number, deletionReason: string): Promise<{ message: string; new_balance: number }> => {
  const response = await axiosClient.delete(`/student-ledgers/${ledgerEntryId}`, {
    data: { deletion_reason: deletionReason }
  });
  return response.data;
};


