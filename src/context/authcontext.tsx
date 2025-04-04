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
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string, rememberMe: boolean) => Promise<void|boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: null,
    userRole: null,
    userId: null,
    userName: null,
    isLoading: true,
  });

  const { enqueueSnackbar } = useSnackbar();

  const checkAuth = useCallback(async (signal) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      setState({
        isAuthenticated: false,
        userRole: null,
        userId: null,
        userName: null,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await axiosClient.get('auth/verify',{
        signal
      });
      if (response.data.valid) {
        setState({
          isAuthenticated: true,
          userRole: 'admin',
          userId: response.data.user.id.toString(),
          userName: response.data.user.name,
          isLoading: false,
        });
      }
    } catch (error) {
      console.log(error,'error inside check auth')
      setState({
        isAuthenticated: false,
        userRole: null,
        userId: null,
        userName: null,
        isLoading: false,
      });
    }
  
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await axiosClient.post('login', { username, password });

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('authToken', response.data.token);
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      setState({
        isAuthenticated: true,
        userRole: 'admin',
        userId: response.data.user.id,
        userName: response.data.user.name,
        isLoading: false,
      });

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
    
    setState({
      isAuthenticated: false,
      userRole: null,
      userId: null,
      userName: null,
      isLoading: false,
    });

    enqueueSnackbar('تم تسجيل الخروج بنجاح', { variant: 'success' });
  }, [enqueueSnackbar]);

  useEffect(() => {

    const controller = new AbortController()
    checkAuth(controller.signal);
    return ()=>{
        controller.abort()
    }
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