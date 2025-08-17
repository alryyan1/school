// src/stores/paymentMethodStore.ts
import { create } from 'zustand';
import { PaymentMethod } from '@/types/paymentMethod';
import { PaymentMethodApi } from '@/api/paymentMethodApi';

type StoreState = {
  methods: PaymentMethod[];
  loading: boolean;
  error: string | null;
};

type StoreActions = {
  fetchMethods: () => Promise<void>;
  createMethod: (name: string) => Promise<PaymentMethod | null>;
};

export const usePaymentMethodStore = create<StoreState & StoreActions>((set, get) => ({
  methods: [],
  loading: false,
  error: null,

  fetchMethods: async () => {
    set({ loading: true, error: null });
    try {
      const res = await PaymentMethodApi.getAll();
      set({ methods: res.data.data, loading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'فشل تحميل طرق الدفع';
      set({ error: message, loading: false, methods: [] });
    }
  },

  createMethod: async (name: string) => {
    try {
      const res = await PaymentMethodApi.create({ name });
      const method = res.data.data;
      set((state) => ({ methods: [...state.methods, method] }));
      return method;
    } catch (err: any) {
      const message = err.response?.data?.message || 'فشل إضافة طريقة الدفع';
      set({ error: message });
      throw new Error(message);
    }
  },
}));


