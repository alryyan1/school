// src/types/subject.ts

export type Subject = {
    id: number;
    name: string;
    code: string;
    description: string | null;
    // is_active?: boolean;
    // credit_hours?: number | null;
    // type?: string | null;
    created_at?: string;
    updated_at?: string;
};

// Type for form data
export type SubjectFormData = Omit<Subject, 'id' | 'created_at' | 'updated_at'>;