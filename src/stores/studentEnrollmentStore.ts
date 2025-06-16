// src/stores/studentEnrollmentStore.ts
import { create } from 'zustand';
import {
    StudentAcademicYear, StudentEnrollmentFormData, StudentEnrollmentUpdateFormData, EnrollableStudent
} from '@/types/studentAcademicYear';
import { StudentAcademicYearApi } from '@/api/studentAcademicYearApi';
import { useClassroomStore } from './classroomStore';

type StoreState = {
    enrollments: StudentAcademicYear[]; // Enrollments for the selected view
    enrollableStudents: EnrollableStudent[]; // Students available to enroll
    loading: boolean; // Loading enrollments list
    loadingEnrollable: boolean; // Loading enrollable students list
    error: string | null;
     /** Flag indicating if the current list is based on search results */
     isSearchResult: boolean;
     unassignedStudentsForGrade: StudentAcademicYear[];
     loadingUnassigned: boolean;

};

type StoreActions = {
    fetchAllEnrollments:()=>Promise<void>;
    fetchEnrollments: (filters: { school_id: number; academic_year_id: number; grade_level_id?: number; classroom_id?: number }) => Promise<void>;
    fetchEnrollableStudents: (academicYearId: number, schoolId: number) => Promise<void>; // Added schoolId
    searchEnrollments: (searchTerm: string) => Promise<void>; // <-- Add Search Action

    enrollStudent: (data: StudentEnrollmentFormData) => Promise<StudentAcademicYear | null>;
    updateEnrollment: (id: number, data: StudentEnrollmentUpdateFormData) => Promise<StudentAcademicYear | null>;
    deleteEnrollment: (id: number) => Promise<boolean>;
    clearEnrollments: () => void;
    clearEnrollableStudents: () => void;
    fetchUnassignedStudentsForGrade: (filters: { school_id: number; academic_year_id: number; grade_level_id: number }) => Promise<void>;
    assignStudentToClassroom: (studentAcademicYearId: number, classroomId: number | null, targetSchoolId: number, targetAcademicYearId: number, targetGradeId: number) => Promise<boolean>;
    };
const initialState: StoreState = { enrollments: [], enrollableStudents: [], loading: false, loadingEnrollable: false, error: null,isSearchResult:false };

export const useStudentEnrollmentStore = create<StoreState & StoreActions>((set, get) => ({
    ...initialState,
   // --- NEW SEARCH ACTION ---
   searchEnrollments: async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
        // If search term is empty, potentially clear results or revert to filtered view
         get().clearEnrollments(); // Clear results if search term is empty
         // Or trigger fetchEnrollments with current filters? Needs filter state access.
         // For now, just clear.
        return;
    }
    set({ loading: true, error: null, isSearchResult: true }); // Set search flag true
    try {
        const response = await StudentAcademicYearApi.search(searchTerm);
        set({ enrollments: response.data.data, loading: false });
    } catch (error: unknown) {
        console.error("Search Enrollments error:", error);
        const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
        const msg = errorObj.response?.data?.message || 'فشل البحث عن تسجيلات الطلاب';
        set({ error: msg, loading: false, enrollments: [] }); // Clear on error
    }
},
    fetchEnrollments: async (filters) => {
        if (!filters.school_id || !filters.academic_year_id) {
            set({ enrollments: [], loading: false, error: 'الرجاء تحديد المدرسة والعام الدراسي.' });
            return;
        }
        set({ loading: true, error: null });
        try {
            const response = await StudentAcademicYearApi.getAll(filters);
            set({ enrollments: response.data.data, loading: false });
        } catch (error: unknown) {
            const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
            const msg = errorObj.response?.data?.message || 'فشل جلب تسجيلات الطلاب';
            set({ error: msg, loading: false, enrollments: [] }); // Clear on error
        }
    },
    fetchEnrollableStudents: async (academicYearId, schoolId) => {
        set({ loadingEnrollable: true, error: null });
        try {
            const response = await StudentAcademicYearApi.getEnrollableStudents(academicYearId, schoolId);
            set({ enrollableStudents: response.data.data, loadingEnrollable: false });
        } catch (error: unknown) {
             const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
             const msg = errorObj.response?.data?.message || 'فشل جلب الطلاب المتاحين للتسجيل';
            set({ error: msg, loadingEnrollable: false, enrollableStudents: [] }); // Clear on error
        }
    },

    enrollStudent: async (data) => {
        try {
            const response = await StudentAcademicYearApi.create(data);
            const newEnrollment = response.data.data;
            set((state) => ({
                
                enrollments: [...state.enrollments, newEnrollment]
            }));
            
            // Refetch available students as one has been removed from the list
            //when using get() retrieve the current state and doesnt make rerender
            get().fetchEnrollableStudents(Number(data.academic_year_id), Number(data.school_id));
            return newEnrollment;
        } catch (error: unknown) {
            console.error("Enroll Student error:", error);
            const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
            const msg = errorObj.response?.data?.message || 'فشل تسجيل الطالب';
            set({ error: msg }); // Set error state for potential display elsewhere
            throw new Error(msg); // Re-throw for form handling
        }
    },
    updateEnrollment: async (id, data) => {
        try {
            const response = await StudentAcademicYearApi.update(id, data);
            const updatedEnrollment = response.data.data;
            set((state) => ({
                enrollments:state.enrollments.map((e) => (e.id === id ? updatedEnrollment : e)),
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
    unassignedStudentsForGrade: [],
    loadingUnassigned: false,

    fetchUnassignedStudentsForGrade: async (filters) => {
        set({ loadingUnassigned: true, error: null });
        try {
            const response = await StudentAcademicYearApi.getUnassignedForGrade(filters);
            set({ unassignedStudentsForGrade: response.data.data, loadingUnassigned: false });
        } catch (err: any) { /* ... error handling ... */ set({loadingUnassigned: false }); }
    },
    assignStudentToClassroom: async (studentAcademicYearId, classroomId, targetSchoolId, targetAcademicYearId, targetGradeId) => {
        // No store loading state here, component manages drag/drop state
        try {
            await StudentAcademicYearApi.assignToClassroom(studentAcademicYearId, classroomId);
            // Refetch both lists to reflect the change accurately
            get().fetchUnassignedStudentsForGrade({ school_id: targetSchoolId, academic_year_id: targetAcademicYearId, grade_level_id: targetGradeId });
            useClassroomStore.getState().fetchClassrooms({ school_id: targetSchoolId, grade_level_id: targetGradeId, active_academic_year_id: targetAcademicYearId });
            return true;
        } catch (err: any) {
            console.error("Assign to classroom error:", err);
            // Let component handle snackbar
            throw err; // Rethrow for component to catch
        }
   },

    deleteEnrollment: async (id) => {
        try {
            const deletedEnrollment = get().enrollments.find(e => e.id === id);
            await StudentAcademicYearApi.delete(id);
            set((state) => ({
                enrollments: state.enrollments.filter((e) => e.id !== id),
            }));
            // Refetch enrollable students using context from deleted item
            if (deletedEnrollment) {
                get().fetchEnrollableStudents(Number(deletedEnrollment.academic_year_id), Number(deletedEnrollment.school_id));
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
    fetchAllEnrollments : async () =>{
        try{
            set({loading:true,error:null})
            const response = await  StudentAcademicYearApi.getAllStudentAcademicYear();
            set({enrollments:response.data})
        }catch(error){
            console.log(error)
            set({loading:false,error:error.toString()})
            throw new Error(error)
        }
        finally{
            set({loading:false})
        }
    },
}));