// src/api/studentAbsenceApi.ts
import axiosClient from "../axios-client";
import { StudentAbsence } from "@/types/studentAbsence";

type CollectionResponse = { data: StudentAbsence[] };
type ResourceResponse = { data: StudentAbsence };

export const StudentAbsenceApi = {
  getAll: (studentId: number) => // Changed parameter
    axiosClient.get<CollectionResponse>("/student-absences", {
      params: { student_id: studentId }, // Changed parameter
    }),
  create: (data: Omit<StudentAbsence, "id" | "created_at" | "updated_at">) =>
    axiosClient.post<ResourceResponse>("/student-absences", data),
  update: (id: number, data: Partial<StudentAbsence>) =>
    axiosClient.put<ResourceResponse>(`/student-absences/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/student-absences/${id}`),
};


