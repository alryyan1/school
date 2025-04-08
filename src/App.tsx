// src/App.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
  Outlet, // Ensure Outlet is imported if layouts need it
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { SnackbarProvider } from 'notistack';
import 'react-toastify/dist/ReactToastify.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // Import CssBaseline
import { arSA } from '@mui/material/locale';
import { CacheProvider } from '@emotion/react';
import { cacheRtl } from './constants';

// --- Layouts ---
import AuthLayout from './components/AuthLayout';
import MainLayout from './components/MainLayout'; // Expects <Outlet /> inside

// --- Core Pages ---
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// --- Student Pages & Components ---
// Verify these paths match your project structure
import StudentList from './pages/students/StudentList';
import StudentDashboard from './pages/students/StudentDashboard';
import StudentView from './pages/students/StudentView';

// --- Teacher Pages & Components ---
// Verify these paths match your project structure
import TeacherList from './pages/teachers/TeacherList';
import TeacherForm from './components/teachers/TeacherForm'; // Note: Component, not page
// Optional: import TeacherDashboard from './pages/teachers/TeacherDashboard';

// --- Common Components ---
import LoadingScreen from './components/LoadingScreen';

// --- Context ---
import { useAuth } from './context/authcontext';
import { StudentForm } from './components/students/studentForm/StudentForm';
import TeacherView from './components/teachers/TeacherView';
import Register from './pages/Signup';
import { schoolRoutes, settings } from './router';
import StudentEnrollmentManager from './pages/enrollments/StudentEnrollmentManager';

// --- Main App Component ---
function App() {
  const theme = createTheme(
    {
      direction: 'rtl',
      typography: {
        fontFamily: ['Cairo', 'sans-serif'].join(','),
      },
      palette: {
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#dc004e',
        },
      },
    },
    arSA
  );

  // --- Protected Route Component ---
  const ProtectedRoute = ({ children, roles = [] }: { children: React.ReactNode, roles?: string[] }) => {
    const { isAuthenticated, isLoading, userRole } = useAuth();
    const location = useLocation(); // Get location for redirect state

    if (isLoading) {
      return <LoadingScreen />;
    }

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login.');
      // Pass the current location user tried to access
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    const currentUserRole = userRole as string; // Assuming userRole is set correctly
    if (roles.length > 0 && !roles.includes(currentUserRole)) {
      console.log(`User role '${currentUserRole}' not authorized for roles: ${roles.join(', ')}`);
      return <Navigate to="/unauthorized" replace />;
    }

    // If authenticated and authorized, render the child route element
    return children;
  };

  // --- Auth Route Component (for Login/Register pages) ---
  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <LoadingScreen />;

    // If already authenticated, redirect from login/register to dashboard
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    // If not authenticated, show the login/register page
    return children;
  };

  // --- Router Configuration ---
  const router = createBrowserRouter([
    // --- Main Application Layout & Routes ---
    {
      path: '/',
      element: (
        <ProtectedRoute roles={['admin']}> {/* Define roles for main app access */}
          <MainLayout userRole={'admin'} /> {/* Pass role if layout needs it */}
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },

        // --- Student Section ---
        {
          path: 'students',
          element: <Outlet />, // Parent renders Outlet for children
          children: [
            { index: true, element: <StudentDashboard /> },
            { path: 'list', element: <StudentList /> },
            { path: 'create', element: <StudentForm /> },
            { path: ':id', element: <StudentView /> },
            { path: ':id/edit', element: <StudentForm /> },
          ]
        },
        // --- End Student Section ---

        // --- Teacher Section ---
        {
          path: 'teachers',
          element: <Outlet />, // Parent renders Outlet for children
          children: [
            { index: true, element: <Navigate to="/teachers/list" replace /> }, // Default to list
            // { index: true, element: <TeacherDashboard /> }, // Or use a dashboard
            { path: 'list', element: <TeacherList /> },
            { path: 'create', element: <TeacherForm /> },
            { path: ':id', element: <TeacherView /> },
            { path: ':id/edit', element: <TeacherForm /> },
          ]
        },
         // --- Enrollments Section ---
         {
          path: 'enrollments', // New top-level section
          element: <StudentEnrollmentManager />,
      },
        // --- End Teacher Section ---

        // --- School Section ---
        schoolRoutes,
        settings

        // --- Other Sections (e.g., Courses, Settings) would follow the same pattern ---

      ],
    },

    // --- Authentication Layout & Routes ---
    {
      path: '/auth',
      element: <AuthLayout />, // Specific layout for auth pages
      children: [
        {
          path: 'login',
          element: (<AuthRoute><Login /></AuthRoute>),
        },
        {
          path: 'register',
          element: (<AuthRoute><Register /></AuthRoute>),
        },
      ],
    },

    // --- Standalone Pages ---
    { path: '/unauthorized', element: <Unauthorized /> },
    { path: '*', element: <NotFound /> }, // Catch-all 404
  ]);

  // --- Render Application ---
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Apply baseline styles */}
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          dense
        >
          <ToastContainer
            position="top-left"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={true}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <RouterProvider router={router} />
          {/* Removed stray "app" text */}
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;