import { Navigate, Outlet, RouteObject } from "react-router-dom";
import SchoolList from "./pages/schools/schoolList";
import SchoolForm from "./pages/schools/schoolForm";
import SchoolView from "./pages/schools/schoolView";
import AcademicYearList from "./components/settings/academicYearList";
import GradeLevelList from "./components/settings/GradeLevelList";
import SettingsDashboard from "./components/settings/SettingsDashboard";
import SubjectList from "./components/settings/SubjectList";
import CurriculumManager from "./pages/curriculum/CurriculumManager";
import ClassroomList from "./components/settings/ClassroomList";
import ExamList from "./components/exams/ExamList";
import SchoolGradeLevelManager from "./pages/settings/SchoolGradeLevelManager";
import UserList from "./components/users/UserList";
import ExamSchedulePage from "./components/exams/ExamSchedulePage";
import GeneralSettingsPage from "./pages/settings/GeneralSettingsPage";
import TeacherList from "./pages/teachers/TeacherList";
import TeacherForm from "./components/teachers/TeacherForm";
import TeacherView from "./components/teachers/TeacherView";
import ProtectedRoute from "./components/ProtectedRoute";
  
export const schoolRoutes: RouteObject = {
  path: "schools", // Base path for schools
  element: <Outlet />, // Renders nested school routes
  children: [
    { index: true, element: <Navigate to="/schools/list" replace /> }, // Default to list
    { path: "list", element: <SchoolList /> },
    { path: "create", element: <SchoolForm /> }, // SchoolForm handles create mode
    { path: ":id", element: <SchoolView /> },
    { path: ":id/edit", element: <SchoolForm /> }, // SchoolForm handles edit mode
  ],
};

// --- Settings Section Example ---
export const settings: RouteObject = {
  path: "settings", // Base path for settings
  element: <Outlet />, // Renders nested settings routes
  children: [
    { index: true, element: <SettingsDashboard /> },
    // Specific settings pages are still routed directly
    { path: "academic-years", element: <AcademicYearList /> },
    { path: "grade-levels", element: <GradeLevelList /> },
      // --- Teacher Section ---
      {
        path: "teachers",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <Outlet />
          </ProtectedRoute>
        ), // Parent renders Outlet for children
        children: [
          { index: true, element: <Navigate to="/teachers/list" replace /> }, // Default to list
          // { index: true, element: <TeacherDashboard /> }, // Or use a dashboard
          { path: "list", element: <TeacherList /> },
          { path: "create", element: <TeacherForm /> },
          { path: ":id", element: <TeacherView /> },
          { path: ":id/edit", element: <TeacherForm /> },
        ],
      },
    // Add routes for other settings pages linked from dashboard
    { path: "subjects", element: <SubjectList /> },
    // { path: 'general', element: <GeneralSettingsPage /> },
    // Add other settings routes here (e.g., general settings, users)
    // --- Curriculum Section ---
    { path: "classrooms", element: <ClassroomList /> }, // <-- Add this route
    // --- Exams Section ---
    {
      path: "exams", // New top-level section for exams
      element: <ExamList />,
    },
    { path: "general", element: <GeneralSettingsPage /> }, // <-- Add route

    { path: "exams/:examId/schedule", element: <ExamSchedulePage /> }, // <-- Route for schedule page

    {
      path: "curriculum",
      element: <CurriculumManager />, // Direct route to the manager page
    },
    { path: "school-grades", element: <SchoolGradeLevelManager /> }, // <-- Add this route
    { path: "users", element: <UserList /> }, // <-- Add User List Route
  ],
};
