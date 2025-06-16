// src/api/examScheduleApi.ts
import axiosClient from '../axios-client';
import { ExamSchedule, ExamScheduleFormData } from '@/types/examSchedule';

type CollectionResponse = { data: ExamSchedule[] };
type ResourceResponse = { data: ExamSchedule };

export const ExamScheduleApi = {
    // Get schedules for a specific exam (add other filters if needed)
    getAll: (examId: number, filters?: { grade_level_id?: number }) =>
        axiosClient.get<CollectionResponse>('/exam-schedules', {
            params: { ...filters, exam_id: examId }
        }),

    // getById (optional, may not be needed for this UI)
    // getById: (id: number) => axiosClient.get<ResourceResponse>(`/exam-schedules/${id}`),

    create: (data: ExamScheduleFormData) =>
        axiosClient.post<ResourceResponse>('/exam-schedules', data),

    // Send only updatable fields
    update: (id: number, data: Partial<Omit<ExamScheduleFormData, 'exam_id' | 'subject_id' | 'grade_level_id'>>) =>
        axiosClient.put<ResourceResponse>(`/exam-schedules/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/exam-schedules/${id}`),
 quickAddSchedulesForGrade: (
        examId: number,
        gradeLevelId: number,
        activeAcademicYearId: number, // <-- Add this parameter
        defaults?: { default_start_time?: string; default_end_time?: string; default_max_marks?: string; default_pass_marks?: string } // Keep marks as string for form
    ) => {
        const payload = {
            grade_level_id: gradeLevelId,
            active_academic_year_id: activeAcademicYearId, // <-- Send it in the payload
            ...defaults
        };
        return axiosClient.post<{ message: string, count: number }>(`/exams/${examId}/quick-add-schedules`, payload);
    }
};