// src/stores/transportRouteStore.ts
import { create } from 'zustand';
import { TransportRoute, TransportRouteFormData } from '@/types/transportRoute'; // Adjust path
import { TransportRouteApi } from '@/api/transportRouteApi'; // Adjust path

type StoreState = {
    /** Routes for the currently selected school */
    routes: TransportRoute[];
    loading: boolean;
    error: string | null;
};

type StoreActions = {
    fetchRoutes: (schoolId: number) => Promise<void>;
    createRoute: (data: TransportRouteFormData) => Promise<TransportRoute | null>;
    updateRoute: (id: number, data: Partial<TransportRouteFormData>) => Promise<TransportRoute | null>;
    deleteRoute: (id: number) => Promise<boolean>;
    clearRoutes: () => void;
};

const initialState: StoreState = { routes: [], loading: false, error: null };

// Helper sort function
const sortRoutes = (routes: TransportRoute[]): TransportRoute[] =>
    [...routes].sort((a, b) => a.name.localeCompare(b.name));

export const useTransportRouteStore = create<StoreState & StoreActions>((set, get) => ({
    ...initialState,

    fetchRoutes: async (schoolId) => {
        set({ loading: true, error: null });
        try {
            const response = await TransportRouteApi.getAll({ school_id: schoolId });
            set({ routes: sortRoutes(response.data.data), loading: false });
        } catch (error: any) {
            console.error("Fetch Routes error:", error);
            const msg = error.response?.data?.message || 'فشل جلب مسارات النقل';
            set({ error: msg, loading: false, routes: [] });
        }
    },

    createRoute: async (data) => {
        try {
            const response = await TransportRouteApi.create(data);
            const newRoute = response.data.data;
            set((state) => ({
                routes: sortRoutes([...state.routes, newRoute]),
                error: null,
            }));
            return newRoute;
        } catch (error: any) {
            console.error("Create Route error:", error);
            const msg = error.response?.data?.message || 'فشل إضافة المسار';
            throw new Error(msg); // Rethrow for form handling
        }
    },

    updateRoute: async (id, data) => {
        try {
            const response = await TransportRouteApi.update(id, data);
            const updatedRoute = response.data.data;
            set((state) => ({
                routes: sortRoutes(state.routes.map((r) => (r.id === id ? { ...r, ...updatedRoute } : r))), // Merge updates
                error: null,
            }));
            return updatedRoute;
        } catch (error: any) {
            console.error(`Update Route ${id} error:`, error);
            const msg = error.response?.data?.message || 'فشل تحديث المسار';
            throw new Error(msg); // Rethrow for form handling
        }
    },

    deleteRoute: async (id) => {
        try {
            await TransportRouteApi.delete(id);
            set((state) => ({
                routes: state.routes.filter((r) => r.id !== id),
                error: null,
            }));
            return true;
        } catch (error: any) {
            console.error(`Delete Route ${id} error:`, error);
            const msg = error.response?.data?.message || 'فشل حذف المسار';
            set({ error: msg }); // Set global error
            return false;
        }
    },

    clearRoutes: () => set(initialState),
}));