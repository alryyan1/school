// src/api/studentAbsenceApi.ts
import axiosClient from "../axios-client";
import { StudentAbsence } from "@/types/studentAbsence";

type CollectionResponse = { data: StudentAbsence[] };
type ResourceResponse = { data: StudentAbsence };

export const StudentAbsenceApi = {
	list: (studentAcademicYearId: number) =>
		axiosClient.get<CollectionResponse>(`/student-absences`, { params: { student_academic_year_id: studentAcademicYearId } }),
	create: (payload: Omit<StudentAbsence, 'id'|'created_at'|'updated_at'>) =>
		axiosClient.post<ResourceResponse>(`/student-absences`, payload),
	update: (id: number, payload: Partial<Omit<StudentAbsence, 'id'|'student_academic_year_id'>>) =>
		axiosClient.put<ResourceResponse>(`/student-absences/${id}`, payload),
	delete: (id: number) => axiosClient.delete(`/student-absences/${id}`),
};


