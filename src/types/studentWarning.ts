// src/types/studentWarning.ts
export type WarningSeverity = 'low' | 'medium' | 'high';

export type StudentWarning = {
  id: number;
  student_id: number; // Changed from student_academic_year_id
  issued_by_user_id: number | null;
  severity: WarningSeverity;
  reason: string;
  issued_at: string | null;
  created_at?: string;
  updated_at?: string;
};


