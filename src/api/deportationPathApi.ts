// src/api/deportationPathApi.ts
import axiosClient from "../axios-client";

export interface DeportationPath {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

type CollectionResponse = { data: DeportationPath[] };
type ResourceResponse = { data: DeportationPath };

export const DeportationPathApi = {
  // Get all deportation paths
  getAll: () => axiosClient.get<CollectionResponse>("/deportation-paths"),

  // Get a specific deportation path
  get: (id: number) => axiosClient.get<ResourceResponse>(`/deportation-paths/${id}`),

  // Create a new deportation path
  create: (name: string) => axiosClient.post<ResourceResponse>("/deportation-paths", { name }),

  // Update a deportation path
  update: (id: number, name: string) =>
    axiosClient.put<ResourceResponse>(`/deportation-paths/${id}`, { name }),

  // Delete a deportation path
  delete: (id: number) => axiosClient.delete(`/deportation-paths/${id}`),
};

