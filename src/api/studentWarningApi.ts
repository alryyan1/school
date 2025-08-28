// src/api/studentWarningApi.ts
import axiosClient from "../axios-client";
import { StudentWarning } from "@/types/studentWarning";

type CollectionResponse = { data: StudentWarning[] };
type ResourceResponse = { data: StudentWarning };

export const StudentWarningApi = {
  getAll: (studentId: number) => // Changed parameter
    axiosClient.get<CollectionResponse>("/student-warnings", {
      params: { student_id: studentId }, // Changed parameter
    }),
  create: (data: Omit<StudentWarning, "id" | "created_at" | "updated_at">) =>
    axiosClient.post<ResourceResponse>("/student-warnings", data),
  update: (id: number, data: Partial<StudentWarning>) =>
    axiosClient.put<ResourceResponse>(`/student-warnings/${id}`, data),
  delete: (id: number) => axiosClient.delete(`/student-warnings/${id}`),
};


