// src/api/expenseApi.ts
import { Expense, CreateExpenseRequest, UpdateExpenseRequest, ExpenseFilters, ExpenseStatistics } from "@/types/expense";
import axiosClient from "../axios-client";

// Response types
export type ExpenseResourceResponse = { data: Expense };
export type ExpenseCollectionResponse = {
  data: Expense[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
};

export const ExpenseApi = {
  create: (expense: CreateExpenseRequest) => {
    const formData = new FormData();
    
    formData.append('title', expense.title);
    if (expense.description) formData.append('description', expense.description);
    formData.append('amount', expense.amount.toString());
    formData.append('expense_category_id', expense.expense_category_id.toString());
    formData.append('expense_date', expense.expense_date);
    formData.append('payment_method', expense.payment_method);

    return axiosClient.post<Expense>("/expenses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, expense: UpdateExpenseRequest) => {
    const formData = new FormData();
    
    if (expense.title !== undefined) formData.append('title', expense.title);
    if (expense.description !== undefined) formData.append('description', expense.description || '');
    if (expense.amount !== undefined) formData.append('amount', expense.amount.toString());
    if (expense.expense_category_id !== undefined) formData.append('expense_category_id', expense.expense_category_id.toString());
    if (expense.expense_date !== undefined) formData.append('expense_date', expense.expense_date);
    if (expense.payment_method !== undefined) formData.append('payment_method', expense.payment_method);

    // Laravel/Symfony do not parse multipart/form-data bodies for PUT/PATCH.
    // Use POST with method override so the body is parsed correctly.
    formData.append('_method', 'PUT');
    return axiosClient.post<Expense>(`/expenses/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getAll: (filters?: ExpenseFilters) => 
    axiosClient.get<ExpenseCollectionResponse>("/expenses", { params: filters }),

  getById: (id: number) =>
    axiosClient.get<ExpenseResourceResponse>(`/expenses/${id}`),

  delete: (id: number) => 
    axiosClient.delete(`/expenses/${id}`),

  getStatistics: (filters?: { date_from?: string; date_to?: string }) =>
    axiosClient.get<ExpenseStatistics>("/expenses-statistics", { params: filters }),

  getPdf: (filters?: ExpenseFilters) =>
    axiosClient.get<ArrayBuffer>("/expenses-pdf", {
      params: filters,
      responseType: 'arraybuffer',
      headers: { 'Accept': 'application/pdf' },
    }),
};
