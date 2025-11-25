// src/types/revenue.ts

export type RevenueCategory = {
  id: number;
  name: string;
  color: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  other_revenues?: OtherRevenue[];
};

export type OtherRevenue = {
  id: number;
  desc: string;
  amount: number;
  revenue_category_id: number;
  payment_method: 'cash' | 'bank';
  revenue_date: string; // ISO format (YYYY-MM-DD)
  user_id: number;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  revenue_category?: RevenueCategory;
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

export type CreateOtherRevenueRequest = {
  desc: string;
  amount: number;
  revenue_category_id: number;
  payment_method: 'cash' | 'bank';
  revenue_date: string;
};

export type UpdateOtherRevenueRequest = Partial<CreateOtherRevenueRequest>;

export type OtherRevenueFilters = {
  category_id?: number;
  date_from?: string;
  date_to?: string;
  payment_method?: 'cash' | 'bank';
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
};

export type OtherRevenueStatistics = {
  total_revenues: number;
  revenue_count: number;
  average_revenue: number;
  revenues_by_category: Array<{
    category_name: string;
    total_amount: number;
    count: number;
  }>;
  totals_by_payment_method?: Array<{
    payment_method: 'cash' | 'bank' | string;
    total_amount: number;
  }>;
};

export type CreateRevenueCategoryRequest = {
  name: string;
  color?: string;
  is_active?: boolean;
};

export type UpdateRevenueCategoryRequest = Partial<CreateRevenueCategoryRequest>;

export type RevenueCategoryFilters = {
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
};

