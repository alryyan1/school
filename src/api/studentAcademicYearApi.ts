// src/api/studentAcademicYearApi.ts
import axiosClient from "../axios-client";
import {
  StudentAcademicYear,
  StudentEnrollmentFormData,
  StudentEnrollmentUpdateFormData,
  EnrollableStudent,
} from "@/types/studentAcademicYear";

type CollectionResponse = { data: StudentAcademicYear[] };
type ResourceResponse = { data: StudentAcademicYear };
type EnrollableResponse = { data: EnrollableStudent[] };

export const StudentAcademicYearApi = {
  // Get enrollments for a specific year and grade/classroom
  getAll: (filters: {
    academic_year_id: number;
    grade_level_id?: number;
    classroom_id?: number;
  }) =>
    axiosClient.get<CollectionResponse>("/student-enrollments", {
      params: filters,
    }),

  // Get students not enrolled in a specific year
  getEnrollableStudents: (academicYearId: number, schoolId: number) =>
    axiosClient.get<EnrollableResponse>("/enrollable-students", {
      params: { academic_year_id: academicYearId, school_id: schoolId },
    }),

  // Enroll a student
  create: (data: StudentEnrollmentFormData) =>
    axiosClient.post<ResourceResponse>("/student-enrollments", data),

  // Update classroom/status
  update: (id: number, data: StudentEnrollmentUpdateFormData) =>
    axiosClient.put<ResourceResponse>(`/student-enrollments/${id}`, data),

  // Unenroll a student
  delete: (id: number) => axiosClient.delete(`/student-enrollments/${id}`),
  // --- NEW SEARCH FUNCTION ---
  search: (searchTerm: string) =>
    axiosClient.get<CollectionResponse>("search", {
      params: { term: searchTerm },
    }),

    getAllStudentAcademicYear: ()=>{
      return  axiosClient.get<StudentAcademicYear[]>('getAllStudentAcademicYear')
    }
};
