// src/stores/roleStore.ts
import { create } from 'zustand';
import { SpatieRole, SpatiePermission, SpatieRoleFormData } from '@/types/role'; // Adjust path
import { RoleApi } from '@/api/roleApi'; // Adjust path

interface RoleStoreState {
    spatieRoles: SpatieRole[];
    allPermissions: SpatiePermission[];
    loadingRoles: boolean;
    loadingPermissions: boolean;
    error: string | null;
}

interface RoleStoreActions {
    fetchSpatieRoles: () => Promise<void>;
    fetchAllPermissions: () => Promise<void>;
    createRole: (data: SpatieRoleFormData) => Promise<SpatieRole | null>;
    updateRole: (id: number, data: Partial<SpatieRoleFormData>) => Promise<SpatieRole | null>;
    deleteRole: (id: number) => Promise<boolean>;
    clearRoleError: () => void;
}

const initialState: RoleStoreState = {
    spatieRoles: [],
    allPermissions: [],
    loadingRoles: false,
    loadingPermissions: false,
    error: null,
};

// Helper to sort roles and permissions by name
const sortByName = <T extends { name: string }>(items: T[]): T[] =>
    [...items].sort((a, b) => a.name.localeCompare(b.name, 'ar'));


export const useRoleStore = create<RoleStoreState & RoleStoreActions>((set, get) => ({
    ...initialState,

    fetchSpatieRoles: async () => {
        set({ loadingRoles: true, error: null });
        try {
            const response = await RoleApi.getAllRoles();
            set({ spatieRoles: sortByName(response.data.data), loadingRoles: false });
        } catch (err: any) {
            console.error("Fetch Spatie Roles error:", err);
            const msg = err.response?.data?.message || 'فشل جلب الأدوار والصلاحيات';
            set({ error: msg, loadingRoles: false, spatieRoles: [] });
        }
    },

    fetchAllPermissions: async () => {
        set({ loadingPermissions: true, error: null });
        try {
            const response = await RoleApi.getAllPermissions();
            set({ allPermissions: sortByName(response.data.data), loadingPermissions: false });
        } catch (err: any) {
            console.error("Fetch All Permissions error:", err);
            const msg = err.response?.data?.message || 'فشل جلب قائمة الصلاحيات';
            set({ error: msg, loadingPermissions: false, allPermissions: [] });
        }
    },

    createRole: async (data) => {
        // Component handles submission loading state
        try {
            const response = await RoleApi.createRole(data);
            const newRole = response.data.data;
            set((state) => ({
                spatieRoles: sortByName([...state.spatieRoles, newRole]),
                error: null, // Clear previous error on success
            }));
            return newRole;
        } catch (error: any) {
            console.error("Create Role error:", error);
            const message = error.response?.data?.message || 'فشل إضافة الدور';
            set({ error: message });
            throw new Error(message); // Re-throw for form error handling
        }
    },

    updateRole: async (id, data) => {
        try {
            const response = await RoleApi.updateRole(id, data);
            const updatedRole = response.data.data;
            set((state) => ({
                spatieRoles: sortByName(state.spatieRoles.map(r => r.id === id ? { ...r, ...updatedRole } : r)),
                error: null,
            }));
            return updatedRole;
        } catch (error: any) {
            console.error(`Update Role ${id} error:`, error);
            const message = error.response?.data?.message || 'فشل تحديث الدور';
            set({ error: message });
            throw new Error(message);
        }
    },

    deleteRole: async (id) => {
        try {
            await RoleApi.deleteRole(id);
            set((state) => ({
                spatieRoles: state.spatieRoles.filter(r => r.id !== id),
                error: null,
            }));
            return true;
        } catch (error: any) {
            console.error(`Delete Role ${id} error:`, error);
            const message = error.response?.data?.message || 'فشل حذف الدور';
            set({ error: message });
            return false;
        }
    },
    clearRoleError: () => set({ error: null }),
}));