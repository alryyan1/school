// src/stores/feeInstallmentStore.ts
import { create } from 'zustand';
import { FeeInstallment, FeeInstallmentFormData } from '@/types/feeInstallment'; // Adjust path
import { FeeInstallmentApi } from '@/api/feeInstallmentApi'; // Adjust path
import dayjs from 'dayjs'; // For sorting

// --- State Interface ---
type StoreState = {
    /** Installments for the currently selected studentAcademicYearId */
    installments: FeeInstallment[];
    /** Loading state for the installments list */
    loading: boolean;
    /** Error message for fetching/mutating installments */
    error: string | null;
    /** Calculated total amount due from all loaded installments */
    totalDue: number;
    /** Calculated total amount paid across all loaded installments */
    totalPaidOverall: number;
};

// --- Actions Interface ---
type StoreActions = {
    /** Fetches installments for a specific enrollment record */
    fetchInstallments: (studentAcademicYearId: number) => Promise<void>;
    /** Creates a new installment */
    createInstallment: (data: FeeInstallmentFormData) => Promise<FeeInstallment | null>;
    /** Updates an existing installment */
    updateInstallment: (id: number, data: Partial<FeeInstallmentFormData>) => Promise<FeeInstallment | null>;
    /** Deletes an installment */
    deleteInstallment: (id: number) => Promise<boolean>;
    /**
     * Allows updating the paid amount and status of a single installment locally.
     * Called after a payment is added/updated/deleted elsewhere.
     * Assumes updatedInstallmentData contains at least id, amount_paid, status.
     */
    refreshInstallmentData: (installmentId: number, updatedInstallmentData: Partial<Pick<FeeInstallment, 'id' | 'amount_paid' | 'status'>>) => void;
    /** Clears the store state */
    clearInstallments: () => void;
};

// --- Helper Functions ---
const calculateTotals = (items: FeeInstallment[]): { totalDue: number; totalPaidOverall: number } => ({
    totalDue: items.reduce((sum, i) => sum + parseFloat(i.amount_due as string || '0'), 0),
    totalPaidOverall: items.reduce((sum, i) => sum + parseFloat(i.amount_paid as string || '0'), 0)
});

const sortInstallments = (items: FeeInstallment[]): FeeInstallment[] =>
    [...items].sort((a, b) => dayjs(a.due_date).diff(dayjs(b.due_date)));


// --- Initial State ---
const initialState: StoreState = {
    installments: [],
    loading: false,
    error: null,
    totalDue: 0,
    totalPaidOverall: 0,
};

// --- Zustand Store Creation ---
export const useFeeInstallmentStore = create<StoreState & StoreActions>((set, get) => ({
    ...initialState,

    // --- Action Implementations ---

    fetchInstallments: async (studentAcademicYearId) => {
        set({ loading: true, error: null });
        try {
            const response = await FeeInstallmentApi.getAll(studentAcademicYearId);
            const fetchedInstallments = response.data.data ?? []; // Handle case where data might be missing
            const totals = calculateTotals(fetchedInstallments);
            set({
                installments: sortInstallments(fetchedInstallments),
                totalDue: totals.totalDue,
                totalPaidOverall: totals.totalPaidOverall,
                loading: false
            });
        } catch (error: any) {
            console.error("Fetch Installments error:", error);
            const message = error.response?.data?.message || 'فشل جلب الأقساط المستحقة';
            set({ error: message, loading: false, installments: [], totalDue: 0, totalPaidOverall: 0 });
        }
    },

    createInstallment: async (data) => {
        // Component handles submission loading state
        try {
            const response = await FeeInstallmentApi.create(data);
            const newInstallment = response.data.data;
            set((state) => {
                const updatedList = sortInstallments([...state.installments, newInstallment]);
                const totals = calculateTotals(updatedList);
                return { installments: updatedList, ...totals, error: null };
            });
            return newInstallment;
        } catch (error: any) {
            console.error("Create Installment error:", error);
            const message = error.response?.data?.message || 'فشل إضافة القسط';
            set({ error: message }); // Set global error state
            throw new Error(message); // Re-throw for form handling
        }
    },

    updateInstallment: async (id, data) => {
        try {
            const response = await FeeInstallmentApi.update(id, data);
            const updatedInstallment = response.data.data;
            set((state) => {
                const updatedList = sortInstallments(state.installments.map(inst =>
                    inst.id === id ? { ...inst, ...updatedInstallment } : inst // Merge updates
                ));
                const totals = calculateTotals(updatedList);
                return { installments: updatedList, ...totals, error: null };
            });
            return updatedInstallment;
        } catch (error: any) {
            console.error(`Update Installment ${id} error:`, error);
            const message = error.response?.data?.message || 'فشل تحديث القسط';
            set({ error: message });
            throw new Error(message);
        }
    },

    deleteInstallment: async (id) => {
        try {
            await FeeInstallmentApi.delete(id);
            set((state) => {
                 const updatedList = state.installments.filter((inst) => inst.id !== id);
                 const totals = calculateTotals(updatedList);
                 return { installments: updatedList, ...totals, error: null };
            });
            return true;
        } catch (error: any) {
            console.error(`Delete Installment ${id} error:`, error);
            const message = error.response?.data?.message || 'فشل حذف القسط (قد تكون هناك دفعات مرتبطة به)';
            set({ error: message });
            return false;
        }
    },

    // This allows updating an installment's paid amount/status from outside (e.g., after payment)
    // It expects the caller (Payment Store or Component) to provide the updated installment data
    refreshInstallmentData: (installmentId, updatedData) => {
        set(state => {
             const updatedList = state.installments.map(inst =>
                 inst.id === installmentId ? { ...inst, ...updatedData } : inst
             );
             const totals = calculateTotals(updatedList);
             return { installments: sortInstallments(updatedList), ...totals };
        })
    },

    clearInstallments: () => {
        set(initialState); // Reset state
    },
}));