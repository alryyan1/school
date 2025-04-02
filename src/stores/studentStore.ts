// src/stores/studentStore.ts
import { create } from 'zustand';
import { Student, Gender, EducationLevel } from '@/types/student';
import { StudentApi } from '@/api/studentApi';

type StudentState = {
  students: Student[];
  currentStudent: Student | null;
  loading: boolean;
  error: string | null;
};

type StudentActions = {
  fetchStudents: () => Promise<void>;
  getStudentById: (id: number) => Promise<void>;
  createStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: number, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  resetCurrentStudent: () => void;
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
      set({ students: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch students', loading: false });
    }
  },

  getStudentById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await StudentApi.getById(id);
      set({ currentStudent: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch student', loading: false });
    }
  },

  createStudent: async (student: Omit<Student, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const response = await StudentApi.create(student);
      set((state) => ({
        students: [...state.students, response.data],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: 'Failed to create student', loading: false });
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
      set({ error: 'Failed to update student', loading: false });
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
      set({ error: 'Failed to delete student', loading: false });
      throw error;
    }
  },

  resetCurrentStudent: () => {
    set({ currentStudent: null });
  },
}));