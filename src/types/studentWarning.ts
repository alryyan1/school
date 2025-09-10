// src/types/studentWarning.ts
export type WarningSeverity = 'low' | 'medium' | 'high';

export type StudentWarning = {
  id: number;
  enrollment_id: number;
  issued_by_user_id: number | null;
  severity: WarningSeverity;
  reason: string;
  issued_at: string | null;
  created_at?: string;
  updated_at?: string;
};


