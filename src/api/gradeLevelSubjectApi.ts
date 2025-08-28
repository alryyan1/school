import axiosClient from "../axios-client";

export type GradeLevelSubjectFormData = {
    grade_level_id: number;
    subject_id: number;
    teacher_id?: number | null;
};

export type GradeLevelSubject = {
    id: number;
    grade_level_id: number;
    subject_id: number;
    teacher_id?: number | null;
    created_at: string;
    updated_at: string;
    grade_level?: {
        id: number;
        name: string;
    };
    subject?: {
        id: number;
        name: string;
        code?: string;
    };
    teacher?: {
        id: number;
        name: string;
    };
};

export const GradeLevelSubjectApi = {
    // Get all subjects for a specific grade level
    getAll: (gradeLevelId: number) => 
        axiosClient.get<{ data: GradeLevelSubject[] }>(`/grade-level-subjects/${gradeLevelId}`),

    // Create a new subject assignment
    create: (data: GradeLevelSubjectFormData) => 
        axiosClient.post<{ data: GradeLevelSubject }>('/grade-level-subjects', data),

    // Update a subject assignment (mainly for teacher assignment)
    update: (id: number, data: Partial<GradeLevelSubjectFormData>) => 
        axiosClient.put<{ data: GradeLevelSubject }>(`/grade-level-subjects/${id}`, data),

    // Delete a subject assignment
    delete: (id: number) => 
        axiosClient.delete(`/grade-level-subjects/${id}`),
};
