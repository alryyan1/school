// src/types/academicYear.ts
import { School } from './school'; // Import School type if needed for nested data

export type AcademicYear = {
    id: number;
    name: string;
    start_date: string; // Format YYYY-MM-DD
    end_date: string;   // Format YYYY-MM-DD
    is_current: boolean;
    school_id: number;
    enrollment_fee?: number;
    school?: School; // Optional nested school data from API resource
    created_at?: string;
    updated_at?: string;
};

// Type for form data (omits read-only fields)
export type AcademicYearFormData = Omit<AcademicYear, 'id' | 'school' | 'created_at' | 'updated_at'>;