// src/stores/academicYearSubjectStore.ts
import { create } from 'zustand';
import { AcademicYearSubject, AcademicYearSubjectFormData } from '@/types/academicYearSubject';
import { AcademicYearSubjectApi } from '@/api/academicYearSubjectApi';

type StoreState = {
    assignments: AcademicYearSubject[]; // Assignments for the currently selected year/grade
    loading: boolean;
    error: string | null;
};

type StoreActions = {
    fetchAssignments: (academicYearId: number, gradeLevelId: number) => Promise<void>;
    assignSubject: (data: AcademicYearSubjectFormData) => Promise<AcademicYearSubject | null>;
    updateTeacherAssignment: (id: number, teacherId: number | null) => Promise<AcademicYearSubject | null>;
    unassignSubject: (id: number) => Promise<boolean>;
    clearAssignments: () => void;
};

export const useAcademicYearSubjectStore = create<StoreState & StoreActions>((set, get) => ({
    assignments: [],
    loading: false,
    error: null,

    fetchAssignments: async (academicYearId, gradeLevelId) => {
        set({ loading: true, error: null, assignments: [] }); // Clear previous
        try {
            const response = await AcademicYearSubjectApi.getAll(academicYearId, gradeLevelId);
            set({ assignments: response.data.data, loading: false });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'فشل جلب تعيينات المواد';
            set({ error: msg, loading: false });
        }
    },

    assignSubject: async (data) => {
        // No loading state change here, handled by caller/form
        try {
            const response = await AcademicYearSubjectApi.create(data);
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
             const response = await AcademicYearSubjectApi.update(id, { teacher_id: teacherId });
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
              await AcademicYearSubjectApi.delete(id);
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