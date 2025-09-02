// src/types/user.ts

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';
export type UserGender = never; // removed

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    school_id: number | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: string[]; // Spatie role names (from API response)
    permissions?: string[]; // Spatie permission names (from API response)
}

// For Create/Edit form (includes passwords only for create)
export interface UserFormData extends Omit<User, 'id' | 'email_verified_at' | 'created_at' | 'updated_at' | 'roles' | 'permissions'> {
    password?: string;
    password_confirmation?: string;
    spatie_roles?: string[]; // Array of Spatie role NAMES to assign
}
// For Password Change form
export interface UserPasswordFormData {
    password?: string;
    password_confirmation?: string;
}