// src/api/academicYearApi.ts
import axiosClient from '../axios-client';
import { AcademicYear, AcademicYearFormData } from '@/types/academicYear';

// Type for API Resource Collection response
type AcademicYearCollectionResponse = {
    data: AcademicYear[];
};
// Type for API Resource response
type AcademicYearResourceResponse = {
    data: AcademicYear;
};

export const AcademicYearApi = {
    // Optional filter by school_id
    getAll: (schoolId?: number) => {
        const params = schoolId ? { school_id: schoolId } : {};
        return axiosClient.get<AcademicYearCollectionResponse>('/academic-years', { params });
    },

    getById: (id: number) =>
        axiosClient.get<AcademicYearResourceResponse>(`/academic-years/${id}`),

    create: (data: AcademicYearFormData) =>
        axiosClient.post<AcademicYearResourceResponse>('/academic-years', data),

    update: (id: number, data: Partial<AcademicYearFormData>) =>
        axiosClient.put<AcademicYearResourceResponse>(`/academic-years/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/academic-years/${id}`),
};