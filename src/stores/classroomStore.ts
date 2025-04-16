// src/stores/classroomStore.ts
import { create } from 'zustand';
import { Classroom, ClassroomFormData } from '@/types/classroom';
import { ClassroomApi } from '@/api/classroomApi';

type ClassroomState = {
    classrooms: Classroom[]; // List based on filters
    loading: boolean;
    error: string | null;
};

type ClassroomActions = {
    fetchClassrooms: (filters?: { school_id?: number|string; grade_level_id?: number|string }) => Promise<void>;
    createClassroom: (data: ClassroomFormData) => Promise<Classroom | null>;
    updateClassroom: (id: number, data: Partial<ClassroomFormData>) => Promise<Classroom | null>;
    deleteClassroom: (id: number) => Promise<boolean>;
    clearClassrooms: () => void; // To clear list when filters change significantly
};

const initialState: ClassroomState = { classrooms: [], loading: false, error: null };

export const useClassroomStore = create<ClassroomState & ClassroomActions>((set, get) => ({
    ...initialState,

    fetchClassrooms: async (filters) => {
        set({ loading: true, error: null }); // Optionally keep old data while loading new: loading:true
        try {
            const response = await ClassroomApi.getAll(filters);
            set({ classrooms: response.data.data, loading: false });
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل جلب الفصول الدراسية';
            set({ error: message, loading: false });
        }
    },

    createClassroom: async (data) => {
        try {
            const response = await ClassroomApi.create(data);
            const newClassroom = response.data.data;
            // Refetch based on current filters or add optimistically if filters match
            // For simplicity, we'll rely on the List component to refetch or the user to change filters
            set((state) => ({
                 // Add only if it matches current filters? Complex. Rely on refetch for now.
                 // classrooms: [...state.classrooms, newClassroom]...
            }));
            // Manually trigger refetch in component after successful add? Or here?
            // get().fetchClassrooms({ school_id: newClassroom.school_id, grade_level_id: newClassroom.grade_level_id });
            return newClassroom;
        } catch (error: any) {
             console.error("Create Classroom error:", error);
             const message = error.response?.data?.message || 'فشل إضافة الفصل';
             set({ error: message });
             throw new Error(message);
        }
    },

    updateClassroom: async (id, data) => {
         try {
             const response = await ClassroomApi.update(id, data);
             const updatedClassroom = response.data.data;
             set((state) => ({
                 classrooms: state.classrooms.map((c) =>
                     c.id === id ? updatedClassroom : c
                 ),
             }));
             return updatedClassroom;
         } catch (error: any) {
              console.error("Update Classroom error:", error);
              const message = error.response?.data?.message || 'فشل تحديث الفصل';
              set({ error: message });
              throw new Error(message);
         }
     },

     deleteClassroom: async (id) => {
         try {
             await ClassroomApi.delete(id);
             set((state) => ({
                 classrooms: state.classrooms.filter((c) => c.id !== id),
             }));
             return true;
         } catch (error: any) {
              console.error("Delete Classroom error:", error);
              const message = error.response?.data?.message || 'فشل حذف الفصل';
              set({ error: message });
              return false;
         }
     },

     clearClassrooms: () => set({ classrooms: [], error: null }),

}));