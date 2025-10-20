// src/types/ledgerDeletion.ts

export interface StudentLedgerDeletion {
  id: number;
  ledger_entry_id: number;
  enrollment_id: number;
  student_id: number;
  transaction_type: 'fee' | 'payment' | 'discount' | 'refund' | 'adjustment';
  description: string;
  amount: number;
  transaction_date: string;
  balance_before: number;
  balance_after: number;
  reference_number?: string;
  payment_method?: 'cash' | 'bankak' | 'Fawri' | 'OCash';
  metadata?: any;
  original_created_by?: {
    id: number;
    name: string;
  };
  original_created_at?: string;
  deleted_by?: {
    id: number;
    name: string;
  };
  deletion_reason?: string;
  deleted_at?: string;
  enrollment?: {
    id: number;
    student: {
      id: number;
      student_name: string;
    };
    school?: {
      id: number;
      name: string;
    };
    grade_level?: {
      id: number;
      name: string;
    };
    classroom?: {
      id: number;
      name: string;
    };
  };
  student?: {
    id: number;
    student_name: string;
    phone_number?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface StudentLedgerDeletionsResponse {
  deletions: StudentLedgerDeletion[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}


