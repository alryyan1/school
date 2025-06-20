// src/api/roleApi.ts
import axiosClient from '../axios-client'; // Adjust path as needed
import { SpatieRole, SpatiePermission, SpatieRoleFormData } from '@/types/role';

// Assuming backend resources wrap data in a 'data' key
type RoleCollectionResponse = { data: SpatieRole[] };
type RoleResourceResponse = { data: SpatieRole };
type PermissionCollectionResponse = { data: SpatiePermission[] };

export const RoleApi = {
    /** Fetches all defined Spatie roles */
    getAllRoles: () =>
        axiosClient.get<RoleCollectionResponse>('/roles'),

    /** Fetches a single role by its ID, usually with its assigned permissions */
    getRoleById: (id: number) =>
        axiosClient.get<RoleResourceResponse>(`/roles/${id}`),

    /** Creates a new role, optionally with initial permissions */
    createRole: (data: SpatieRoleFormData) =>
        axiosClient.post<RoleResourceResponse>('/roles', data),

    /** Updates an existing role's name and/or its permissions */
    updateRole: (id: number, data: Partial<SpatieRoleFormData>) =>
        axiosClient.put<RoleResourceResponse>(`/roles/${id}`, data),

    /** Deletes a role */
    deleteRole: (id: number) =>
        axiosClient.delete(`/roles/${id}`), // Expects 200/204 with message or no content

    /** Fetches all defined Spatie permissions */
    getAllPermissions: () =>
        axiosClient.get<PermissionCollectionResponse>('/permissions'),
};