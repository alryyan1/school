// src/stores/dueInstallmentsStore.ts
import { create } from 'zustand';
import { FeeInstallment } from '@/types/feeInstallment'; // Adjust path
import { FeeInstallmentApi } from '@/api/feeInstallmentApi'; // Adjust path

type StoreState = {
    dueInstallments: FeeInstallment[];
    loading: boolean;
    error: string | null;
};

type StoreActions = {
    fetchDueSoon: (days?: number) => Promise<void>;
};

const initialState: StoreState = { dueInstallments: [], loading: false, error: null };

export const useDueInstallmentsStore = create<StoreState & StoreActions>((set) => ({
    ...initialState,

    fetchDueSoon: async (days = 7) => {
        set({ loading: true, error: null });
        try {
            const response = await FeeInstallmentApi.getDueSoon(days);
            set({ dueInstallments: response.data.data ?? [], loading: false });
        } catch (error: any) {
            console.error("Fetch Due Soon Installments error:", error);
            const msg = error.response?.data?.message || 'فشل جلب الأقساط المستحقة قريباً';
            set({ error: msg, loading: false, dueInstallments: [] });
        }
    },
}));