// src/stores/studentFeePaymentStore.ts
import { create } from 'zustand';
import { StudentFeePayment, StudentFeePaymentFormData } from '@/types/studentFeePayment'; // Adjust path
import { StudentFeePaymentApi } from '@/api/studentFeePaymentApi'; // Adjust path
import { useFeeInstallmentStore } from './feeInstallmentStore'; // Import installment store to potentially refresh it
import dayjs from 'dayjs';

// --- State Interface ---
type StoreState = {
    /** Payments for the currently selected feeInstallmentId */
    payments: StudentFeePayment[];
    /** Loading state for the payments list */
    loading: boolean;
    /** Error message for fetching/mutating payments */
    error: string | null;
    /** Calculated total amount paid from the loaded payments list */
    totalPaidForInstallment: number;
};

// --- Actions Interface ---
type StoreActions = {
    /** Fetches payments for a specific fee installment ID */
    fetchPayments: (feeInstallmentId: number) => Promise<void>;
    /** Creates a new payment for a specific installment */
    createPayment: (data: StudentFeePaymentFormData) => Promise<StudentFeePayment | null>;
    /** Updates an existing payment */
    updatePayment: (id: number, data: Partial<Pick<StudentFeePaymentFormData, 'amount' | 'payment_date' | 'notes'>>) => Promise<StudentFeePayment | null>;
    /** Deletes a payment */
    deletePayment: (id: number) => Promise<boolean>;
    /** Clears the currently stored list of payments and totals */
    clearPayments: () => void;
};

// --- Helper Function to calculate total for the current list ---
const calculateTotal = (payments: StudentFeePayment[]): number => {
    return payments.reduce((sum, payment) => sum + parseFloat(payment.amount as string || '0'), 0);
};

// --- Helper Function to sort payments (descending by date) ---
const sortPayments = (payments: StudentFeePayment[]): StudentFeePayment[] =>
    [...payments].sort((a, b) => dayjs(b.payment_date).diff(dayjs(a.payment_date)));


// --- Initial State ---
const initialState: StoreState = {
    payments: [],
    loading: false,
    error: null,
    totalPaidForInstallment: 0,
};


// --- Zustand Store Creation ---
export const useStudentFeePaymentStore = create<StoreState & StoreActions>((set, get) => ({
    ...initialState,

    // --- Action Implementations ---

    fetchPayments: async (feeInstallmentId) => {
        set({ loading: true, error: null });
        try {
            const response = await StudentFeePaymentApi.getAll(feeInstallmentId);
            const fetchedPayments = response.data.data ?? [];
            set({
                payments: sortPayments(fetchedPayments),
                totalPaidForInstallment: calculateTotal(fetchedPayments),
                loading: false
            });
        } catch (error: any) {
            console.error("Fetch Payments error:", error);
            const message = error.response?.data?.message || 'فشل جلب سجل الدفعات لهذا القسط';
            set({ error: message, loading: false, payments: [], totalPaidForInstallment: 0 });
        }
    },

    createPayment: async (data) => {
        // Component handles submission loading state
        try {
            const response = await StudentFeePaymentApi.create(data);
            const newPayment = response.data.data;
            set((state) => {
                const updatedPayments = sortPayments([...state.payments, newPayment]);
                return {
                    payments: updatedPayments,
                    totalPaidForInstallment: calculateTotal(updatedPayments),
                    error: null,
                };
            });
            // ** Crucially, the caller (Payment Dialog) should now trigger a refresh of the Installment Store **
            // Cannot directly call useFeeInstallmentStore().refreshInstallmentData() here easily.
            return newPayment;
        } catch (error: any) {
            console.error("Create Payment error:", error);
            const message = error.response?.data?.message || 'فشل إضافة الدفعة';
            set({ error: message }); // Set potential error for display
            throw new Error(message); // Re-throw for form
        }
    },

    updatePayment: async (id, data) => {
        try {
            const response = await StudentFeePaymentApi.update(id, data);
            const updatedPayment = response.data.data;
            set((state) => {
                const updatedPayments = sortPayments(state.payments.map((p) =>
                    p.id === id ? { ...p, ...updatedPayment } : p
                ));
                return {
                    payments: updatedPayments,
                    totalPaidForInstallment: calculateTotal(updatedPayments),
                    error: null,
                };
            });
            // ** Caller should trigger Installment Store refresh **
            return updatedPayment;
        } catch (error: any) {
            console.error(`Update Payment ${id} error:`, error);
            const message = error.response?.data?.message || 'فشل تحديث الدفعة';
            set({ error: message });
            throw new Error(message);
        }
    },

    deletePayment: async (id) => {
        try {
            await StudentFeePaymentApi.delete(id);
            set((state) => {
                 const updatedPayments = state.payments.filter((p) => p.id !== id);
                return {
                   payments: updatedPayments,
                   totalPaidForInstallment: calculateTotal(updatedPayments),
                   error: null
                };
            });
            // ** Caller should trigger Installment Store refresh **
            return true;
        } catch (error: any) {
             console.error(`Delete Payment ${id} error:`, error);
             const message = error.response?.data?.message || 'فشل حذف الدفعة';
             set({ error: message });
             return false;
        }
    },

    clearPayments: () => {
        set(initialState); // Reset to initial state
    },
}));