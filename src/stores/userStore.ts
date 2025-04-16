// src/stores/userStore.ts
import { create } from 'zustand';
import { User, UserFormData } from '@/types/user';
import { UserApi } from '@/api/userApi';

interface UserState {
    users: User[];
    loading: boolean;
    error: string | null;
    // Pagination state
    currentPage: number;
    lastPage: number;
    total: number;
}

interface UserActions {
    fetchUsers: (page?: number, filters?: { name?: string, role?: string }) => Promise<void>;
    createUser: (data: UserFormData) => Promise<User | null>;
    updateUser: (id: number, data: Omit<UserFormData, 'password' | 'password_confirmation'>) => Promise<User | null>;
    deleteUser: (id: number) => Promise<boolean>;
}

const initialState: UserState = {
    users: [], loading: false, error: null, currentPage: 1, lastPage: 1, total: 0
};

export const useUserStore = create<UserState & UserActions>((set, get) => ({
    ...initialState,

    fetchUsers: async (page = 1, filters = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await UserApi.getAll(page, filters);
            set({
                users: response.data.data,
                currentPage: response.data.meta.current_page,
                lastPage: response.data.meta.last_page,
                total: response.data.meta.total,
                loading: false,
            });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'فشل جلب المستخدمين';
            set({ error: msg, loading: false, users: [] });
        }
    },

    createUser: async (data) => {
        // Note: Component handles submitting state
        try {
            const response = await UserApi.create(data);
            // Refetch current page to include the new user correctly
            get().fetchUsers(get().currentPage);
            return response.data.data;
        } catch (err: any) {
            console.error("Create User Error:", err);
            const msg = err.response?.data?.message || 'فشل إضافة المستخدم';
            // Let form handle specific field errors via re-throw
            throw new Error(msg);
        }
    },

    updateUser: async (id, data) => {
        try {
            const response = await UserApi.update(id, data);
            const updatedUser = response.data.data;
            set((state) => ({
                users: state.users.map(u => u.id === id ? updatedUser : u),
            }));
            return updatedUser;
        } catch (err: any) {
            console.error("Update User Error:", err);
            const msg = err.response?.data?.message || 'فشل تحديث المستخدم';
            throw new Error(msg);
        }
    },

    deleteUser: async (id) => {
        try {
            await UserApi.delete(id);
            set((state) => ({
                users: state.users.filter(u => u.id !== id),
                // Adjust total count? Might require refetching for accuracy
                total: Math.max(0, state.total - 1)
            }));
            // Consider refetching current page if deletion changes pagination significantly
            // get().fetchUsers(get().currentPage);
            return true;
        } catch (err: any) {
            console.error("Delete User Error:", err);
            const msg = err.response?.data?.message || 'فشل حذف المستخدم';
            set({ error: msg }); // Set global error for delete failure
            return false;
        }
    },
}));