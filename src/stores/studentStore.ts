// src/stores/studentStore.ts
import { create } from "zustand";
import { Student, Gender, EducationLevel } from "@/types/student";
import { StudentApi, StudentCollectionResponse, StudentResourceResponse } from "@/api/studentApi";

type StudentState = {
  students: Student[];
  currentStudent: Student | null;
  loading: boolean;
  error: string | null;
};

type StudentActions = {
  fetchStudents: () => Promise<void>;
  getStudentById: (id: number) => Promise<void>;
  createStudent: (student: Omit<Student, "id">) => Promise<void|Student>;
  updateStudent: (id: number, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  acceptStudent: (id: number) => Promise<boolean>;
  resetCurrentStudent: () => void;
  updateStudentPhoto: (id: number, photo: File) => Promise<boolean>; 
};

const initialState: StudentState = {
  students: [],
  currentStudent: null,
  loading: false,
  error: null,
};

export const useStudentStore = create<StudentState & StudentActions>((set) => ({
  ...initialState,

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await StudentApi.getAll();
      console.log(response.data, "students data");
      set({ students: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch students", loading: false });
    }
  },
 
  getStudentById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await StudentApi.getById(id);
      set({ currentStudent: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch student", loading: false });
    }
  },

  createStudent: async (student: Omit<Student, "id">) => {
    set({ loading: true, error: null });
    try {
      const response = await StudentApi.create(student);
      set((state) => ({
        students: [...state.students, response.data],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: "Failed to create student", loading: false });
      throw error;
    }
  },

  updateStudent: async (id: number, student: Partial<Student>) => {
    set({ loading: true, error: null });
    try {
      const response = await StudentApi.update(id, student);
      set((state) => ({
        students: state.students.map((s) =>
          s.id === id ? { ...s, ...response.data } : s
        ),
        currentStudent: response.data,
        loading: false,
      }));
    } catch (error) {
      set({
        error: `Failed to update student ${error.toString()} `,
        loading: false,
      });
      throw error;
    }
  },

  deleteStudent: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await StudentApi.delete(id);
      set((state) => ({
        students: state.students.filter((s) => s.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete student", loading: false });
      throw error;
    }
  },

  acceptStudent: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await StudentApi.accept(id);
      const updatedStudent = response.data.student; // ✅ Correct access
      
      set((state) => ({
        students: state.students.map((s) =>
          s.id === id ? updatedStudent : s
        ),
        currentStudent: state.currentStudent?.id === id ? updatedStudent : state.currentStudent,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: "Failed to accept student", loading: false });
      return false;
    }
  },

  resetCurrentStudent: () => {
   set({currentStudent:null})
  },
   // --- NEW ACTION IMPLEMENTATION ---
   updateStudentPhoto: async (id: number, photo: File) => {
    // No loading state change here, handled by component UI
    try {
        const response = await StudentApi.updatePhoto(id, photo);
        const updatedStudent = response.data.data; // Extract updated student data

        // Update the current student in the store immediately
        set((state) => ({
            currentStudent: state.currentStudent?.id === id ? updatedStudent : state.currentStudent,
            // Optionally update the student in the main list as well
            // students: state.students.map(s => s.id === id ? updatedStudent : s),
        }));
        return true; // Indicate success
    } catch (error: any) {
        console.error(`Failed to update photo for student ${id}:`, error);
        // We'll let the component handle showing the error via snackbar
        // You could set the store error state here too if desired:
        // set({ error: error.response?.data?.message || 'فشل تحديث الصورة' });
        return false; // Indicate failure
    }
  }

 
}));
