// src/stores/studentFeePaymentStore.ts
import { create } from 'zustand';
import { StudentFeePayment, StudentFeePaymentFormData } from '@/types/studentFeePayment';
import { StudentFeePaymentApi } from '@/api/studentFeePaymentApi';

type StoreState = {
    payments: StudentFeePayment[]; // Payments for the currently viewed enrollment
    loading: boolean;
    error: string | null;
    totalPaid: number; // Calculated total
};

type StoreActions = {
    fetchPayments: (studentAcademicYearId: number) => Promise<void>;
    createPayment: (data: StudentFeePaymentFormData) => Promise<StudentFeePayment | null>;
    updatePayment: (id: number, data: Partial<StudentFeePaymentFormData>) => Promise<StudentFeePayment | null>;
    deletePayment: (id: number) => Promise<boolean>;
    clearPayments: () => void;
};

// Helper function to calculate total
const calculateTotal = (payments: StudentFeePayment[]): number => {
    return payments.reduce((sum, payment) => sum + parseFloat(payment.amount as string || '0'), 0);
};

const initialState: StoreState = { payments: [], loading: false, error: null, totalPaid: 0 };

export const useStudentFeePaymentStore = create<StoreState & StoreActions>((set, get) => ({
    ...initialState,

    fetchPayments: async (studentAcademicYearId) => {
        set({ loading: true, error: null });
        try {
            const response = await StudentFeePaymentApi.getAll(studentAcademicYearId);
            const fetchedPayments = response.data.data;
            set({
                payments: fetchedPayments,
                totalPaid: calculateTotal(fetchedPayments),
                loading: false
            });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'فشل جلب سجل الدفعات';
            set({ error: msg, loading: false, payments: [], totalPaid: 0 });
        }
    },

    createPayment: async (data) => {
        try {
            const response = await StudentFeePaymentApi.create(data);
            const newPayment = response.data.data;
            set((state) => {
                const updatedPayments = [...state.payments, newPayment].sort((a,b) => dayjs(b.payment_date).diff(dayjs(a.payment_date))); // Sort desc by date
                return {
                    payments: updatedPayments,
                    totalPaid: calculateTotal(updatedPayments)
                };
            });
            return newPayment;
        } catch (error: any) {
             console.error("Create Payment error:", error);
             const msg = error.response?.data?.message || 'فشل إضافة الدفعة';
             // Set error state? Or throw?
             throw new Error(msg);
        }
    },

    updatePayment: async (id, data) => {
         try {
             const response = await StudentFeePaymentApi.update(id, data);
             const updatedPayment = response.data.data;
             set((state) => {
                 const updatedPayments = state.payments.map((p) => (p.id === id ? updatedPayment : p)).sort((a,b) => dayjs(b.payment_date).diff(dayjs(a.payment_date)));
                 return {
                    payments: updatedPayments,
                    totalPaid: calculateTotal(updatedPayments)
                 };
             });
             return updatedPayment;
         } catch (error: any) {
              console.error("Update Payment error:", error);
              const msg = error.response?.data?.message || 'فشل تحديث الدفعة';
              throw new Error(msg);
         }
     },

     deletePayment: async (id) => {
         try {
             await StudentFeePaymentApi.delete(id);
             set((state) => {
                  const updatedPayments = state.payments.filter((p) => p.id !== id);
                 return {
                    payments: updatedPayments,
                    totalPaid: calculateTotal(updatedPayments)
                 };
             });
             return true;
         } catch (error: any) {
              console.error("Delete Payment error:", error);
              const msg = error.response?.data?.message || 'فشل حذف الدفعة';
              // Set error state?
              return false;
         }
     },

    clearPayments: () => set({ ...initialState }), // Reset state
}));

// Need dayjs for sorting
import dayjs from 'dayjs';