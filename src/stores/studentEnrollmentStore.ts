// src/stores/studentEnrollmentStore.ts
import { create } from 'zustand';
import {
    StudentAcademicYear, StudentEnrollmentFormData, StudentEnrollmentUpdateFormData, EnrollableStudent
} from '@/types/studentAcademicYear';
import { StudentAcademicYearApi } from '@/api/studentAcademicYearApi';

type StoreState = {
    enrollments: StudentAcademicYear[]; // Enrollments for the selected view
    enrollableStudents: EnrollableStudent[]; // Students available to enroll
    loading: boolean; // Loading enrollments list
    loadingEnrollable: boolean; // Loading enrollable students list
    error: string | null;
};

type StoreActions = {
    fetchEnrollments: (filters: { academic_year_id: number; grade_level_id?: number; classroom_id?: number }) => Promise<void>;
    fetchEnrollableStudents: (academicYearId: number) => Promise<void>;
    enrollStudent: (data: StudentEnrollmentFormData) => Promise<StudentAcademicYear | null>;
    updateEnrollment: (id: number, data: StudentEnrollmentUpdateFormData) => Promise<StudentAcademicYear | null>;
    deleteEnrollment: (id: number) => Promise<boolean>;
    clearEnrollments: () => void;
    clearEnrollableStudents: () => void;
};

const initialState: StoreState = { enrollments: [], enrollableStudents: [], loading: false, loadingEnrollable: false, error: null };

export const useStudentEnrollmentStore = create<StoreState & StoreActions>((set, get) => ({
    ...initialState,

    fetchEnrollments: async (filters) => {
        set({ loading: true, error: null });
        try {
            const response = await StudentAcademicYearApi.getAll(filters);
            set({ enrollments: response.data.data, loading: false });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'فشل جلب تسجيلات الطلاب';
            set({ error: msg, loading: false });
        }
    },

    fetchEnrollableStudents: async (academicYearId) => {
         set({ loadingEnrollable: true, error: null }); // Separate loading state
         try {
             const response = await StudentAcademicYearApi.getEnrollableStudents(academicYearId);
             set({ enrollableStudents: response.data.data, loadingEnrollable: false });
         } catch (error: any) {
              const msg = error.response?.data?.message || 'فشل جلب الطلاب المتاحين للتسجيل';
             set({ error: msg, loadingEnrollable: false });
         }
     },

    enrollStudent: async (data) => {
        try {
            const response = await StudentAcademicYearApi.create(data);
            const newEnrollment = response.data.data;
            // Add to list and refetch enrollable (as student is no longer enrollable)
            set((state) => ({
                enrollments: [...state.enrollments, newEnrollment].sort((a,b) => a.student?.student_name.localeCompare(b.student?.student_name ?? '') ?? 0) // sort by name
            }));
            get().fetchEnrollableStudents(data.academic_year_id); // Refetch enrollable
            return newEnrollment;
        } catch (error: any) {
            console.error("Enroll Student error:", error);
            const msg = error.response?.data?.message || 'فشل تسجيل الطالب';
            set({ error: msg });
            throw new Error(msg);
        }
    },

    updateEnrollment: async (id, data) => {
        try {
            const response = await StudentAcademicYearApi.update(id, data);
            const updatedEnrollment = response.data.data;
            set((state) => ({
                enrollments: state.enrollments.map((e) => (e.id === id ? updatedEnrollment : e)),
            }));
            return updatedEnrollment;
        } catch (error: any) {
             console.error("Update Enrollment error:", error);
             const msg = error.response?.data?.message || 'فشل تحديث تسجيل الطالب';
            set({ error: msg });
            throw new Error(msg);
        }
    },

     deleteEnrollment: async (id) => {
         try {
             await StudentAcademicYearApi.delete(id);
             const deletedEnrollment = get().enrollments.find(e => e.id === id); // Get student/year before deleting
             set((state) => ({
                 enrollments: state.enrollments.filter((e) => e.id !== id),
             }));
             // Refetch enrollable students if needed
             if (deletedEnrollment) {
                 get().fetchEnrollableStudents(deletedEnrollment.academic_year_id);
             }
             return true;
         } catch (error: any) {
              console.error("Delete Enrollment error:", error);
              const msg = error.response?.data?.message || 'فشل حذف تسجيل الطالب';
              set({ error: msg });
              return false;
         }
     },

    clearEnrollments: () => set({ enrollments: [], error: null }),
    clearEnrollableStudents: () => set({ enrollableStudents: [] }),
}));