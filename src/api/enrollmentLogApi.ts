import axiosClient from '@/axios-client';

export interface EnrollmentLogMetadata {
  old_grade_level_name?: string;
  new_grade_level_name?: string;
  old_classroom_name?: string;
  new_classroom_name?: string;
  academic_year?: string;
  school_id?: number;
  old_fees?: number;
  new_fees?: number;
  fee_change?: number;
  auto_created?: boolean;
  change_type?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface EnrollmentLog {
  id: number;
  enrollment_id: number;
  student_id: number;
  user_id: number;
  action_type: string;
  action_type_label: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  description: string;
  metadata: EnrollmentLogMetadata;
  changed_at: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
  enrollment?: {
    id: number;
    student: {
      id: number;
      student_name: string;
    };
    gradeLevel: {
      id: number;
      name: string;
    };
    school: {
      id: number;
      name: string;
    };
    classroom?: {
      id: number;
      name: string;
    };
  };
}

export interface EnrollmentLogFilters {
  student_name?: string;
  action_type?: string;
  date_from?: string;
  date_to?: string;
  school_id?: number;
  user_id?: number;
  per_page?: number;
  page?: number;
}

export interface EnrollmentLogResponse {
  data: EnrollmentLog[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  filters: {
    action_types: Record<string, string>;
  };
}

export interface EnrollmentLogStatistics {
  action_type_stats: Record<string, number>;
  daily_activity: Record<string, number>;
  top_users: Array<{
    user_id: number;
    user_name: string;
    count: number;
  }>;
  total_logs: number;
}

export const enrollmentLogApi = {
  // Get all enrollment logs with filtering
  getLogs: async (filters: EnrollmentLogFilters = {}): Promise<EnrollmentLogResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await axiosClient.get(`/enrollment-logs?${params.toString()}`);
    return response.data;
  },

  // Get enrollment log statistics
  getStatistics: async (filters: Partial<EnrollmentLogFilters> = {}): Promise<EnrollmentLogStatistics> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await axiosClient.get(`/enrollment-logs/statistics?${params.toString()}`);
    return response.data;
  },

  // Get a specific enrollment log
  getLog: async (id: number): Promise<{ data: EnrollmentLog }> => {
    const response = await axiosClient.get(`/enrollment-logs/${id}`);
    return response.data;
  },

  // Get logs for a specific enrollment
  getEnrollmentLogs: async (enrollmentId: number): Promise<{ data: EnrollmentLog[] }> => {
    const response = await axiosClient.get(`/enrollments/${enrollmentId}/logs`);
    return response.data;
  },

  // Get logs for a specific student
  getStudentLogs: async (studentId: number): Promise<{ data: EnrollmentLog[] }> => {
    const response = await axiosClient.get(`/students/${studentId}/enrollment-logs`);
    return response.data;
  },
};
