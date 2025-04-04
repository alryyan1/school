// src/types/Student.ts

export enum Gender {
    Male = 'ذكر',
    Female = 'انثي'
  }
  
  export enum EducationLevel {
    Kindergarten = 'روضه',
    Primary = 'ابتدائي',
    Intermediate = 'متوسط',
    Secondary = 'ثانوي',
    NotSpecified = ''
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
    approve_date?: string | null;
    approved_by_user?: number | null;
    message_sent?: boolean;
    
    goverment_id: string;
    wished_level: EducationLevel;
  
    created_at?: string;
    updated_at?: string;
  };