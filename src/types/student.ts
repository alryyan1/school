// src/types/Student.ts
import { Enrollment } from './enrollment';

export enum Gender {
    Male = 'ذكر',
    Female = 'انثي'
  }
  
  export enum EducationLevel {
    Kindergarten = 'روضه',
    Primary = 'ابتدائي',
    Intermediate = 'متوسط',
    Secondary = 'ثانوي',
    NotSpecified = 'كل المراحل'
  }
  
  export type Student = {
    id: number;
    student_name: string;
    father_name: string;
    father_job: string;
    father_address: string;
    father_phone: string;
    father_whatsapp: string | null;
    mother_name: string;
    mother_job: string;
    mother_address: string;
    mother_phone: string;
    mother_whatsapp: string | null;
    email: string | null;
    date_of_birth: string; // ISO format (YYYY-MM-DD)
    gender: Gender;
    closest_name: string | null;
    closest_phone: string | null;
    referred_school: string | null;
    success_percentage: string | null;
    medical_condition: string | null;
  
    other_parent: string;
    relation_of_other_parent: string;
    relation_job: string;
    relation_phone: string;
    relation_whatsapp: string;
    image: string;
    
    approved?: boolean;
    aproove_date?: string | null;
    approved_by_user?: number | null;
    message_sent?: boolean;
    
    goverment_id: string;
    wished_school: number | null; // School ID
    wished_school_details?: {
      id: number;
      name: string;
      code: string;
    } | null;
  
    created_at?: string;
    updated_at?: string;
    image_url?:string;
    enrollments?: Enrollment[];
    latest_academic_year_totals?: {
      student_academic_year_id: number | string;
      academic_year?: {
        id?: number | string;
        name?: string;
        start_date?: string;
        end_date?: string;
      } | null;
      total_amount_required: number;
      total_amount_paid: number;
    } | null;
  };