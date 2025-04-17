import { StudentAcademicYear } from './studentAcademicYear'; // Contains nested student etc.
import { TransportRoute } from './transportRoute';

export type StudentTransportAssignment = {
    id: number;
    student_academic_year_id: number;
    transport_route_id: number;
    pickup_point: string | null;
    dropoff_point: string | null;
    // Nested data
    student_enrollment?: StudentAcademicYear; // Renamed for clarity
    transport_route?: TransportRoute;
    created_at?: string;
    updated_at?: string;
};

export type StudentTransportAssignmentFormData = Pick<StudentTransportAssignment,
    'student_academic_year_id' | 'transport_route_id' | 'pickup_point' | 'dropoff_point'
>;

// Students eligible for assignment (needs student info + enrollment ID)
export type AssignableStudentInfo = {
     student_academic_year_id: number; // The ID needed for assignment API
     student_id: number;
     student_name: string;
     grade_level_name: string;
     classroom_name: string | null;
 };