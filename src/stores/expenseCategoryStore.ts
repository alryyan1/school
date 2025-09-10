// src/stores/expenseCategoryStore.ts
import { create } from "zustand";
import { ExpenseCategory, CreateExpenseCategoryRequest, UpdateExpenseCategoryRequest, ExpenseCategoryFilters } from "@/types/expense";
import { ExpenseCategoryApi, ExpenseCategoryCollectionResponse, ExpenseCategoryResourceResponse } from "@/api/expenseCategoryApi";

type ExpenseCategoryState = {
  categories: ExpenseCategory[];
  activeCategories: ExpenseCategory[];
  currentCategory: ExpenseCategory | null;
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

type ExpenseCategoryActions = {
  fetchCategories: (filters?: ExpenseCategoryFilters) => Promise<void>;
  fetchActiveCategories: () => Promise<void>;
  getCategoryById: (id: number) => Promise<void>;
  createCategory: (category: CreateExpenseCategoryRequest) => Promise<ExpenseCategory | null>;
  updateCategory: (id: number, category: UpdateExpenseCategoryRequest) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  resetCurrentCategory: () => void;
  clearError: () => void;
};

const initialState: ExpenseCategoryState = {
  categories: [],
  activeCategories: [],
  currentCategory: null,
  loading: false,
  error: null,
  pagination: null,
};

export const useExpenseCategoryStore = create<ExpenseCategoryState & ExpenseCategoryActions>((set) => ({
  ...initialState,

  fetchCategories: async (filters?: ExpenseCategoryFilters) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseCategoryApi.getAll(filters);
      set({ 
        categories: response.data.data, 
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch categories", 
        loading: false 
      });
    }
  },

  fetchActiveCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseCategoryApi.getActive();
      set({ 
        activeCategories: response.data.data, 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch active categories", 
        loading: false 
      });
    }
  },

  getCategoryById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseCategoryApi.getById(id);
      set({ currentCategory: response.data.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch category", 
        loading: false 
      });
    }
  },

  createCategory: async (category: CreateExpenseCategoryRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseCategoryApi.create(category);
      set((state) => ({
        categories: [response.data, ...state.categories],
        activeCategories: response.data.is_active 
          ? [response.data, ...state.activeCategories] 
          : state.activeCategories,
        loading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to create category", 
        loading: false 
      });
      return null;
    }
  },

  updateCategory: async (id: number, category: UpdateExpenseCategoryRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseCategoryApi.update(id, category);
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? response.data : c
        ),
        activeCategories: response.data.is_active 
          ? state.activeCategories.map((c) => c.id === id ? response.data : c)
          : state.activeCategories.filter((c) => c.id !== id),
        currentCategory: response.data,
        loading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to update category", 
        loading: false 
      });
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await ExpenseCategoryApi.delete(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        activeCategories: state.activeCategories.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to delete category", 
        loading: false 
      });
      throw error;
    }
  },

  resetCurrentCategory: () => {
    set({ currentCategory: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
