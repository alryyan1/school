// src/App.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
  Outlet, // Import Outlet
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { SnackbarProvider } from 'notistack';
import 'react-toastify/dist/ReactToastify.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { arSA } from '@mui/material/locale';
import { CacheProvider } from '@emotion/react';
import { cacheRtl } from './constants';

// Layouts
import AuthLayout from './components/AuthLayout';
import MainLayout from './components/MainLayout'; // Assuming MainLayout has an <Outlet />

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
// Student Pages/Components (ensure correct paths)
import StudentList from './pages/students/StudentList'; // Make sure path is correct
import StudentDashboard from './pages/students/StudentDashboard'; // Make sure path is correct
import StudentView from './pages/students/StudentView'; // Make sure path is correct & component exists

// Common Components
import LoadingScreen from './components/LoadingScreen';

// Context
import { useAuth } from './context/authcontext';
import { StudentForm } from './components/students/studentForm/StudentForm';
import Register from './pages/Signup';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import StudentParent from './components/students/StudentParent';
import { from } from 'stylis';

// CSS (Tailwind/MUI are handled via App.css/Theme)
// Removed: import 'bootstrap/dist/css/bootstrap.min.css'; - Not typical with MUI/Tailwind

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

  // ProtectedRoute remains the same
  const ProtectedRoute = ({ children, roles = [] }: { children: React.ReactNode, roles?: string[] }) => {
    const { isAuthenticated, isLoading, userRole } = useAuth();
    // const location = useLocation()
    // const from = location.state?.from?.pathname || "/dashboard";
    // console.log(from,'from app')
    if (isLoading) {
      return <LoadingScreen />;
    }

    if (!isAuthenticated) {
      return <Navigate state={{from:location}} to="/auth/login" replace />;
    }

    // Ensure userRole is treated as string for comparison
    const currentUserRole = userRole as string;
    if (roles.length > 0 && !roles.includes(currentUserRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  };

  // AuthRoute remains the same
  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <LoadingScreen />;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    return children;
  };

  // --- Router Configuration ---
  const router = createBrowserRouter([
    {
      // --- Main Application Layout ---
      path: '/',
      element: (
        <ProtectedRoute roles={['admin']}> {/* Define roles allowed for main layout */}
          <MainLayout userRole={'admin'} /> {/* Pass userRole if needed by layout */}
        </ProtectedRoute>
      ),
      children: [
        // Default route for '/' - redirects to dashboard
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        // Dashboard route
        {
          path: 'dashboard',
          element: <Dashboard />,
        },

        // --- Student Section ---
        {
          path: 'students', // Base path for all student-related routes (/students)
          element: 
            <StudentParent />
          , // Renders the matched nested student route component
          children: [
            {
              index: true, // Component for the exact '/students' path
              element: <StudentDashboard />, // Or <StudentList /> if list is the default view
            },
            {
              path: 'list', // Path: /students/list
              element: <StudentList />,
            },
            {
              path: 'create', // Path: /students/create
              element: <StudentForm />, // Assumes StudentForm handles 'create' mode
            },
            {
              path: ':id', // Path: /students/:studentId (e.g., /students/123)
              element: <StudentView />, // Component to view a single student
            },
            {
              path: ':id/edit', // Path: /students/:studentId/edit (e.g., /students/123/edit)
              element: <StudentForm />, // Assumes StudentForm handles 'edit' mode based on URL param
            },
          ]
        },
        // --- End Student Section ---

        // --- Add other sections like Teachers, Courses similarly ---
        // Example:
        // {
        //   path: 'teachers',
        //   element: <Outlet />,
        //   children: [
        //      { index: true, element: <TeacherList /> },
        //      { path: 'create', element: <TeacherForm /> },
        //      { path: ':id', element: <TeacherView /> },
        //      { path: ':id/edit', element: <TeacherForm /> },
        //   ]
        // }
        // {
        //   path: 'courses',
        //   element: <Outlet />,
        //   children: [ /* ... course routes */ ]
        // }
      ],
    },

    // --- Authentication Layout ---
    {
      path: '/auth',
      element: <AuthLayout />, // Layout for login/register pages
      children: [
        {
          path: 'login',
          element: (
            <AuthRoute>
              <Login />
            </AuthRoute>
          ),
        },
        {
          path: 'register',
          element: (
            <AuthRoute>
              <Register />
            </AuthRoute>
          ),
        },
        // Add forgot password, etc. here if needed
      ],
    },

    // --- Standalone Pages ---
    {
      path: '/unauthorized', // Unauthorized access page
      element: <Unauthorized />,
    },
    {
      path: '*', // Catch-all for 404 Not Found
      element: <NotFound />,
    },
  ]);

  // --- Render Application ---
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        {/* SnackbarProvider for Material UI based notifications (if needed alongside react-toastify) */}
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          dense // Use dense notifications
        >
          {/* ToastContainer for react-toastify notifications */}
          <ToastContainer
            position="top-left"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={true} // Enable RTL for react-toastify
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light" // Or "dark" or "colored"
          />
          {/* Provide the router configuration */}
          <RouterProvider router={router} />
          app
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;