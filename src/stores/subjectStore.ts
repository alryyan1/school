// src/stores/subjectStore.ts
import { create } from 'zustand';
import { Subject, SubjectFormData } from '@/types/subject';
import { SubjectApi } from '@/api/subjectApi';

type SubjectState = {
    subjects: Subject[];
    loading: boolean;
    error: string | null;
};

type SubjectActions = {
    fetchSubjects: () => Promise<void>;
    createSubject: (data: SubjectFormData) => Promise<Subject | null>;
    updateSubject: (id: number, data: Partial<SubjectFormData>) => Promise<Subject | null>;
    deleteSubject: (id: number) => Promise<boolean>;
};

const initialState: SubjectState = { subjects: [], loading: false, error: null };

export const useSubjectStore = create<SubjectState & SubjectActions>((set, get) => ({
    ...initialState,

    // fetchSubjects: async () => {
    //     set({ loading: true, error: null });
    //     try {
    //         const response = await SubjectApi.getAll();
    //         set({ subjects: response.data.data, loading: false });
    //     } catch (error: any) {
    //         const message = error.response?.data?.message || 'فشل جلب المواد الدراسية';
    //         set({ error: message, loading: false });
    //     }
    // },
    fetchSubjects: async () => { // Ensure this fetches all subjects
        set({ loading: true, error: null });
        try {
            // Assuming SubjectApi.getAll() fetches all subjects
            const response = await SubjectApi.getAll();
            set({ subjects: response.data.data, loading: false });
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل جلب المواد الدراسية';
            set({ error: message, loading: false });
        }
    },
    createSubject: async (data: SubjectFormData) => {
        try {
            const response = await SubjectApi.create(data);
            const newSubject = response.data.data;
            set((state) => ({
                subjects: [...state.subjects, newSubject].sort((a, b) => a.name.localeCompare(b.name)),
            }));
            return newSubject;
        } catch (error: any) {
            console.error("Create Subject error:", error);
            const message = error.response?.data?.message || 'فشل إضافة المادة';
            set({ error: message });
            throw new Error(message); // Re-throw for form handling
        }
    },

    updateSubject: async (id: number, data: Partial<SubjectFormData>) => {
        try {
            const response = await SubjectApi.update(id, data);
            const updatedSubject = response.data.data;
            set((state) => ({
                subjects: state.subjects.map((s) =>
                    s.id === id ? updatedSubject : s
                ).sort((a, b) => a.name.localeCompare(b.name)),
            }));
            return updatedSubject;
        } catch (error: any) {
            console.error("Update Subject error:", error);
            const message = error.response?.data?.message || 'فشل تحديث المادة';
            set({ error: message });
            throw new Error(message);
        }
    },

    deleteSubject: async (id: number) => {
        try {
            await SubjectApi.delete(id);
            set((state) => ({
                subjects: state.subjects.filter((s) => s.id !== id),
            }));
            return true;
        } catch (error: any) {
            console.error("Delete Subject error:", error);
            const message = error.response?.data?.message || 'فشل حذف المادة';
            set({ error: message });
            return false;
        }
    },
}));