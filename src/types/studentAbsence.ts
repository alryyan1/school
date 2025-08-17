// src/types/studentAbsence.ts
export type StudentAbsence = {
	id: number;
	student_academic_year_id: number;
	absent_date: string; // ISO date (YYYY-MM-DD)
	reason: string | null;
	excused: boolean;
	created_at?: string;
	updated_at?: string;
};


