// src/App.js
import React, { useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  Outlet,
} from 'react-router-dom';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './components/MainLayout';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';
import { arSA } from '@mui/material/locale';
import StudentPage from './pages/StudentPage';
import StudentOptions from './pages/StudentOptions';
import StudentList from './pages/StudentList';
import NotFound from './pages/NotFound';
import { CacheProvider } from '@emotion/react';
import { cacheRtl } from './constants';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const theme = useMemo(
    () =>
      createTheme({
        direction: 'rtl', // Set the direction to rtl
        typography: {
          fontFamily: ['Cairo', 'sans-serif'].join(','), // Use Cairo font
        },
      }, arSA),
    [],
  );
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const response = await axios.get('/api/user');

        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>تحميل...</div>;
  }

  // Custom Route Component
  const RequireAuth = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
      if (!isAuthenticated) {
        navigate('/login');
      }
    }, [isAuthenticated, navigate]);

    return isAuthenticated ? children : null; // Or a loading spinner
  };



  // Define routes using createBrowserRouter
  const router = createBrowserRouter([
    {
      path: '/login',
      element: <Login />, // Login is outside the MainLayout
    },
    {
      path: '/register',
      element: <Signup />, // Register is outside the MainLayout
    },
    {
      path: '/',
      element: (
        <RequireAuth>
          <MainLayout>
            <Outlet />
          </MainLayout>
        </RequireAuth>
      ), // MainLayout will render the Outlet
      children: [
        {
          path: 'dashboard',
          element: <Dashboard />,
        },
        {
          path: '/',
          element: <Dashboard />,
        },
        {
          path: 'students',
          element: <StudentOptions />,
        },
        {
          path: 'students/create',
          element: <StudentPage />,
        },
        {
          path: 'students/list',
          element: <StudentList />,
        },
      ],
    },
      {
            path: '*',  // Catch-all route
            element: <NotFound />,
        },
  ]);

  return (
    <ThemeProvider theme={theme}>
      <CacheProvider value={cacheRtl}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={true} // Set rtl for ToastContainer as well
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <RouterProvider router={router} />
      </CacheProvider>
    </ThemeProvider>
  );
}

export default App;