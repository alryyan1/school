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
    academic_year: string; // Changed from academic_year_id to string
    grade_level_id?: number;
    school_id?: number;
    classroom_id?: number;
  }) =>
    axiosClient.get<CollectionResponse>("/enrollments", { // Changed endpoint
      params: filters,
    }),

  // Get students not enrolled in a specific year
  getEnrollableStudents: (academicYear: string, schoolId: number) => // Changed parameter
    axiosClient.get<EnrollableResponse>("/enrollable-students", {
      params: { academic_year: academicYear, school_id: schoolId }, // Changed parameter
    }),

  // Enroll a student
  create: (data: StudentEnrollmentFormData) =>
    axiosClient.post<ResourceResponse>("/enrollments", data), // Changed endpoint

  // Update classroom/status
  update: (id: number, data: StudentEnrollmentUpdateFormData) =>
    axiosClient.put<ResourceResponse>(`/enrollments/${id}`, data), // Changed endpoint

  // Unenroll a student
  delete: (id: number) => axiosClient.delete(`/enrollments/${id}`), // Changed endpoint
  
  // --- NEW SEARCH FUNCTION ---
  search: (searchTerm: string) =>
    axiosClient.get<CollectionResponse>("/enrollments/search", { // Changed endpoint
      params: { term: searchTerm },
    }),

  getAllStudentAcademicYear: () => {
    return axiosClient.get<StudentAcademicYear[]>('/enrollments') // Changed endpoint
  },
  
  getUnassignedForGrade: (filters: { school_id: number; academic_year: string; grade_level_id: number }) => // Changed parameter
    axiosClient.get<CollectionResponse>('/unassigned-students-for-grade', { params: filters }),

  assignToClassroom: (enrollmentId: number, classroomId: number | null) => // Changed parameter name
    axiosClient.put<ResourceResponse>(`/enrollments/${enrollmentId}/assign-classroom`, { classroom_id: classroomId }), // Changed endpoint
};
