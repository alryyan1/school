import { create } from 'zustand';
import { StudentLedger, LedgerResponse, StudentLedgerResponse, CreateLedgerEntryRequest, LedgerSummaryRequest } from '@/types/ledger';
import axios from '@/axios-client';

interface DeportationLedgerState {
  // State
  currentLedger: LedgerResponse | null;
  studentLedger: StudentLedgerResponse | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchEnrollmentLedger: (enrollmentId: number, startDate?: string, endDate?: string) => Promise<void>;
  fetchStudentLedger: (studentId: number, startDate?: string, endDate?: string) => Promise<void>;
  createLedgerEntry: (data: CreateLedgerEntryRequest) => Promise<void>;
  getLedgerSummary: (data: LedgerSummaryRequest) => Promise<any>;
  clearCurrentLedger: () => void;
  clearStudentLedger: () => void;
  setError: (error: string | null) => void;
}

export const useDeportationLedgerStore = create<DeportationLedgerState>((set, get) => ({
  // Initial state
  currentLedger: null,
  studentLedger: null,
  loading: false,
  error: null,

  // Fetch ledger for a specific enrollment
  fetchEnrollmentLedger: async (enrollmentId: number, startDate?: string, endDate?: string) => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await axios.get(`/student-deportation-ledgers/enrollment/${enrollmentId}?${params}`);
      set({ 
        currentLedger: response.data,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch deportation ledger',
        loading: false 
      });
    }
  },

  // Fetch ledger for a specific student across all enrollments
  fetchStudentLedger: async (studentId: number, startDate?: string, endDate?: string) => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await axios.get(`/student-deportation-ledgers/student/${studentId}?${params}`);
      set({ 
        studentLedger: response.data,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch student deportation ledger',
        loading: false 
      });
    }
  },

  // Create a new ledger entry
  createLedgerEntry: async (data: CreateLedgerEntryRequest) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.post('/student-deportation-ledgers', data);
      
      // Refresh the current ledger if we have one
      const { currentLedger } = get();
      if (currentLedger && currentLedger.enrollment.id === data.enrollment_id) {
        await get().fetchEnrollmentLedger(data.enrollment_id);
      }
      
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create deportation ledger entry',
        loading: false 
      });
      throw error;
    }
  },

  // Get ledger summary for multiple enrollments
  getLedgerSummary: async (data: LedgerSummaryRequest) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.post('/student-deportation-ledgers/summary', data);
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to get deportation ledger summary',
        loading: false 
      });
      throw error;
    }
  },

  // Clear current ledger
  clearCurrentLedger: () => {
    set({ currentLedger: null });
  },

  // Clear student ledger
  clearStudentLedger: () => {
    set({ studentLedger: null });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));

