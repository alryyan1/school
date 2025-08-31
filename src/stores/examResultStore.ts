// src/stores/examResultStore.ts
import { create } from 'zustand';
import { ExamResult, ExamResultFormData } from '@/types/examResult';
import { Enrollment } from '@/types/enrollment';
import { ExamResultApi } from '@/api/examResultApi';

type StoreState = {
    resultsForSchedule: ExamResult[];
    pendingStudents: Enrollment[];
    loadingResults: boolean;
    loadingPending: boolean;
    error: string | null;
};
type StoreActions = {
    fetchResultsForSchedule: (examScheduleId: number) => Promise<void>;
    fetchPendingStudents: (examScheduleId: number) => Promise<void>;
    saveResults: (examScheduleId: number, results: ExamResultFormData[]) => Promise<boolean>;
    clearResultsState: () => void;
};
const initialState: StoreState = { /* ... */ };

export const useExamResultStore = create<StoreState & StoreActions>((set, get) => ({
    ...initialState,
    fetchResultsForSchedule: async (examScheduleId) => { /* ... */ },
    fetchPendingStudents: async (examScheduleId) => { /* ... */ },
    saveResults: async (examScheduleId, results) => {
        // Component handles its own submission loading state
        try {
            await ExamResultApi.bulkUpsertResults(examScheduleId, results);
            get().fetchResultsForSchedule(examScheduleId); // Refetch results
            get().fetchPendingStudents(examScheduleId); // Refetch pending
            return true;
        } catch (err: unknown) { /* ... error handling ... throw err */ return false; }
    },
    clearResultsState: () => set(initialState),
}));