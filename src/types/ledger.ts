export interface StudentLedger {
  id: number;
  enrollment_id: number;
  student_id: number;
  transaction_type: 'fee' | 'payment' | 'discount' | 'refund' | 'adjustment';
  description: string;
  amount: number;
  balance_after: number;
  transaction_date: string;
  reference_number?: string;
  metadata?: Record<string, any>;
  created_by?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  settings?: Record<string, any>;
}

export interface PaymentTransaction {
  id: number;
  enrollment_id: number;
  student_id: number;
  payment_method_id: number;
  amount: number;
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_date: string;
  notes?: string;
  payment_details?: Record<string, any>;
  processed_by?: number;
  created_at: string;
  updated_at: string;
}

export interface LedgerSummary {
  enrollment_id: number;
  total_fees: number;
  total_payments: number;
  total_discounts: number;
  total_refunds: number;
  total_adjustments: number;
}

export interface LedgerResponse {
  enrollment: any;
  ledger_entries: StudentLedger[];
  current_balance: number;
  summary: {
    total_fees: number;
    total_payments: number;
    total_discounts: number;
    total_refunds: number;
    total_adjustments: number;
  };
}

export interface StudentLedgerResponse {
  student: any;
  ledger_entries: StudentLedger[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateLedgerEntryRequest {
  enrollment_id: number;
  transaction_type: 'fee' | 'payment' | 'discount' | 'refund' | 'adjustment';
  description: string;
  amount: number;
  transaction_date: string;
  reference_number?: string;
  metadata?: Record<string, any>;
}

export interface LedgerSummaryRequest {
  enrollment_ids: number[];
  start_date?: string;
  end_date?: string;
}
