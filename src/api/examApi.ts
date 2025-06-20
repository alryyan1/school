// src/api/examApi.ts
import axiosClient from '../axios-client';
import { Exam, ExamFormData } from '@/types/exam';

type CollectionResponse = { data: Exam[] };
type ResourceResponse = { data: Exam };

export const ExamApi = {
    getAll: (filters?: { school_id?: number }) =>
        axiosClient.get<CollectionResponse>('/exams', { params: filters }),

    getById: (id: number) =>
        axiosClient.get<ResourceResponse>(`/exams/${id}`),

    create: (data: ExamFormData) =>
        axiosClient.post<ResourceResponse>('/exams', data),

    update: (id: number, data: Partial<ExamFormData>) =>
        axiosClient.put<ResourceResponse>(`/exams/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/exams/${id}`),
    getRelevantForStudent: (studentId: number) =>
        axiosClient.get<CollectionResponse>(`/students/${studentId}/relevant-exams`), // Assuming CollectionResponse for Exam[]
};