// src/api/studentWarningApi.ts
import axiosClient from "../axios-client";
import { StudentWarning } from "@/types/studentWarning";

type CollectionResponse = { data: StudentWarning[] };
type ResourceResponse = { data: StudentWarning };

export const StudentWarningApi = {
  list: (studentAcademicYearId: number) =>
    axiosClient.get<CollectionResponse>(`/student-warnings`, { params: { student_academic_year_id: studentAcademicYearId } }),
  create: (payload: Omit<StudentWarning, 'id'|'created_at'|'updated_at'>) =>
    axiosClient.post<ResourceResponse>(`/student-warnings`, payload),
  update: (id: number, payload: Partial<Omit<StudentWarning, 'id'|'student_academic_year_id'>>) =>
    axiosClient.put<ResourceResponse>(`/student-warnings/${id}`, payload),
  delete: (id: number) => axiosClient.delete(`/student-warnings/${id}`),
  downloadPdf: (id: number) => axiosClient.get(`/student-warnings/${id}/pdf`, { responseType: 'blob' }),
};


