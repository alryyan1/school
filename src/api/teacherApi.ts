import axiosClient from "@/axios-client";
import {
  createTeacherFormData,
  PaginatedTeachersResponse,
  Teacher,
  TeacherFormData,
  TeacherResponse,
} from "@/types/teacher";

export const TeacherApi = {
  getAll: (page: number = 1) =>
    axiosClient.get<PaginatedTeachersResponse>(`/teachers?page=${page}`),

  getById: (id: number) => axiosClient.get<TeacherResponse>(`/teachers/${id}`),

  create: (teacher: TeacherFormData) => {
    const formData = createTeacherFormData(teacher);
    return axiosClient.post<TeacherResponse>("/teachers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, teacher: Partial<TeacherFormData>) => {
    const formData = createTeacherFormData(teacher as TeacherFormData); // Cast needed? Review data partial nature
    // IMPORTANT: For file uploads with PUT/PATCH, use POST and add _method field
    formData.append("_method", "PUT"); // Or 'PATCH' depending on backend route definition
    return axiosClient.post<Teacher>(`/teachers/${id}`, formData, {
      // Use POST for FormData
      headers: { "Content-Type": "multipart/form-data" },
    });
    // If not handling files, standard PUT works:
    // axiosClient.put<Teacher>(`/teachers/${id}`, teacher)
  },

  delete: (id: number) => axiosClient.delete(`/teachers/${id}`),

  // --- NEW ---
  getAssignedSubjects: (teacherId: number) =>
    axiosClient.get<SubjectCollectionResponse>(
      `/teachers/${teacherId}/subjects`
    ),

  updateAssignedSubjects: (teacherId: number, subjectIds: number[]) =>
    // Send the array of IDs under the key 'subject_ids'
    axiosClient.put<SubjectCollectionResponse>(
      `/teachers/${teacherId}/subjects`,
      { subject_ids: subjectIds }
    ),
};
