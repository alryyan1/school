import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/authcontext';
import LoadingScreen from './LoadingScreen';
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
export var ProtectedRoute = function (_a) {
    var children = _a.children, _b = _a.roles, roles = _b === void 0 ? [] : _b;
    var _c = useAuth(), isAuthenticated = _c.isAuthenticated, isLoading = _c.isLoading, userRole = _c.userRole;
    var location = useLocation(); // Get location for redirect state
    if (isLoading) {
        return _jsx(LoadingScreen, {});
    }
    if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login.");
        // Pass the current location user tried to access
        return _jsx(Navigate, { to: "/auth/login", state: { from: location }, replace: true });
    }
    var currentUserRole = userRole; // Assuming userRole is set correctly
    if (roles.length > 0 && !roles.includes(currentUserRole)) {
        console.log("User role '".concat(currentUserRole, "' not authorized for roles: ").concat(roles.join(", ")));
        return _jsx(Navigate, { to: "/unauthorized", replace: true });
    }
    // If authenticated and authorized, render the child route element
    return _jsx(_Fragment, { children: children });
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
export var AuthRoute = function (_a) {
    var children = _a.children;
    var _b = useAuth(), isAuthenticated = _b.isAuthenticated, isLoading = _b.isLoading;
    if (isLoading)
        return _jsx(LoadingScreen, {});
    // If already authenticated, redirect from login/register to dashboard
    if (isAuthenticated)
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    // If not authenticated, show the login/register page
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
