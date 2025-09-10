// src/stores/expenseStore.ts
import { create } from "zustand";
import { Expense, CreateExpenseRequest, UpdateExpenseRequest, ExpenseFilters, ExpenseStatistics } from "@/types/expense";
import { ExpenseApi, ExpenseCollectionResponse, ExpenseResourceResponse } from "@/api/expenseApi";

type ExpenseState = {
  expenses: Expense[];
  currentExpense: Expense | null;
  statistics: ExpenseStatistics | null;
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  } | null;
};

type ExpenseActions = {
  fetchExpenses: (filters?: ExpenseFilters) => Promise<void>;
  getExpenseById: (id: number) => Promise<void>;
  createExpense: (expense: CreateExpenseRequest) => Promise<Expense | null>;
  updateExpense: (id: number, expense: UpdateExpenseRequest) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  fetchStatistics: (filters?: { date_from?: string; date_to?: string }) => Promise<void>;
  resetCurrentExpense: () => void;
  clearError: () => void;
};

const initialState: ExpenseState = {
  expenses: [],
  currentExpense: null,
  statistics: null,
  loading: false,
  error: null,
  pagination: null,
};

export const useExpenseStore = create<ExpenseState & ExpenseActions>((set) => ({
  ...initialState,

  fetchExpenses: async (filters?: ExpenseFilters) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseApi.getAll(filters);
      set({ 
        expenses: response.data.data, 
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch expenses", 
        loading: false 
      });
    }
  },

  getExpenseById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseApi.getById(id);
      set({ currentExpense: response.data.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch expense", 
        loading: false 
      });
    }
  },

  createExpense: async (expense: CreateExpenseRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseApi.create(expense);
      set((state) => ({
        expenses: [response.data, ...state.expenses],
        loading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to create expense", 
        loading: false 
      });
      return null;
    }
  },

  updateExpense: async (id: number, expense: UpdateExpenseRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseApi.update(id, expense);
      set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === id ? response.data : e
        ),
        currentExpense: response.data,
        loading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to update expense", 
        loading: false 
      });
      throw error;
    }
  },

  deleteExpense: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await ExpenseApi.delete(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to delete expense", 
        loading: false 
      });
      throw error;
    }
  },

  fetchStatistics: async (filters?: { date_from?: string; date_to?: string }) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseApi.getStatistics(filters);
      set({ 
        statistics: response.data, 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch statistics", 
        loading: false 
      });
    }
  },

  resetCurrentExpense: () => {
    set({ currentExpense: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
