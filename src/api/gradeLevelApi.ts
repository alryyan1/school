// src/api/gradeLevelApi.ts
import axiosClient from '../axios-client';
import { GradeLevel, GradeLevelFormData } from '@/types/gradeLevel';

// Expect { data: [...] } from ResourceCollection
type GradeLevelCollectionResponse = {
    data: GradeLevel[];
};
// Expect { data: {...} } from Resource
type GradeLevelResourceResponse = {
    data: GradeLevel;
};

export const GradeLevelApi = {
    getAll: () =>
        axiosClient.get<GradeLevelCollectionResponse>('/grade-levels'),

    getById: (id: number) =>
        axiosClient.get<GradeLevelResourceResponse>(`/grade-levels/${id}`),

    create: (data: GradeLevelFormData) =>
        axiosClient.post<GradeLevelResourceResponse>('/grade-levels', data),

    update: (id: number, data: Partial<GradeLevelFormData>) =>
        axiosClient.put<GradeLevelResourceResponse>(`/grade-levels/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/grade-levels/${id}`),
};