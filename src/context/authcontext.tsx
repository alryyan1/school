// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import axiosClient from '@/axios-client';

type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | null;

interface AuthState {
  isAuthenticated: boolean | null;
  userRole: UserRole;
  userId: string | null;
  userName: string | null;
  userSchoolId?: number | null;
  isLoading: boolean;
  permissions?: string[] | null;
  roles?: string[] | null;
  tokenExpiresAt?: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string, rememberMe: boolean) => Promise<void|boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const persistedUserJson = (typeof window !== 'undefined' && (localStorage.getItem('authUser') || sessionStorage.getItem('authUser'))) || null;
  const persistedUser = persistedUserJson ? JSON.parse(persistedUserJson) : null;
  const persistedToken = typeof window !== 'undefined' && (localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
  const persistedExpiry = (typeof window !== 'undefined' && (localStorage.getItem('authTokenExpiresAt') || sessionStorage.getItem('authTokenExpiresAt'))) || null;

  // Helper function to get the primary role from roles array
  const getPrimaryRole = (roles: string[] | null): UserRole => {
    if (!roles || roles.length === 0) return null;
    // Return the first role, or map 'admin' role specifically
    const firstRole = roles[0];
    if (firstRole === 'admin') return 'admin';
    if (firstRole === 'teacher') return 'teacher';
    if (firstRole === 'student') return 'student';
    if (firstRole === 'parent') return 'parent';
    return firstRole as UserRole;
  };

  const [state, setState] = useState<AuthState>({
    isAuthenticated: persistedToken ? true : null,
    userRole: getPrimaryRole(persistedUser?.roles),
    userId: persistedUser?.id ? String(persistedUser.id) : null,
    userName: persistedUser?.name ?? null,
    userSchoolId: persistedUser?.school_id ?? null,
    isLoading: true,
    permissions: persistedUser?.permissions ?? [],
    roles: persistedUser?.roles ?? [],
    tokenExpiresAt: persistedExpiry,
  });

  const { enqueueSnackbar } = useSnackbar();

  const checkAuth = useCallback(async (signal) => {
    setState(prev => ({ ...prev, isLoading: true }));
    console.log('check auth started')
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      setState({
        isAuthenticated: false,
        userRole: null,
        userId: null,
        userName: null,
        isLoading: false,
        permissions: [],
        roles: [],
        tokenExpiresAt: null,
      });
      return;
    }

    try {
      setState((prev)=>{
        return {...prev,isLoading:true}
      })
      // Ensure Authorization header is set before verify
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axiosClient.get('auth/verify',{
        signal
      });
      if (response.data.valid) {
        console.log('user is valid')
        const userData = response.data.user;
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          userRole: getPrimaryRole(userData.roles),
          userId: userData.id.toString(),
          userName: userData.name,
          userSchoolId: userData.school_id ?? null,
          isLoading: false,
          permissions: userData.permissions || [],
          roles: userData.roles || [],
          tokenExpiresAt: response.data.token_expires_at || prev.tokenExpiresAt || null,
        }));
        const userForStorage = {
          id: userData.id,
          name: userData.name,
          school_id: userData.school_id ?? null,
          roles: userData.roles || [],
          permissions: userData.permissions || [],
        };
        if (localStorage.getItem('authToken')) {
          localStorage.setItem('authUser', JSON.stringify(userForStorage));
          if (response.data.token_expires_at) {
            localStorage.setItem('authTokenExpiresAt', response.data.token_expires_at);
          }
        } else if (sessionStorage.getItem('authToken')) {
          sessionStorage.setItem('authUser', JSON.stringify(userForStorage));
          if (response.data.token_expires_at) {
            sessionStorage.setItem('authTokenExpiresAt', response.data.token_expires_at);
          }
        }
      } else {
        // If token is present but invalid, clear it and mark unauthenticated
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        delete axiosClient.defaults.headers.common['Authorization'];
        localStorage.removeItem('authUser');
        sessionStorage.removeItem('authUser');
        setState({
          isAuthenticated: false,
          userRole: null,
          userId: null,
          userName: null,
          userSchoolId: null,
          isLoading: false,
          permissions: [],
          roles: [],
        });
      }
    } catch (error) {
      console.log(error,'error inside check auth',
        'error name',error.name
      )
      if(error.name != 'CanceledError'){
   setState({
        isAuthenticated: false,
        userRole: null,
        userId: null,
        userName: null,
        isLoading: false,
        permissions: [],
        roles: [],
      });
      }
   
    }
  
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await axiosClient.post('login', { username, password });

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('authToken', response.data.token);
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      const userData = response.data.user;
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        userRole: getPrimaryRole(userData.roles),
        userId: userData.id,
        userName: userData.name,
        userSchoolId: userData.school_id ?? null,
        isLoading: false,
        permissions: userData.permissions || [],
        roles: userData.roles || [],
        tokenExpiresAt: response.data.token_expires_at || null,
      }));

      storage.setItem('authUser', JSON.stringify({
        id: userData.id,
        name: userData.name,
        school_id: userData.school_id ?? null,
        roles: userData.roles || [],
        permissions: userData.permissions || [],
      }));
      if (response.data.token_expires_at) {
        storage.setItem('authTokenExpiresAt', response.data.token_expires_at);
      }

      enqueueSnackbar('تم تسجيل الدخول بنجاح', { variant: 'success' });
      return true; // Indicate success
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    delete axiosClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authUser');
    localStorage.removeItem('authTokenExpiresAt');
    sessionStorage.removeItem('authTokenExpiresAt');
    
    setState({
      isAuthenticated: false,
      userRole: null,
      userId: null,
      userName: null,
      userSchoolId: null,
      isLoading: false,
      permissions: [],
      roles: [],
      tokenExpiresAt: null,
    });

    enqueueSnackbar('تم تسجيل الخروج بنجاح', { variant: 'success' });
  }, [enqueueSnackbar]);

  useEffect(() => {
    const controller = new AbortController();
    
    const authenticate = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        await checkAuth(controller.signal);
      } catch (error) {
        console.error('Authentication error:', error);
        // Handle error (e.g., show toast, redirect, etc.)
      }
    };
  
    authenticate();
  
    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};