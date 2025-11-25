// src/stores/revenueCategoryStore.ts
import { create } from "zustand";
import { RevenueCategory, CreateRevenueCategoryRequest, UpdateRevenueCategoryRequest, RevenueCategoryFilters } from "@/types/revenue";
import { RevenueCategoryApi, RevenueCategoryCollectionResponse, RevenueCategoryResourceResponse } from "@/api/revenueCategoryApi";

type RevenueCategoryState = {
  categories: RevenueCategory[];
  currentCategory: RevenueCategory | null;
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

type RevenueCategoryActions = {
  fetchCategories: (filters?: RevenueCategoryFilters) => Promise<void>;
  getCategoryById: (id: number) => Promise<void>;
  createCategory: (category: CreateRevenueCategoryRequest) => Promise<RevenueCategory | null>;
  updateCategory: (id: number, category: UpdateRevenueCategoryRequest) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  resetCurrentCategory: () => void;
  clearError: () => void;
};

const initialState: RevenueCategoryState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
  pagination: null,
};

export const useRevenueCategoryStore = create<RevenueCategoryState & RevenueCategoryActions>((set) => ({
  ...initialState,

  fetchCategories: async (filters?: RevenueCategoryFilters) => {
    set({ loading: true, error: null });
    try {
      const response = await RevenueCategoryApi.getAll(filters);
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

  getCategoryById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await RevenueCategoryApi.getById(id);
      set({ currentCategory: response.data.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch category", 
        loading: false 
      });
    }
  },

  createCategory: async (category: CreateRevenueCategoryRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await RevenueCategoryApi.create(category);
      set((state) => ({
        categories: [response.data, ...state.categories],
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

  updateCategory: async (id: number, category: UpdateRevenueCategoryRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await RevenueCategoryApi.update(id, category);
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? response.data : c
        ),
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
      await RevenueCategoryApi.delete(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
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

