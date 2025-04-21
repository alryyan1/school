// src/types/gradeLevel.ts
export type GradeLevelAssignmentDetails = {
    basic_fees: number;
    assigned_at?: string;
    fee_last_updated_at?: string;
};

export type GradeLevel = {
    id: number;
    name: string;
    code: string;
    description: string | null;
    created_at?: string;
    updated_at?: string;
    // Optional: Pivot data when fetched via school relationship
    assignment_details?: GradeLevelAssignmentDetails | null;
};
// Form Data for assigning NEW grades
export type AssignGradeLevelFormData = {
    grade_level_id: number | '';
    basic_fees: number | string;
};

// Form Data for editing EXISTING fee
export type UpdateGradeFeeFormData = {
    basic_fees: number | string;
};
// Type for form data
export type GradeLevelFormData = Omit<GradeLevel, 'id' | 'created_at' | 'updated_at'>;