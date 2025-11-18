// src/api/otherRevenueApi.ts
import { OtherRevenue, CreateOtherRevenueRequest, UpdateOtherRevenueRequest, OtherRevenueFilters, OtherRevenueStatistics } from "@/types/revenue";
import axiosClient from "../axios-client";

// Response types
export type OtherRevenueResourceResponse = { data: OtherRevenue };
export type OtherRevenueCollectionResponse = {
  data: OtherRevenue[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
};

export const OtherRevenueApi = {
  create: (revenue: CreateOtherRevenueRequest) =>
    axiosClient.post<OtherRevenue>("/other-revenues", revenue),

  update: (id: number, revenue: UpdateOtherRevenueRequest) =>
    axiosClient.put<OtherRevenue>(`/other-revenues/${id}`, revenue),

  getAll: (filters?: OtherRevenueFilters) =>
    axiosClient.get<OtherRevenueCollectionResponse>("/other-revenues", { params: filters }),

  getById: (id: number) =>
    axiosClient.get<OtherRevenueResourceResponse>(`/other-revenues/${id}`),

  delete: (id: number) =>
    axiosClient.delete(`/other-revenues/${id}`),

  getStatistics: (filters?: { date_from?: string; date_to?: string }) =>
    axiosClient.get<OtherRevenueStatistics>("/other-revenues-statistics", { params: filters }),
};

