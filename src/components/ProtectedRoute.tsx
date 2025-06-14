import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/authcontext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Array of roles that are allowed to access this route.
   * If empty, any authenticated user can access.
   * @example ['admin', 'teacher']
   */
  roles?: string[];
}

interface AuthRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes by checking authentication and authorization.
 * Redirects unauthenticated users to login page.
 * Redirects unauthorized users to unauthorized page.
 * 
 * @example
 * // Allow any authenticated user
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Allow only admin users
 * <ProtectedRoute roles={['admin']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * @example
 * // Allow admin and teacher users
 * <ProtectedRoute roles={['admin', 'teacher']}>
 *   <TeacherDashboard />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles = [],
}) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const location = useLocation(); // Get location for redirect state

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login.");
    // Pass the current location user tried to access
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const currentUserRole = userRole as string; // Assuming userRole is set correctly
  if (roles.length > 0 && !roles.includes(currentUserRole)) {
    console.log(
      `User role '${currentUserRole}' not authorized for roles: ${roles.join(
        ", "
      )}`
    );
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render the child route element
  return <>{children}</>;
};

/**
 * AuthRoute Component
 * 
 * Protects authentication routes (login/register) by redirecting
 * already authenticated users to the dashboard.
 * 
 * @example
 * <AuthRoute>
 *   <Login />
 * </AuthRoute>
 */
export const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  // If already authenticated, redirect from login/register to dashboard
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  // If not authenticated, show the login/register page
  return <>{children}</>;
};

export default ProtectedRoute; 