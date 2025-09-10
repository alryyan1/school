// src/types/studentAbsence.ts
export type StudentAbsence = {
	id: number;
	enrollment_id: number;
	absent_date: string; // ISO date (YYYY-MM-DD)
	reason: string | null;
	excused: boolean;
	created_at?: string;
	updated_at?: string;
};


