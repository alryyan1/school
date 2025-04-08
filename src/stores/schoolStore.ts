// src/stores/schoolStore.ts
import { create } from 'zustand';
import { School, SchoolFormData } from '@/types/school';
import { SchoolApi } from '@/api/schoolApi';

type SchoolState = {
    schools: School[];
    currentSchool: School | null;
    loading: boolean;
    error: string | null;
    // Removed pagination state
};

type SchoolActions = {
    fetchSchools: () => Promise<void>; // No page parameter
    getSchoolById: (id: number) => Promise<School | null>;
    createSchool: (school: SchoolFormData) => Promise<School | null>;
    updateSchool: (id: number, school: Partial<SchoolFormData>) => Promise<School | null>;
    deleteSchool: (id: number) => Promise<boolean>;
    resetCurrentSchool: () => void;
};

const initialState: SchoolState = {
    schools: [],
    currentSchool: null,
    loading: false,
    error: null,
};
export const useSchoolStore = create<SchoolState & SchoolActions>((set, get) => ({
    ...initialState,

    fetchSchools: async () => { // No page parameter
        set({ loading: true, error: null });
        try {
            const response = await SchoolApi.getAll(); // Call updated API
            // Directly set the schools array from response.data.data
            set({
                schools: response.data.data, // Adjust based on ResourceCollection structure
                loading: false,
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل في جلب بيانات المدارس';
            set({ error: message, loading: false });
        }
    },

    getSchoolById: async (id: number) => {
        set({ loading: true, error: null, currentSchool: null });
        try {
            const response = await SchoolApi.getById(id);
            set({ currentSchool: response.data.data, loading: false }); // Adjust based on Resource structure
            return response.data.data;
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل في جلب بيانات المدرسة';
            set({ error: message, loading: false });
            return null;
        }
    },

    createSchool: async (school: SchoolFormData) => {
        set({ loading: true, error: null });
        try {
            const response = await SchoolApi.create(school);
            const schoolData = response.data.data;
            // Just refetch all schools after creation
            get().fetchSchools();
            set({ loading: false });
            return schoolData;
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل في إضافة المدرسة';
            set({ error: message, loading: false });
            return null;
        }
    },

    updateSchool: async (id: number, school: Partial<SchoolFormData>) => {
        set({ loading: true, error: null });
        try {
            const response = await SchoolApi.update(id, school);
            const updatedSchool = response.data.data;
            // Update the specific school in the local array
            set((state) => ({
                schools: state.schools.map((s) => (s.id === id ? updatedSchool : s)),
                currentSchool: state.currentSchool?.id === id ? updatedSchool : state.currentSchool,
                loading: false,
            }));
            return updatedSchool;
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل في تحديث بيانات المدرسة';
            set({ error: message, loading: false });
            return null;
        }
    },

     deleteSchool: async (id: number) => {
         set({ loading: true, error: null });
         try {
             await SchoolApi.delete(id);
             // Remove directly from the local array
             set((state) => ({
                 schools: state.schools.filter((s) => s.id !== id),
                 currentSchool: state.currentSchool?.id === id ? null : state.currentSchool,
                 loading: false,
             }));
             return true;
         } catch (error: any) {
             const message = error.response?.data?.message || 'فشل في حذف المدرسة';
             set({ error: message, loading: false });
             return false;
         }
     },

    resetCurrentSchool: () => set({ currentSchool: null }),
}));