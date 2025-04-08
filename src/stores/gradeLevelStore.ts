// src/stores/gradeLevelStore.ts
import { create } from 'zustand';
import { GradeLevel, GradeLevelFormData } from '@/types/gradeLevel';
import { GradeLevelApi } from '@/api/gradeLevelApi';

type GradeLevelState = {
    gradeLevels: GradeLevel[];
    loading: boolean;
    error: string | null;
};

type GradeLevelActions = {
    fetchGradeLevels: () => Promise<void>;
    createGradeLevel: (data: GradeLevelFormData) => Promise<GradeLevel | null>;
    updateGradeLevel: (id: number, data: Partial<GradeLevelFormData>) => Promise<GradeLevel | null>;
    deleteGradeLevel: (id: number) => Promise<boolean>;
};

const initialState: GradeLevelState = { gradeLevels: [], loading: false, error: null };

export const useGradeLevelStore = create<GradeLevelState & GradeLevelActions>((set, get) => ({
    ...initialState,

    fetchGradeLevels: async () => {
        set({ loading: true, error: null });
        try {
            const response = await GradeLevelApi.getAll();
            set({ gradeLevels: response.data.data, loading: false });
        } catch (error: any) {
            const message = error.response?.data?.message || 'فشل جلب المراحل الدراسية';
            set({ error: message, loading: false });
        }
    },

    createGradeLevel: async (data: GradeLevelFormData) => {
        try {
            const response = await GradeLevelApi.create(data);
            const newGradeLevel = response.data.data;
            set((state) => ({
                gradeLevels: [...state.gradeLevels, newGradeLevel].sort((a, b) => a.name.localeCompare(b.name)), // Add and sort
            }));
            return newGradeLevel;
        } catch (error: any) {
            console.error("Create GradeLevel error:", error);
            const message = error.response?.data?.message || 'فشل إضافة المرحلة';
            set({ error: message });
            throw new Error(message);
        }
    },

    updateGradeLevel: async (id: number, data: Partial<GradeLevelFormData>) => {
        try {
            const response = await GradeLevelApi.update(id, data);
            const updatedGradeLevel = response.data.data;
            set((state) => ({
                gradeLevels: state.gradeLevels.map((gl) =>
                    gl.id === id ? updatedGradeLevel : gl
                ).sort((a, b) => a.name.localeCompare(b.name)), // Update and sort
            }));
            return updatedGradeLevel;
        } catch (error: any) {
            console.error("Update GradeLevel error:", error);
            const message = error.response?.data?.message || 'فشل تحديث المرحلة';
            set({ error: message });
            throw new Error(message);
        }
    },

    deleteGradeLevel: async (id: number) => {
        try {
            await GradeLevelApi.delete(id);
            set((state) => ({
                gradeLevels: state.gradeLevels.filter((gl) => gl.id !== id),
            }));
            return true;
        } catch (error: any) {
            console.error("Delete GradeLevel error:", error);
            // Use specific backend message if available (e.g., 409 Conflict)
            const message = error.response?.data?.message || 'فشل حذف المرحلة';
            set({ error: message }); // Set error in store for potential display
            return false; // Indicate failure
        }
    },
}));