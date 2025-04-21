// src/api/schoolApi.ts
import axiosClient from "../axios-client";
import { School, SchoolFormData } from "@/types/school"; // Adjust path if needed
import { GradeLevel } from "@/types/gradeLevel";
// Helper to create FormData (can be reused or adapted from teacherApi)
const createSchoolFormData = (
  schoolData: Partial<SchoolFormData>
): FormData => {
  const formData = new FormData();
  Object.keys(schoolData).forEach((key) => {
    const value = schoolData[key as keyof SchoolFormData];
    if (key !== "logo" && value !== null && value !== undefined) {
      formData.append(key, value as string | Blob);
    }
  });
  if (schoolData.logo instanceof File) {
    // Ensure it's a File
    formData.append("logo", schoolData.logo);
  }
  return formData;
};
type GradeLevelCollectionResponse = {
  data: GradeLevel[];
};
// Expect GradeLevelResource collection WITH potential pivot data
type AssignedGradeLevelsResponse = { data: GradeLevel[] };
// Expect single GradeLevelResource with pivot data
type UpdatedGradeLevelFeeResponse = { data: GradeLevel };

// Type for paginated response
type PaginatedSchoolsResponse = {
  data: School[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
};
export const SchoolApi = {
  // No longer expects page parameter, returns array directly
  getAll: () => axiosClient.get<{ data: School[] }>(`/schools`), // Expect { data: [...] } wrapper from ResourceCollection

  getById: (id: number) => axiosClient.get<{ data: School }>(`/schools/${id}`), // Expect { data: {...} } wrapper from Resource

  create: (school: SchoolFormData) => {
    const formData = createSchoolFormData(school);
    return axiosClient.post<{ data: School }>("/schools", formData, {
      // Expect { data: {...} }
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, school: Partial<SchoolFormData>) => {
    const formData = createSchoolFormData(school);
    formData.append("_method", "PUT");
    return axiosClient.post<{ data: School }>(`/schools/${id}`, formData, {
      // Expect { data: {...} }
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id: number) => axiosClient.delete(`/schools/${id}`), // No data expected on success (200/204)
  // --- NEW ---
  getAssignedGradeLevels: (schoolId: number) =>
    // Returns { data: GradeLevel[] }
    axiosClient.get<GradeLevelCollectionResponse>(
      `/schools/${schoolId}/grade-levels`
    ),

  updateAssignedGradeLevels: (schoolId: number, gradeLevelIds: number[]) =>
    // Send { grade_level_ids: [1, 2, 5] }
    axiosClient.put(`/schools/${schoolId}/grade-levels`, {
      grade_level_ids: gradeLevelIds,
    }),
  // --- UPDATED/NEW Grade Level Assignment Methods ---

  // Assign NEW grade levels (accepts array)
  attachGradeLevels: (
    schoolId: number,
    grade_level_id: number,
    basic_fees: number
  ) =>
    axiosClient.post<AssignedGradeLevelsResponse>(
      `/schools/${schoolId}/grade-levels`,
      { grade_level_id, basic_fees }
    ), // Send array under 'assignments' key

  // Update fee for ONE existing assignment
  updateGradeLevelFee: (
    schoolId: number,
    gradeLevelId: number,
    basic_fees: number
  ) =>
    axiosClient.put<UpdatedGradeLevelFeeResponse>(
      `/schools/${schoolId}/grade-levels/${gradeLevelId}`,
      { basic_fees }
    ),

  // Unassign ONE grade level
  detachGradeLevel: (schoolId: number, gradeLevelId: number) =>
    axiosClient.delete(`/schools/${schoolId}/grade-levels/${gradeLevelId}`),
};
