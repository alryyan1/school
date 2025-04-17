// src/stores/studentTransportAssignmentStore.ts
import { create } from 'zustand';
import {
    StudentTransportAssignment,
    StudentTransportAssignmentFormData,
    AssignableStudentInfo // The type returned by the specific backend endpoint
} from '@/types/studentTransportAssignment'; // Adjust path if needed
import { StudentAcademicYearApi } from '@/api/studentAcademicYearApi'; // Used for getting assignable students - Adjust path
import { StudentTransportAssignmentApi } from '@/api/studentTransportAssignmentApi'; // Adjust path
import dayjs from 'dayjs'; // If needed for sorting or other logic

// --- State Interface ---
type StoreState = {
    /** Assignments for the currently selected route */
    assignments: StudentTransportAssignment[];
    /** Students available to assign for the selected school/year context */
    assignableStudents: AssignableStudentInfo[];
    /** Loading state for fetching the assignments list */
    loadingAssignments: boolean;
    /** Loading state for fetching the assignable students list */
    loadingAssignable: boolean;
    /** Stores any error message encountered during fetching or API calls */
    error: string | null;
};

// --- Actions Interface ---
type StoreActions = {
    /** Fetches assignments for a specific transport route ID */
    fetchAssignments: (routeId: number) => Promise<void>;
    /** Fetches students available for assignment for a given year and school */
    fetchAssignableStudents: (academicYearId: number, schoolId: number) => Promise<void>;
    /** Assigns a student (via their enrollment ID) to a route */
    assignStudent: (data: StudentTransportAssignmentFormData) => Promise<StudentTransportAssignment | null>;
    /** Updates pickup/dropoff points for an existing assignment */
    updateAssignmentDetails: (assignmentId: number, data: Pick<StudentTransportAssignmentFormData, 'pickup_point' | 'dropoff_point'>) => Promise<StudentTransportAssignment | null>;
    /** Unassigns a student from a route using the assignment ID */
    unassignStudent: (assignmentId: number) => Promise<boolean>;
    /** Resets the store state to initial values */
    clearAll: () => void;
    /** Manually clear only the assignable students list */
    clearAssignableStudents: () => void;
    /** Manually clear only the assignments list */
    clearAssignments: () => void;
};

// --- Initial State ---
const initialState: StoreState = {
    assignments: [],
    assignableStudents: [],
    loadingAssignments: false,
    loadingAssignable: false,
    error: null,
};

// --- Helper Function to Sort Assignments (by student name if available) ---
const sortAssignments = (assignments: StudentTransportAssignment[]): StudentTransportAssignment[] => {
    return [...assignments].sort((a, b) => {
        const nameA = a.student_enrollment?.student?.student_name?.toLowerCase() ?? '';
        const nameB = b.student_enrollment?.student?.student_name?.toLowerCase() ?? '';
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
};

// --- Zustand Store Creation ---
export const useStudentTransportAssignmentStore = create<StoreState & StoreActions>((set, get) => ({
    ...initialState,

    // --- Action Implementations ---

    fetchAssignments: async (routeId) => {
        set({ loadingAssignments: true, error: null });
        try {
            const response = await StudentTransportAssignmentApi.getAll({ transport_route_id: routeId });
            // Assuming API Resource loads student data within studentAcademicYear relationship
            set({ assignments: sortAssignments(response.data.data), loadingAssignments: false });
        } catch (error: any) {
            console.error("Fetch Assignments error:", error);
            const msg = error.response?.data?.message || 'فشل جلب الطلاب المسجلين في المسار';
            set({ error: msg, loadingAssignments: false, assignments: [] }); // Clear list on error
        }
    },

    fetchAssignableStudents: async (academicYearId, schoolId) => {
        set({ loadingAssignable: true, error: null }); // Use separate loading state
        try {
            // Call the dedicated API endpoint
            const response = await StudentAcademicYearApi.getEnrollableStudents(academicYearId, schoolId);
            // Assuming response.data.data is AssignableStudentInfo[]
            set({
                // Sort assignable students by name for the dropdown/autocomplete
                assignableStudents: response.data.data.sort((a,b) => a.student_name.localeCompare(b.student_name)),
                loadingAssignable: false
            });
        } catch (error: any) {
            console.error("Fetch Assignable Students error:", error);
            const msg = error.response?.data?.message || 'فشل جلب الطلاب المتاحين للتسجيل بالمسار';
            set({ error: msg, loadingAssignable: false, assignableStudents: [] }); // Clear list on error
        }
    },

    assignStudent: async (data) => {
        // No loading state change here, component handles 'isProcessing'
        try {
            const response = await StudentTransportAssignmentApi.assign(data);
            const newAssignment = response.data.data; // Assuming API returns the created object with nested data

            set((state) => ({
                // Add the new assignment to the current list
                assignments: sortAssignments([...state.assignments, newAssignment]),
                // Remove the assigned student from the available list
                assignableStudents: state.assignableStudents.filter(
                    (studentInfo) => studentInfo.student_academic_year_id !== data.student_academic_year_id
                ),
                error: null, // Clear previous errors on success
            }));
            return newAssignment;
        } catch (error: any) {
            console.error("Assign Student error:", error);
            const msg = error.response?.data?.message || 'فشل تعيين الطالب للمسار';
            set({ error: msg }); // Set error state (e.g., if unique constraint fails)
            throw new Error(msg); // Re-throw for the calling component (dialog) to handle
        }
    },

    updateAssignmentDetails: async (assignmentId, data) => {
        // Component handles its 'isSavingDetails' state
        try {
            const response = await StudentTransportAssignmentApi.update(assignmentId, data);
            const updatedAssignment = response.data.data;
            set((state) => ({
                // Update the specific assignment in the list
                assignments: sortAssignments(state.assignments.map((a) =>
                    a.id === assignmentId ? { ...a, ...updatedAssignment } : a // Merge updates
                )),
                error: null,
            }));
            return updatedAssignment;
        } catch (error: any) {
            console.error(`Update Assignment Details ${assignmentId} error:`, error);
            const msg = error.response?.data?.message || 'فشل تحديث تفاصيل التعيين';
            set({ error: msg });
            throw new Error(msg); // Re-throw for form handling
        }
    },

    unassignStudent: async (assignmentId) => {
        // Component handles its 'isProcessing' state
        const assignmentToDelete = get().assignments.find(a => a.id === assignmentId); // Get details before deletion
        try {
            await StudentTransportAssignmentApi.unassign(assignmentId);
            set((state) => ({
                // Remove the assignment from the list
                assignments: state.assignments.filter((a) => a.id !== assignmentId),
                error: null,
            }));

            // Refetch assignable students to add the unassigned student back
            if (assignmentToDelete?.student_enrollment?.academic_year_id && assignmentToDelete?.student_enrollment?.school_id) {
                 // Trigger refetch - the component useEffect might handle this,
                 // or we can trigger it directly from the store if needed.
                 // Calling it here ensures the list updates.
                  get().fetchAssignableStudents(
                      assignmentToDelete.student_enrollment.academic_year_id,
                      assignmentToDelete.student_enrollment.school_id
                  );
            } else {
                 console.warn("Could not refetch assignable students after unassignment due to missing context.");
             }
            return true; // Indicate success
        } catch (error: any) {
            console.error(`Unassign Student (Assignment ID: ${assignmentId}) error:`, error);
            const msg = error.response?.data?.message || 'فشل إلغاء تعيين الطالب';
            set({ error: msg }); // Set global error state
            return false; // Indicate failure
        }
    },

    // --- Clear Actions ---
    clearAll: () => {
        set(initialState);
    },
    clearAssignableStudents: () => {
        set({ assignableStudents: [] });
    },
    clearAssignments: () => {
        set({ assignments: [], loadingAssignments: false }); // Keep error state potentially
    },

}));