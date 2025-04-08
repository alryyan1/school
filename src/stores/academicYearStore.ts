// src/stores/academicYearStore.ts
import { create } from 'zustand';
import { AcademicYear, AcademicYearFormData } from '@/types/academicYear';
import { AcademicYearApi } from '@/api/academicYearApi';

type AcademicYearState = {
    academicYears: AcademicYear[];
    // No currentAcademicYear needed if using Dialogs mainly
    loading: boolean;
    error: string | null;
};

type AcademicYearActions = {
    fetchAcademicYears: (schoolId?: number) => Promise<void>;
    createAcademicYear: (data: AcademicYearFormData) => Promise<AcademicYear | null>;
    updateAcademicYear: (id: number, data: Partial<AcademicYearFormData>) => Promise<AcademicYear | null>;
    deleteAcademicYear: (id: number) => Promise<boolean>;
};

const initialState: AcademicYearState = { academicYears: [], loading: false, error: null };

export const useAcademicYearStore = create<AcademicYearState & AcademicYearActions>((set, get) => ({
    ...initialState,

    fetchAcademicYears: async (schoolId?: number) => {
        set({ loading: true, error: null });
        try {
            const response = await AcademicYearApi.getAll(schoolId);
            set({ academicYears: response.data.data, loading: false });
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل جلب الأعوام الدراسية';
            set({ error: message, loading: false });
        }
    },

    createAcademicYear: async (data: AcademicYearFormData) => {
        // Using optimistic update might be too complex for 'is_current' logic
        // set({ loading: true, error: null }); // Handled by form potentially
        try {
            const response = await AcademicYearApi.create(data);
            get().fetchAcademicYears(data.school_id); // Refetch for the affected school
            return response.data.data;
        } catch (error: any) {
            console.error("Create AY error:", error);
            const message = error.response?.data?.message || 'فشل إضافة العام الدراسي';
            set({ error: message }); // Set error state
            throw new Error(message); // Re-throw for form handling
        }
    },

    updateAcademicYear: async (id: number, data: Partial<AcademicYearFormData>) => {
        try {
            const response = await AcademicYearApi.update(id, data);
            const updatedYear = response.data.data;
            // Refetching is safest due to 'is_current' side-effects
             get().fetchAcademicYears(updatedYear.school_id);
            // Or update locally (might miss 'is_current' changes on others)
            // set((state) => ({
            //     academicYears: state.academicYears.map((ay) =>
            //         ay.id === id ? updatedYear : ay
            //     ),
            // }));
            return updatedYear;
        } catch (error: any) {
             console.error("Update AY error:", error);
             const message = error.response?.data?.message || 'فشل تحديث العام الدراسي';
            set({ error: message });
             throw new Error(message);
        }
    },

    deleteAcademicYear: async (id: number) => {
         try {
             await AcademicYearApi.delete(id);
             set((state) => ({
                 academicYears: state.academicYears.filter((ay) => ay.id !== id),
             }));
             return true;
         } catch (error: any) {
              console.error("Delete AY error:", error);
              const message = error.response?.data?.message || 'فشل حذف العام الدراسي';
              set({ error: message });
              return false;
         }
     },
}));