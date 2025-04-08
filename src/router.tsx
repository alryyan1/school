import { Navigate, Outlet, RouteObject } from "react-router-dom";
import SchoolList from "./pages/schools/schoolList";
import SchoolForm from "./pages/schools/schoolForm";
import SchoolView from "./pages/schools/schoolView";
import AcademicYearList from "./components/settings/academicYearList";
import GradeLevelList from "./components/settings/GradeLevelList";
import SettingsDashboard from "./components/settings/SettingsDashboard";
import SubjectList from "./components/settings/SubjectList";
import CurriculumManager from "./pages/curriculum/CurriculumManager";

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
    // Add routes for other settings pages linked from dashboard
    { path: 'subjects', element: <SubjectList /> },
    // { path: 'general', element: <GeneralSettingsPage /> },
    // Add other settings routes here (e.g., general settings, users)
     // --- Curriculum Section ---
     {
      path: 'curriculum',
      element: <CurriculumManager />, // Direct route to the manager page
  },
  ],
};
