// src/api/enrollmentApi.ts
import axiosClient from "../axios-client";
import {
  Enrollment,
  EnrollmentFormData,
  EnrollmentUpdateFormData,
  EnrollableStudent,
  EnrollmentType,
} from "@/types/enrollment";

type CollectionResponse = { data: Enrollment[] };
type ResourceResponse = { data: Enrollment };
type EnrollableResponse = { data: EnrollableStudent[] };

export const EnrollmentApi = {
  // Get enrollments for a specific year and grade/classroom
  getAll: (filters: {
    academic_year?: string;
    grade_level_id?: number;
    school_id?: number;
    classroom_id?: number;
    student_id?: number;
  }) =>
    axiosClient.get<CollectionResponse>("/enrollments", {
      params: filters,
    }),

  // Get a specific enrollment
  get: (id: number) =>
    axiosClient.get<ResourceResponse>(`/enrollments/${id}`),

  // Get students not enrolled in a specific year
  getEnrollableStudents: (academicYear: string, schoolId: number) =>
    axiosClient.get<EnrollableResponse>("/enrollable-students", {
      params: { academic_year: academicYear, school_id: schoolId },
    }),

  // Enroll a student
  create: (data: EnrollmentFormData) =>
    axiosClient.post<ResourceResponse>("/enrollments", data),

  // Update enrollment
  update: (id: number, data: EnrollmentUpdateFormData) =>
    axiosClient.put<ResourceResponse>(`/enrollments/${id}`, data),

  // Unenroll a student
  delete: (id: number) => axiosClient.delete(`/enrollments/${id}`),
  
  // Search enrollments
  search: (searchTerm: string) =>
    axiosClient.get<CollectionResponse>("/enrollments/search", {
      params: { term: searchTerm },
    }),

  // Get all enrollments
  getAllEnrollments: () => {
    return axiosClient.get<Enrollment[]>('/enrollments')
  },
  
  // Get unassigned students for a grade
  getUnassignedForGrade: (filters: { school_id: number; academic_year: string; grade_level_id: number }) =>
    axiosClient.get<CollectionResponse>('/unassigned-students-for-grade', { params: filters }),

  // Get assigned students for a grade
  getAssignedForGrade: (filters: { school_id: number; grade_level_id: number; academic_year?: string }) =>
    axiosClient.get<CollectionResponse>('/assigned-students-for-grade', { params: filters }),

  // Assign student to classroom
  assignToClassroom: (enrollmentId: number, classroomId: number | null) =>
    axiosClient.put<ResourceResponse>(`/enrollments/${enrollmentId}/assign-classroom`, { classroom_id: classroomId }),

  // Generate fee installments for enrollment
  generateInstallments: (
    enrollmentId: number,
    totalAmount: number,
    numberOfInstallments: number
  ) => {
    const url = `/enrollments/${enrollmentId}/generate-installments`;
    const payload = {
      total_amount: totalAmount,
      number_of_installments: numberOfInstallments,
    };
    return axiosClient.post<CollectionResponse>(url, payload);
  },

  // Change enrollment type
  changeEnrollmentType: (enrollmentId: number, enrollmentType: EnrollmentType) =>
    axiosClient.put<ResourceResponse>(`/enrollments/${enrollmentId}/change-type`, {
      enrollment_type: enrollmentType,
    }),

  // Update deportation subscription
  updateDeportation: (
    enrollmentId: number,
    data: {
      deportation: boolean;
      deportation_type?: 'داخلي' | 'خارجي' | null;
      deportation_path_id?: number | null;
      nearest_station?: string | null;
    }
  ) =>
    axiosClient.put<ResourceResponse>(`/enrollments/${enrollmentId}/deportation`, data),
};
