// src/types/gradeLevel.ts

export type GradeLevel = {
    id: number;
    name: string;
    code: string;
    description: string | null;
    created_at?: string;
    updated_at?: string;
};

// Type for form data
export type GradeLevelFormData = Omit<GradeLevel, 'id' | 'created_at' | 'updated_at'>;