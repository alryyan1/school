// src/api/revenueCategoryApi.ts
import { RevenueCategory, CreateRevenueCategoryRequest, UpdateRevenueCategoryRequest, RevenueCategoryFilters } from "@/types/revenue";
import axiosClient from "../axios-client";

// Response types
export type RevenueCategoryResourceResponse = { data: RevenueCategory };
export type RevenueCategoryCollectionResponse = {
  data: RevenueCategory[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
};

export const RevenueCategoryApi = {
  create: (category: CreateRevenueCategoryRequest) =>
    axiosClient.post<RevenueCategory>("/revenue-categories", category),

  update: (id: number, category: UpdateRevenueCategoryRequest) =>
    axiosClient.put<RevenueCategory>(`/revenue-categories/${id}`, category),

  getAll: (filters?: RevenueCategoryFilters) =>
    axiosClient.get<RevenueCategoryCollectionResponse>("/revenue-categories", { params: filters }),

  getById: (id: number) =>
    axiosClient.get<RevenueCategoryResourceResponse>(`/revenue-categories/${id}`),

  delete: (id: number) =>
    axiosClient.delete(`/revenue-categories/${id}`),

  getAllCategories: () =>
    axiosClient.get<{ data: RevenueCategory[] }>("/revenue-categories-all"),
};

