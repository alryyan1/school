// src/api/studentApi.ts
import { Student } from "@/types/student";
import axiosClient from "../axios-client";

// Assuming StudentResource returns { data: Student }
export type StudentResourceResponse = { data: Student };
// Assuming index returns { data: Student[] } or paginated structure
export type StudentCollectionResponse = {
  data: Student[] /* Add pagination if needed */;
};

export type AcceptStudentResponse = {
  message: string;
  student: Student;
};

export const StudentApi = {
  create: (
    student: Omit<Student, "id"> // Send plain object if no file involved
  ) => axiosClient.post<Student>("/students", student),

  update: (
    id: number,
    student: Partial<Omit<Student, "id" | "photo">> // Don't send photo path in normal update
  ) => axiosClient.put<Student>(`/students/${id}`, student),

  getAll: () => axiosClient.get<StudentCollectionResponse>("/students"),

  getById: (id: number) =>
    axiosClient.get<StudentResourceResponse>(`/students/${id}`),

  delete: (id: number) => axiosClient.delete(`/students/${id}`),

  // --- NEW: Update Photo ---
  updatePhoto: (id: number, photo: File) => {
    const formData = new FormData();

    formData.append("image", photo);
    // Use POST with _method=PATCH or a dedicated POST route
    formData.append("_method", "POST"); // Or use a dedicated POST route like /students/{id}/photo

    // Adjust endpoint if needed (e.g., '/students/{id}/photo')
    // Laravel often uses POST for FormData updates even if conceptually PATCH/PUT
    return axiosClient.post<StudentResourceResponse>(
      `/students/${id}/photo`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  // --- NEW: Accept Student ---
  accept: (id: number) => axiosClient.post<AcceptStudentResponse>(`/students/${id}/accept`),

  // --- NEW: Search by ID ---
  searchById: (id: number) => axiosClient.get<StudentResourceResponse>(`/students/search/${id}`),

};
