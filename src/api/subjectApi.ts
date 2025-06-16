// src/api/subjectApi.ts
import axiosClient from '../axios-client';
import { Subject, SubjectFormData } from '@/types/subject';

// Expect { data: [...] } from ResourceCollection
type SubjectCollectionResponse = {
    data: Subject[];
};
// Expect { data: {...} } from Resource
type SubjectResourceResponse = {
    data: Subject;
};

export const SubjectApi = {
    getAll: () =>
        axiosClient.get<SubjectCollectionResponse>('/subjects'),

    getById: (id: number) => // Although likely not needed for single-page UI
        axiosClient.get<SubjectResourceResponse>(`/subjects/${id}`),

    create: (data: SubjectFormData) =>
        axiosClient.post<SubjectResourceResponse>('/subjects', data),

    update: (id: number, data: Partial<SubjectFormData>) =>
        axiosClient.put<SubjectResourceResponse>(`/subjects/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/subjects/${id}`),
    getSubjectsForGradeLevel: (filters: { school_id: number; academic_year_id: number; grade_level_id: number }) =>
        axiosClient.get<SubjectCollectionResponse>('/curriculum/subjects-for-grade', { params: filters }),
    
};