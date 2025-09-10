// src/api/expenseCategoryApi.ts
import { ExpenseCategory } from "@/types/expense";
import axiosClient from "../axios-client";

// Response types
export type ExpenseCategoryResourceResponse = { data: ExpenseCategory };
export type ExpenseCategoryCollectionResponse = {
  data: ExpenseCategory[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
};

export type CreateExpenseCategoryRequest = {
  name: string;
  name_en?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
};

export type UpdateExpenseCategoryRequest = Partial<CreateExpenseCategoryRequest>;

export type ExpenseCategoryFilters = {
  is_active?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
};

export const ExpenseCategoryApi = {
  create: (category: CreateExpenseCategoryRequest) =>
    axiosClient.post<ExpenseCategory>("/expense-categories", category),

  update: (id: number, category: UpdateExpenseCategoryRequest) =>
    axiosClient.put<ExpenseCategory>(`/expense-categories/${id}`, category),

  getAll: (filters?: ExpenseCategoryFilters) =>
    axiosClient.get<ExpenseCategoryCollectionResponse>("/expense-categories", { params: filters }),

  getById: (id: number) =>
    axiosClient.get<ExpenseCategoryResourceResponse>(`/expense-categories/${id}`),

  delete: (id: number) =>
    axiosClient.delete(`/expense-categories/${id}`),

  getActive: () =>
    axiosClient.get<{ data: ExpenseCategory[] }>("/expense-categories-active"),
};
