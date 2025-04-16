// src/api/academicYearSubjectApi.ts
import axiosClient from '../axios-client';
import { AcademicYearSubject, AcademicYearSubjectFormData } from '@/types/academicYearSubject';

type CollectionResponse = { data: AcademicYearSubject[] };
type ResourceResponse = { data: AcademicYearSubject };

export const AcademicYearSubjectApi = {
    // Get assignments for a specific year and grade
    getAll: (academicYearId: number, gradeLevelId: number) =>
        axiosClient.get<CollectionResponse>('/academic-year-subjects', {
            params: { academic_year_id: academicYearId, grade_level_id: gradeLevelId }
        }),

    // Assign a subject (and optionally teacher)
    create: (data: AcademicYearSubjectFormData) =>
        axiosClient.post<ResourceResponse>('/academic-year-subjects', data),

    // Update (usually just the teacher)
    update: (id: number, data: Pick<AcademicYearSubjectFormData, 'teacher_id'>) => // Only send teacher_id typically
        axiosClient.put<ResourceResponse>(`/academic-year-subjects/${id}`, data),

    // Unassign a subject
    delete: (id: number) =>
        axiosClient.delete(`/academic-year-subjects/${id}`),
};