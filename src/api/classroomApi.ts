// src/api/classroomApi.ts
import axiosClient from '../axios-client';
import { Classroom, ClassroomFormData } from '@/types/classroom';

type CollectionResponse = { data: Classroom[] };
type ResourceResponse = { data: Classroom };

export const ClassroomApi = {
    // Add filter parameters
    getAll: (filters: { school_id: number; active_academic_year_id: number; grade_level_id?: number }) => // Added active_academic_year_id
    axiosClient.get<CollectionResponse>('/classrooms', { params: filters }),

    getById: (id: number) =>
        axiosClient.get<ResourceResponse>(`/classrooms/${id}`),

    create: (data: ClassroomFormData) =>
        axiosClient.post<ResourceResponse>('/classrooms', data),

    update: (id: number, data: Partial<ClassroomFormData>) =>
        axiosClient.put<ResourceResponse>(`/classrooms/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/classrooms/${id}`),
};