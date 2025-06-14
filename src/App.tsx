// src/App.tsx
import {
  createHashRouter,
  RouterProvider,
  Navigate,
  Outlet, // Ensure Outlet is imported if layouts need it
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { SnackbarProvider } from "notistack";
import "react-toastify/dist/ReactToastify.css";

// --- Layouts ---
import AuthLayout from "./components/AuthLayout";
import MainLayout from "./components/MainLayout"; // Expects <Outlet /> inside

// --- Core Pages ---
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// --- Student Pages & Components ---
// Verify these paths match your project structure
import StudentList from "./pages/students/StudentList";
import StudentDashboard from "./pages/students/StudentDashboard";
import StudentView from "./pages/students/StudentView";

// --- Teacher Pages & Components ---
// Verify these paths match your project structure

// Optional: import TeacherDashboard from './pages/teachers/TeacherDashboard';

// --- Common Components ---
import { ProtectedRoute, AuthRoute } from "./components/ProtectedRoute";

// --- Context ---
import { AuthProvider } from "./context/authcontext";
import { StudentForm } from "./components/students/studentForm/StudentForm";

import Register from "./pages/Signup";
import { schoolRoutes, settings } from "./router";
import StudentEnrollmentManager from "./pages/enrollments/StudentEnrollmentManager";
import TransportRouteList from "./pages/transport/TransportRouteList";
import SchoolExplorerPage from "./pages/pages/SchoolExplorerPage";
import SchoolClassroomListPage from "./pages/pages/SchoolClassroomListPage";
import ClassroomStudentListPage from "./pages/pages/ClassroomStudentListPage";
import DueInstallmentsPage from "./pages/finances/DueInstallmentsPage";
import GradeLevelClassroomListPage from "./pages/pages/GradeLevelClassroomListPage";

// --- Main App Component ---
function App() {

  // --- Router Configuration ---
  const router = createHashRouter([
    // --- Main Application Layout & Routes ---
    {
      path: "/",
      element: (
        <ProtectedRoute roles={["admin"]}>
          {" "}
          {/* Define roles for main app access */}
          <MainLayout /> {/* Updated to not pass userRole */}
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "dashboard", element: <Dashboard /> },

        // --- Student Section ---
        {
          path: "students",
          element: <Outlet />, // Parent renders Outlet for children
          children: [
            { index: true, element: <StudentDashboard /> },
            { path: "list", element: <StudentList /> },
            { path: "create", element: <StudentForm /> },
            { path: ":id", element: <StudentView /> },
            { path: ":id/edit", element: <StudentForm /> },
          ],
        },
        {
          // --- Maybe add a Finance Section ---
          path: "finance",
          element: <Outlet />,
          children: [
            {
              index: true,
              element: <Navigate to="due-installments" replace />,
            }, // Default finance page
            { path: "due-installments", element: <DueInstallmentsPage /> },
            // Add other finance related pages here later
          ],
        },
        // --- School Explorer Section ---
        {
          path: "schools-explorer",
          element: <Outlet />, // Use Outlet for nesting
          children: [
            { index: true, element: <SchoolExplorerPage /> }, // Level 1
            {
              path: ":schoolId/gradelevels",
              element: <SchoolClassroomListPage />, // Level 2
            },
            {
              path: ":schoolId/classrooms/:classroomId/students",
              element: <ClassroomStudentListPage />, // Level 3
            },
            {
              path:":schoolId/grade-levels/:gradeLevelId/classrooms",
              element:<GradeLevelClassroomListPage/>
            }
          ],
        },
        // --- End Student Section ---

    
        // --- Enrollments Section ---
        {
          path: "enrollments", // New top-level section
          element: <StudentEnrollmentManager />,
        },
        // --- End Teacher Section ---

        // --- School Section ---
        schoolRoutes,
        settings,

        // --- Other Sections (e.g., Courses, Settings) would follow the same pattern ---
      ],
    },

    // --- Authentication Layout & Routes ---
    {
      path: "/auth",
      element: <AuthLayout />, // Specific layout for auth pages
      children: [
        {
          path: "login",
          element: (
            <AuthRoute>
              <Login />
            </AuthRoute>
          ),
        },
        {
          path: "register",
          element: (
            <AuthRoute>
              <Register />
            </AuthRoute>
          ),
        },
      ],
    },
    // --- TRANSPORT SECTION ---
    {
      path: "transport", // Base path
      element: <Outlet />,
      children: [
        { index: true, element: <Navigate to="/transport/routes" replace /> },
        { path: "routes", element: <TransportRouteList /> },
        // Add other transport pages later (e.g., overview, vehicle management)
      ],
    },
    // --- Standalone Pages ---
    { path: "/unauthorized", element: <Unauthorized /> },
    { path: "*", element: <NotFound /> }, // Catch-all 404
  ]);

  // --- Render Application ---
  return (
    <AuthProvider> {/* Your AuthContext remains crucial */}
    <SnackbarProvider /* ... MUI Snackbar ... */ >
      <ToastContainer /* ... react-toastify ... */ />
      <RouterProvider router={router} />
    </SnackbarProvider>
  </AuthProvider>
  );
}

export default App;
