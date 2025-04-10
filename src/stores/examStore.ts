// src/stores/examStore.ts
import { create } from 'zustand';
import { Exam, ExamFormData } from '@/types/exam';
import { ExamApi } from '@/api/examApi';
import dayjs from 'dayjs'; // For sorting

type ExamState = {
    exams: Exam[]; // Exams for selected school filter
    loading: boolean;
    error: string | null;
};

type ExamActions = {
    fetchExams: (filters?: { school_id?: number }) => Promise<void>;
    createExam: (data: ExamFormData) => Promise<Exam | null>;
    updateExam: (id: number, data: Partial<ExamFormData>) => Promise<Exam | null>;
    deleteExam: (id: number) => Promise<boolean>;
    clearExams: () => void;
};

const initialState: ExamState = { exams: [], loading: false, error: null };

// Helper sort function (by start date descending)
const sortExams = (exams: Exam[]) => exams.sort((a, b) => dayjs(b.start_date).diff(dayjs(a.start_date)));

export const useExamStore = create<ExamState & ExamActions>((set, get) => ({
    ...initialState,

    fetchExams: async (filters) => {
        set({ loading: true, error: null });
        try {
            const response = await ExamApi.getAll(filters);
            set({ exams: sortExams(response.data.data), loading: false });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'فشل جلب دورات الامتحانات';
            set({ error: msg, loading: false, exams: [] });
        }
    },

    createExam: async (data) => {
        try {
            const response = await ExamApi.create(data);
            const newExam = response.data.data;
            set((state) => ({ exams: sortExams([...state.exams, newExam]) }));
            return newExam;
        } catch (error: any) {
            console.error("Create Exam error:", error);
            const msg = error.response?.data?.message || 'فشل إضافة دورة الامتحان';
            set({ error: msg });
            throw new Error(msg);
        }
    },

    updateExam: async (id, data) => {
        try {
            const response = await ExamApi.update(id, data);
            const updatedExam = response.data.data;
            set((state) => ({
                exams: sortExams(state.exams.map((e) => (e.id === id ? updatedExam : e))),
            }));
            return updatedExam;
        } catch (error: any) {
            console.error("Update Exam error:", error);
            const msg = error.response?.data?.message || 'فشل تحديث دورة الامتحان';
            set({ error: msg });
            throw new Error(msg);
        }
    },

     deleteExam: async (id) => {
         try {
             await ExamApi.delete(id);
             set((state) => ({
                 exams: state.exams.filter((e) => e.id !== id),
             }));
             return true;
         } catch (error: any) {
              console.error("Delete Exam error:", error);
              const msg = error.response?.data?.message || 'فشل حذف دورة الامتحان';
              set({ error: msg }); // Set error for potential display
              return false;
         }
     },

     clearExams: () => set({ exams: [], error: null }),
}));