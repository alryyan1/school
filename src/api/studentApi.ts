// src/api/studentApi.ts
import { Student } from "@/types/student";
import axiosClient from "../axios-client";

export const StudentApi = {
  create: (student: Omit<Student, "id">) => 
    axiosClient.post("/students", student),
  
  update: (id: number, student: Partial<Student>) =>
    axiosClient.put(`/students/${id}`, student),
  
  getAll: () => axiosClient.get<Student[]>("/students"),
  
  getById: (id: number) => axiosClient.get<Student>(`/students/${id}`),
  
  delete: (id: number) => axiosClient.delete(`/students/${id}`)
};