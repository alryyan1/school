import axiosClient from '../axios-client';
import { ExamResult, ExamResultFormData } from '@/types/examResult';
import { Enrollment } from '@/types/enrollment'; // For pending students list

type ResultCollectionResponse = { data: ExamResult[] };
type PendingStudentsResponse = { data: Enrollment[] }; // Students not yet graded

export const ExamResultApi = {
    getResultsForSchedule: (examScheduleId: number) =>
        axiosClient.get<ResultCollectionResponse>(`/exam-schedules/${examScheduleId}/results`),

    getPendingStudentsForSchedule: (examScheduleId: number) =>
        axiosClient.get<PendingStudentsResponse>(`/exam-schedules/${examScheduleId}/pending-students-for-results`),

    bulkUpsertResults: (examScheduleId: number, results: ExamResultFormData[]) =>
        axiosClient.post<ResultCollectionResponse>(`/exam-schedules/${examScheduleId}/results/bulk-upsert`, { results }),
    // updateResult: (resultId: number, data: Partial<ExamResultFormData>) => ...
    // deleteResult: (resultId: number) => ...
};