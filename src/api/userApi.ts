// src/api/userApi.ts
import axiosClient from "../axios-client";
import { User, UserFormData, UserPasswordFormData } from "@/types/user";

// Assuming backend uses pagination for index
interface PaginatedUsersResponse {
  data: User[];
  links: any;
  meta:any;
}
// Assuming single resource responses wrap in 'data'
interface UserResourceResponse {
  data: User;
}

export const UserApi = {
  // Get paginated users
  getAll: (page: number = 1, filters: { name?: string; role?: string } = {}) =>
    axiosClient.get<PaginatedUsersResponse>("/users", {
      params: { page, ...filters },
    }),

  // Get single user
  getById: (id: number) =>
    axiosClient.get<UserResourceResponse>(`/users/${id}`),

  // Create user (includes password)
  create: (data: UserFormData) =>
    axiosClient.post<UserResourceResponse>("/users", data),

  // Update user (EXCLUDES password)
  update: (
    id: number,
    data: Omit<UserFormData, "password" | "password_confirmation">
  ) => axiosClient.put<UserResourceResponse>(`/users/${id}`, data),

  // Update password ONLY
  updatePassword: (id: number, data: UserPasswordFormData) =>
    axiosClient.put(`/users/${id}/password`, data), // No specific data expected back, just success/error

  // Delete user
  delete: (id: number) => axiosClient.delete(`/users/${id}`),
};
