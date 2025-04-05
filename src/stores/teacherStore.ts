// src/stores/teacherStore.ts
import { create } from 'zustand';
import { Teacher, TeacherFormData, TeacherResponse } from '@/types/teacher';
import { TeacherApi } from '@/api/teacherApi';

type TeacherState = {
    teachers: Teacher[];
    currentTeacher: TeacherResponse | null;
    loading: boolean;
    error: string | null;
    pagination: { // Add pagination state
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
    } | null;
};

type TeacherActions = {
    fetchTeachers: (page?: number) => Promise<void>;
    getTeacherById: (id: number) => Promise<TeacherResponse | null>; // Return teacher or null
    createTeacher: (teacher: TeacherFormData) => Promise<TeacherResponse | null>; // Return created teacher or null
    updateTeacher: (id: number, teacher: Partial<TeacherFormData>) => Promise<TeacherResponse | null>; // Return updated teacher or null
    deleteTeacher: (id: number) => Promise<boolean>; // Return success status
    resetCurrentTeacher: () => void;
    // Add specific teacher setting actions if needed
};

const initialState: TeacherState = {
    teachers: [],
    currentTeacher: null,
    loading: false,
    error: null,
    pagination: null,
};

export const useTeacherStore = create<TeacherState & TeacherActions>((set, get) => ({
    ...initialState,

    fetchTeachers: async (page = 1) => {
        set({ loading: true, error: null });
        try {
            const response = await TeacherApi.getAll(page);
            set({
                teachers: response.data.data,
                pagination: {
                    currentPage: response.data.meta.current_page,
                    lastPage: response.data.meta.last_page,
                    total: response.data.meta.total,
                    perPage: response.data.meta.per_page,
                },
                loading: false,
            });
        } catch (error: any) {
             console.error("Failed to fetch teachers:", error);
             const message = error.response?.data?.message || 'فشل في جلب بيانات المدرسين';
            set({ error: message, loading: false });
        }
    },

    getTeacherById: async (id: number) => {
        set({ loading: true, error: null, currentTeacher: null }); // Reset current on fetch
        try {
            const response = await TeacherApi.getById(id);
            set({ currentTeacher: response.data, loading: false });
            return response.data;
        } catch (error: any) {
             console.error(`Failed to fetch teacher ${id}:`, error);
             const message = error.response?.data?.message || 'فشل في جلب بيانات المدرس';
            set({ error: message, loading: false });
            return null;
        }
    },

    createTeacher: async (teacher: TeacherFormData) => {
        set({ loading: true, error: null });
        try {
            const response = await TeacherApi.create(teacher);
            // Optionally refetch the list or add manually
            // get().fetchTeachers(); // Refetch current page after add
            set((state) => ({
               // Simple add might put it out of pagination order, refetch is safer
               // teachers: [...state.teachers, response.data], // Add manually (less ideal with pagination)
               loading: false
           }));
            return response.data;
        } catch (error: any) {
            console.error("Failed to create teacher:", error);
            const message = error.response?.data?.message || 'فشل في إضافة المدرس';
            set({ error: message, loading: false });
            // Re-throw might be useful for form handling
            // throw new Error(message);
            return null;
        }
    },

    updateTeacher: async (id: number, teacher: Partial<Teacher>) => {
        set({ loading: true, error: null });
        try {
            const response = await TeacherApi.update(id, teacher);
            set((state) => ({
                teachers: state.teachers.map((t) =>
                    t.id === id ? { ...t, ...response.data } : t // Update in list
                ),
                currentTeacher: state.currentTeacher.data?.id === id ? response.data : state.currentTeacher, // Update current if viewing
                loading: false,
            }));
             return response.data;
        } catch (error: any) {
             console.error(`Failed to update teacher ${id}:`, error);
             const message = error.response?.data?.message || 'فشل في تحديث بيانات المدرس';
            set({ error: message, loading: false });
            // throw new Error(message);
            return null;
        }
    },

    deleteTeacher: async (id: number) => {
        set({ loading: true, error: null });
        try {
            await TeacherApi.delete(id);
            set((state) => ({
                teachers: state.teachers.filter((t) => t.id !== id), // Remove from list
                currentTeacher: state.currentTeacher?.id === id ? null : state.currentTeacher, // Clear if current deleted
                loading: false,
            }));
             return true; // Indicate success
        } catch (error: any) {
             console.error(`Failed to delete teacher ${id}:`, error);
             const message = error.response?.data?.message || 'فشل في حذف المدرس';
            set({ error: message, loading: false });
             return false; // Indicate failure
        }
    },

    resetCurrentTeacher: () => {
        set({ currentTeacher: null });
    },
}));