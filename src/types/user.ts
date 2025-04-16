// src/types/user.ts

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';
export type UserGender = 'male' | 'female' | 'ذكر' | 'انثي' | null; // Allow flexibility

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    phone: string | null;
    gender: UserGender;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

// For Create/Edit form (includes passwords only for create)
export interface UserFormData extends Omit<User, 'id' | 'email_verified_at' | 'created_at' | 'updated_at'> {
    password?: string; // Optional for edit, required for create
    password_confirmation?: string; // Only for create
}

// For Password Change form
export interface UserPasswordFormData {
    password?: string;
    password_confirmation?: string;
}