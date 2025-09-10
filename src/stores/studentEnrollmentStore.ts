// src/stores/studentEnrollmentStore.ts
import { create } from 'zustand';
import {
    Enrollment, EnrollmentFormData, EnrollmentUpdateFormData, EnrollableStudent
} from '@/types/enrollment';
import { EnrollmentApi } from '@/api/enrollmentApi';
import { useClassroomStore } from './classroomStore';

type StoreState = {
    enrollments: Enrollment[]; // Enrollments for the selected view
    enrollableStudents: EnrollableStudent[]; // Students available to enroll
    loading: boolean; // Loading enrollments list
    loadingEnrollable: boolean; // Loading enrollable students list
    error: string | null;
    /** Flag indicating if the current list is based on search results */
    isSearchResult: boolean;
    unassignedStudentsForGrade: Enrollment[];
    loadingUnassigned: boolean;
    assignedStudentsForGrade: Enrollment[];
    loadingAssigned: boolean;
};

type StoreActions = {
    fetchAllEnrollments:()=>Promise<void>;
    fetchEnrollments: (filters: { school_id: number; academic_year: string; grade_level_id?: number; classroom_id?: number }) => Promise<void>;
    fetchEnrollableStudents: (academicYear: string, schoolId: number) => Promise<void>;
    searchEnrollments: (searchTerm: string) => Promise<void>;

    enrollStudent: (data: EnrollmentFormData) => Promise<Enrollment | null>;
    updateEnrollment: (id: number, data: EnrollmentUpdateFormData) => Promise<Enrollment | null>;
    deleteEnrollment: (id: number) => Promise<boolean>;
    clearEnrollments: () => void;
    clearEnrollableStudents: () => void;
    fetchUnassignedStudentsForGrade: (filters: { school_id: number; academic_year: string; grade_level_id: number }) => Promise<void>;
    fetchAssignedStudentsForGrade: (filters: { school_id: number; grade_level_id: number; academic_year?: string }) => Promise<void>;
    assignStudentToClassroom: (enrollmentId: number, classroomId: number | null, targetSchoolId: number, targetAcademicYear: string, targetGradeId: number) => Promise<boolean>;
};

const initialState: StoreState = { 
    enrollments: [], 
    enrollableStudents: [], 
    loading: false, 
    loadingEnrollable: false, 
    error: null,
    isSearchResult: false,
    unassignedStudentsForGrade: [],
    loadingUnassigned: false,
    assignedStudentsForGrade: [],
    loadingAssigned: false
};

export const useStudentEnrollmentStore = create<StoreState & StoreActions>((set, get) => ({
    ...initialState,
    
    // --- NEW SEARCH ACTION ---
    searchEnrollments: async (searchTerm) => {
        if (!searchTerm || searchTerm.trim() === '') {
            get().clearEnrollments();
            return;
        }
        set({ loading: true, error: null, isSearchResult: true });
        try {
            const response = await EnrollmentApi.search(searchTerm);
            set({ enrollments: response.data.data, loading: false });
        } catch (error: unknown) {
            console.error("Search Enrollments error:", error);
            const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
            const msg = errorObj.response?.data?.message || 'فشل البحث عن تسجيلات الطلاب';
            set({ error: msg, loading: false, enrollments: [] });
        }
    },

    fetchEnrollments: async (filters) => {
        if (!filters.school_id || !filters.academic_year) {
            set({ enrollments: [], loading: false, error: 'الرجاء تحديد المدرسة والعام الدراسي.' });
            return;
        }
        set({ loading: true, error: null });
        try {
            const response = await EnrollmentApi.getAll(filters);
            set({ enrollments: response.data.data, loading: false });
        } catch (error: unknown) {
            const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
            const msg = errorObj.response?.data?.message || 'فشل جلب تسجيلات الطلاب';
            set({ error: msg, loading: false, enrollments: [] });
        }
    },

    fetchEnrollableStudents: async (academicYear, schoolId) => {
        set({ loadingEnrollable: true, error: null });
        try {
            const response = await EnrollmentApi.getEnrollableStudents(academicYear, schoolId);
            set({ enrollableStudents: response.data.data, loadingEnrollable: false });
        } catch (error: unknown) {
            const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
            const msg = errorObj.response?.data?.message || 'فشل جلب الطلاب المتاحين للتسجيل';
            set({ error: msg, loadingEnrollable: false, enrollableStudents: [] });
        }
    },

    enrollStudent: async (data) => {
        try {
            const response = await EnrollmentApi.create(data);
            const newEnrollment = response.data.data;
            set((state) => ({
                enrollments: [...state.enrollments, newEnrollment]
            }));
            
            // Refetch available students as one has been removed from the list
            get().fetchEnrollableStudents(data.academic_year, Number(data.school_id));
            return newEnrollment;
        } catch (error: unknown) {
            console.error("Enroll Student error:", error);
            const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
            const msg = errorObj.response?.data?.message || 'فشل تسجيل الطالب';
            set({ error: msg });
            throw new Error(msg);
        }
    },

    updateEnrollment: async (id, data) => {
        try {
            const response = await EnrollmentApi.update(id, data);
            const updatedEnrollment = response.data.data;
            set((state) => ({
                enrollments: state.enrollments.map((e) => (e.id === id ? updatedEnrollment : e)),
            }));
            return updatedEnrollment;
        } catch (error: unknown) {
            console.error("Update Enrollment error:", error);
            const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
            const msg = errorObj.response?.data?.message || 'فشل تحديث تسجيل الطالب';
            set({ error: msg });
            throw new Error(msg);
        }
    },

    fetchUnassignedStudentsForGrade: async (filters) => {
        set({ loadingUnassigned: true, error: null });
        try {
            const response = await EnrollmentApi.getUnassignedForGrade(filters);
            set({ unassignedStudentsForGrade: response.data.data, loadingUnassigned: false });
        } catch (error: unknown) {
            console.error("Fetch unassigned students error:", error);
            set({ loadingUnassigned: false });
        }
    },

    fetchAssignedStudentsForGrade: async (filters) => {
        set({ loadingAssigned: true, error: null });
        try {
            const response = await EnrollmentApi.getAssignedForGrade(filters);
            set({ assignedStudentsForGrade: response.data.data, loadingAssigned: false });
        } catch (error: unknown) {
            console.error("Fetch assigned students error:", error);
            set({ loadingAssigned: false });
        }
    },

    assignStudentToClassroom: async (enrollmentId, classroomId, targetSchoolId, targetAcademicYear, targetGradeId) => {
        try {
            await EnrollmentApi.assignToClassroom(enrollmentId, classroomId);
            // Refetch both lists to reflect the change accurately
            get().fetchUnassignedStudentsForGrade({ school_id: targetSchoolId, academic_year: targetAcademicYear, grade_level_id: targetGradeId });
            get().fetchAssignedStudentsForGrade({ school_id: targetSchoolId, grade_level_id: targetGradeId, academic_year: targetAcademicYear });
            return true;
        } catch (error: unknown) {
            console.error("Assign to classroom error:", error);
            throw error;
        }
    },

    deleteEnrollment: async (id) => {
        try {
            const deletedEnrollment = get().enrollments.find(e => e.id === id);
            await EnrollmentApi.delete(id);
            set((state) => ({
                enrollments: state.enrollments.filter((e) => e.id !== id),
            }));
            // Refetch enrollable students using context from deleted item
            if (deletedEnrollment) {
                get().fetchEnrollableStudents(deletedEnrollment.academic_year, Number(deletedEnrollment.school_id));
            }
            return true;
        } catch (error: unknown) {
            console.error("Delete Enrollment error:", error);
            const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
            const msg = errorObj.response?.data?.message || 'فشل حذف تسجيل الطالب';
            set({ error: msg });
            return false;
        }
    },

    clearEnrollments: () => set({ enrollments: [], error: null }),
    clearEnrollableStudents: () => set({ enrollableStudents: [] }),

    fetchAllEnrollments: async () => {
        try {
            set({ loading: true, error: null });
            const response = await EnrollmentApi.getAllEnrollments();
            set({ enrollments: response.data });
        } catch (error) {
            console.log(error);
            set({ loading: false, error: error.toString() });
            throw new Error(error);
        } finally {
            set({ loading: false });
        }
    },
}));