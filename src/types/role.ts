// src/types/role.ts

export interface SpatiePermission {
    id: number;
    name: string; // The unique permission string, e.g., "edit articles"
    // guard_name is usually 'web' or 'api', not typically needed in frontend display
}

export interface SpatieRole {
    id: number;
    name: string; // The unique role name, e.g., "admin", "editor"
    permissions_count?: number; // From withCount on backend
    users_count?: number;       // From withCount on backend
    permissions?: SpatiePermission[]; // When loaded for detail/edit (array of permission objects)
    created_at?: string;
    updated_at?: string;
}

// Form data for creating/editing a role
export interface SpatieRoleFormData {
    name: string;
    permissions?: string[]; // Array of permission NAMES to assign/sync
}