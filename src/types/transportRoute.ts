import { School } from './school';
import { User } from './user'; // Assuming driver is a User

export type TransportRoute = {
    id: number;
    school_id: number;
    name: string;
    description: string | null;
    driver_id: number | null;
    fee_amount: number | string | null; // Allow string for input
    is_active: boolean;
    school?: School;
    driver?: Pick<User, 'id' | 'name'> | null; // Only relevant driver info
    student_assignments_count?: number; // From withCount
    created_at?: string;
    updated_at?: string;
};

export type TransportRouteFormData = Omit<TransportRoute, 'id' | 'created_at' | 'updated_at' | 'school' | 'driver' | 'student_assignments_count'>;