// src/types/expense.ts

export type ExpenseCategory = {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  expenses?: Expense[];
};

export type Expense = {
  id: number;
  title: string;
  description?: string;
  amount: number;
  expense_category_id: number;
  created_by: number;
  expense_date: string; // ISO format (YYYY-MM-DD)
  payment_method: 'cash' | 'bankak' | 'ocash' | 'fawri';
  created_at?: string;
  updated_at?: string;
  
  // Relations
  expense_category?: ExpenseCategory;
  created_by_user?: {
    id: number;
    name: string;
    email: string;
  };
};

export type CreateExpenseRequest = {
  title: string;
  description?: string;
  amount: number;
  expense_category_id: number;
  expense_date: string;
  payment_method: 'cash' | 'bankak' | 'ocash' | 'fawri';
};

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>;

export type ExpenseFilters = {
  category_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
};

export type ExpenseStatistics = {
  total_expenses: number;
  expense_count: number;
  average_expense: number;
  expenses_by_category: Array<{
    category_name: string;
    total_amount: number;
    count: number;
  }>;
  totals_by_payment_method?: Array<{
    payment_method: 'cash' | 'bankak' | 'ocash' | 'fawri' | string;
    total_amount: number;
  }>;
};
