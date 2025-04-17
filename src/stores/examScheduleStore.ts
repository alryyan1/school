// src/stores/examScheduleStore.ts
import { create } from 'zustand';
import { ExamSchedule, ExamScheduleFormData } from '@/types/examSchedule';
import { ExamScheduleApi } from '@/api/examScheduleApi';
import dayjs from 'dayjs';

type StoreState = {
    schedules: ExamSchedule[]; // Schedules for the currently viewed exam
    loading: boolean;
    error: string | null;
};

type StoreActions = {
    fetchSchedules: (examId: number, filters?: { grade_level_id?: number }) => Promise<void>;
    createSchedule: (data: ExamScheduleFormData) => Promise<ExamSchedule | null>;
    updateSchedule: (id: number, data: Partial<Omit<ExamScheduleFormData, 'exam_id' | 'subject_id' | 'grade_level_id'>>) => Promise<ExamSchedule | null>;
    deleteSchedule: (id: number) => Promise<boolean>;
    clearSchedules: () => void;
};

const initialState: StoreState = { schedules: [], loading: false, error: null };

// Sort helper (by date, then start time)
const sortSchedules = (schedules: ExamSchedule[]) =>
    [...schedules].sort((a, b) => {
        const dateCompare = dayjs(a.exam_date).diff(dayjs(b.exam_date));
        if (dateCompare !== 0) return dateCompare;
        // Compare times (simple string compare works for HH:MM:SS)
        return a.start_time.localeCompare(b.start_time);
    });

export const useExamScheduleStore = create<StoreState & StoreActions>((set, get) => ({
    ...initialState,

    fetchSchedules: async (examId, filters) => {
        set({ loading: true, error: null });
        try {
            const response = await ExamScheduleApi.getAll(examId, filters);
            set({ schedules: sortSchedules(response.data.data), loading: false });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'فشل جلب جدول الامتحانات';
            set({ error: msg, loading: false, schedules: [] });
        }
    },

    createSchedule: async (data) => {
        try {
            const response = await ExamScheduleApi.create(data);
            const newSchedule = response.data.data;
            set((state) => ({
                schedules: sortSchedules([...state.schedules, newSchedule]),
                error: null,
            }));
            return newSchedule;
        } catch (error: any) {
            const msg = error.response?.data?.message || 'فشل إضافة موعد امتحان';
            throw new Error(msg); // Re-throw for form
        }
    },

    updateSchedule: async (id, data) => {
        try {
            const response = await ExamScheduleApi.update(id, data);
            const updatedSchedule = response.data.data;
            set((state) => ({
                schedules: sortSchedules(state.schedules.map((s) => (s.id === id ? updatedSchedule : s))),
                error: null,
            }));
            return updatedSchedule;
        } catch (error: any) {
            const msg = error.response?.data?.message || 'فشل تحديث موعد امتحان';
            throw new Error(msg);
        }
    },

    deleteSchedule: async (id) => {
        try {
            await ExamScheduleApi.delete(id);
            set((state) => ({
                schedules: state.schedules.filter((s) => s.id !== id),
                error: null,
            }));
            return true;
        } catch (error: any) {
            const msg = error.response?.data?.message || 'فشل حذف موعد امتحان';
            set({ error: msg }); // Set global error
            return false;
        }
    },

    clearSchedules: () => set({ schedules: [], error: null, loading: false }),
}));