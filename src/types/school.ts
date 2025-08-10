// src/types/school.ts

export type School = {
    id: number;
    name: string;
    code: string;
    address: string;
    phone: string;
    email: string;
    principal_name: string | null;
    establishment_date: string | null; // Format YYYY-MM-DD or null
    logo_path: string | null; // The raw path saved in DB
    logo_url: string | null;  // The full URL for display
    user_id: number | null; // Manager/User ID
    user?: {
        id: number;
        name: string;
        username: string;
        email: string;
    } | null; // Manager/User details
    // is_active?: boolean; // Add if needed
    created_at?: string; // ISO 8601 format
    updated_at?: string; // ISO 8601 format
    classrooms_count?: number; // <-- Add count

};

// Type for creating/updating
export type SchoolFormData = Omit<School, 'id' | 'created_at' | 'updated_at' | 'logo_url' | 'user'> & {
    logo?: File | null; // For handling file input
};