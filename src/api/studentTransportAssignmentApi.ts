// src/api/studentTransportAssignmentApi.ts
import axiosClient from "../axios-client";
import {
  StudentTransportAssignment,
  StudentTransportAssignmentFormData,
  AssignableStudentInfo,
} from "@/types/studentTransportAssignment";

type CollectionResponse = { data: StudentTransportAssignment[] };
type ResourceResponse = { data: StudentTransportAssignment };
// Needs backend endpoint to fetch students NOT assigned to ANY route for the year/school
type AssignableStudentsResponse = { data: AssignableStudentInfo[] };

export const StudentTransportAssignmentApi = {
  getAll: (filters: {
    transport_route_id?: number;
    student_academic_year_id?: number;
  }) =>
    axiosClient.get<CollectionResponse>("/student-transport-assignments", {
      params: filters,
    }),

  // --- Endpoint needed on backend (similar to getEnrollableStudents) ---
  getAssignableStudents: (academicYearId: number, schoolId: number) =>
    axiosClient.get<AssignableStudentsResponse>(
      "/assignable-students-for-transport",
      {
        // Example endpoint
        params: { academic_year_id: academicYearId, school_id: schoolId },
      }
    ),
  // ---------------------------------------------------------------------

  assign: (data: StudentTransportAssignmentFormData) =>
    axiosClient.post<ResourceResponse>("/student-transport-assignments", data),

  // Update pickup/dropoff points
  update: (
    id: number,
    data: Pick<
      StudentTransportAssignmentFormData,
      "pickup_point" | "dropoff_point"
    >
  ) =>
    axiosClient.put<ResourceResponse>(
      `/student-transport-assignments/${id}`,
      data
    ),

  unassign: (
    id: number // Use assignment ID
  ) => axiosClient.delete(`/student-transport-assignments/${id}`),
};
