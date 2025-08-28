// src/types/studentAbsence.ts
export type StudentAbsence = {
	id: number;
	student_id: number; // Changed from student_academic_year_id
	absent_date: string; // ISO date (YYYY-MM-DD)
	reason: string | null;
	excused: boolean;
	created_at?: string;
	updated_at?: string;
};


