import { create } from 'zustand';
import { GradeLevelSubject, GradeLevelSubjectFormData } from '@/api/gradeLevelSubjectApi';
import { GradeLevelSubjectApi } from '@/api/gradeLevelSubjectApi';

type StoreState = {
    assignments: GradeLevelSubject[]; // Assignments for the currently selected grade level
    loading: boolean;
    error: string | null;
};

type StoreActions = {
    fetchAssignments: (gradeLevelId: number) => Promise<void>;
    assignSubject: (data: GradeLevelSubjectFormData) => Promise<GradeLevelSubject | null>;
    updateTeacherAssignment: (id: number, teacherId: number | null) => Promise<GradeLevelSubject | null>;
    unassignSubject: (id: number) => Promise<boolean>;
    clearAssignments: () => void;
};

export const useGradeLevelSubjectStore = create<StoreState & StoreActions>((set, get) => ({
    assignments: [],
    loading: false,
    error: null,

    fetchAssignments: async (gradeLevelId) => {
        set({ loading: true, error: null, assignments: [] }); // Clear previous
        try {
            const response = await GradeLevelSubjectApi.getAll(gradeLevelId);
            set({ assignments: response.data.data, loading: false });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'فشل جلب تعيينات المواد';
            set({ error: msg, loading: false });
        }
    },

    assignSubject: async (data) => {
        // No loading state change here, handled by caller/form
        try {
            const response = await GradeLevelSubjectApi.create(data);
            const newAssignment = response.data.data;
            set((state) => ({ // Add to current list
                assignments: [...state.assignments, newAssignment]
                   // Sort if needed, e.g., by subject name
                   .sort((a, b) => a.subject?.name.localeCompare(b.subject?.name ?? '') ?? 0)
            }));
            return newAssignment;
        } catch (error: any) {
            console.error("Assign Subject error:", error);
            const msg = error.response?.data?.message || 'فشل تعيين المادة';
             // Maybe set error state? Or let caller handle.
             // set({ error: msg });
            throw new Error(msg); // Throw for form handling
        }
    },

    updateTeacherAssignment: async (id, teacherId) => {
         try {
             const response = await GradeLevelSubjectApi.update(id, { teacher_id: teacherId });
             const updatedAssignment = response.data.data;
             set((state) => ({
                 assignments: state.assignments.map((a) =>
                     a.id === id ? updatedAssignment : a
                 ),
             }));
             return updatedAssignment;
         } catch (error: any) {
              console.error("Update Teacher Assignment error:", error);
              const msg = error.response?.data?.message || 'فشل تحديث المعلم للمادة';
             // set({ error: msg });
             throw new Error(msg);
         }
     },

     unassignSubject: async (id) => {
          try {
              await GradeLevelSubjectApi.delete(id);
              set((state) => ({
                  assignments: state.assignments.filter((a) => a.id !== id),
              }));
              return true;
          } catch (error: any) {
               console.error("Unassign Subject error:", error);
               const msg = error.response?.data?.message || 'فشل إلغاء تعيين المادة';
               // Set error state for UI feedback maybe?
               set({ error: msg });
               return false;
          }
      },

    clearAssignments: () => set({ assignments: [], error: null }),

}));
