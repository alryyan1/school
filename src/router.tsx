// src/router.tsx
import React from 'react'; // Needed for JSX elements
import {
    createBrowserRouter,
    createHashRouter,
    Navigate,
    Outlet,
    useLocation, // Keep useLocation if ProtectedRoute is defined here
} from 'react-router-dom';

// --- Layouts ---
import MainLayout from '@/components/layouts/MainLayout';   // Adjust path
import AuthLayout from '@/components/AuthLayout';       // Adjust path

// --- Core Pages ---
import Dashboard from '@/pages/Dashboard';                // Adjust path
import Login from '@/pages/Login';                      // Adjust path
import NotFound from '@/pages/NotFound';                  // Adjust path
import Unauthorized from '@/pages/Unauthorized';            // Adjust path
import ErrorPage from '@/pages/ErrorPage';                  // Adjust path

// --- Student Pages & Components ---
import StudentList from '@/pages/students/StudentList';                   // Adjust path
import StudentDashboard from '@/pages/students/StudentDashboard';         // Adjust path
import StudentView from '@/pages/students/StudentView';                   // Adjust path
import StudentEnrollmentsPage from '@/pages/students/StudentEnrollmentsPage';
import StudentEnrollmentDashboardPage from '@/pages/students/StudentEnrollmentDashboardPage';
import StudentEnrollmentNotesPage from '@/pages/students/StudentEnrollmentNotesPage';
import StudentWarningsPage from '@/pages/students/StudentWarningsPage';
import StudentAbsencesPage from '@/pages/students/StudentAbsencesPage';

// --- Teacher Pages & Components ---
import TeacherList from '@/pages/teachers/TeacherList';                 // Adjust path
import TeacherView from '@/pages/teachers/TeacherView';                   // Adjust path
import TeacherForm from '@/components/teachers/TeacherForm';               // Adjust path

// --- School Pages & Components ---
import SchoolList from '@/pages/schools/SchoolList';                   // Adjust path
import SchoolView from '@/pages/schools/SchoolView';                     // Adjust path
import SchoolForm from '@/components/schools/SchoolForm';                 // Adjust path

// --- Settings Pages ---
import SettingsDashboard from '@/pages/settings/SettingsDashboard';       // Adjust path
import ClassroomStudentAssigner from '@/components/settings/ClassroomStudentAssigner';
import SubjectList from '@/pages/settings/SubjectList';                 // Adjust path
import ClassroomList from '@/pages/settings/ClassroomList';               // Adjust path
import SchoolGradeLevelManager from '@/pages/settings/SchoolGradeLevelManager';// Adjust path
import UserList from '@/pages/settings/UserList';                       // Adjust path

// --- Finance Pages ---
import DueInstallmentsPage from '@/pages/finances/DueInstallmentsPage';   // Adjust path

// --- Exam Pages ---
import ExamList from '@/pages/exams/ExamList';                         // Adjust path
import ExamSchedulePage from '@/pages/exams/ExamSchedulePage';           // Adjust path


// --- Curriculum Pages ---
import CurriculumManager from '@/pages/curriculum/CurriculumManager';     // Adjust path

// --- Enrollment Pages ---
import StudentEnrollmentManager from '@/pages/enrollments/StudentEnrollmentManager'; // Adjust path

// --- Explorer Pages ---
import SchoolExplorerPage from '@/pages/explorer/SchoolExplorerPage';         // Adjust path
import SchoolClassroomListPage from '@/pages/explorer/SchoolClassroomListPage'; // Adjust path
import ClassroomStudentListPage from '@/pages/explorer/ClassroomStudentListPage'; // Adjust path


// --- Common Components ---
import LoadingScreen from '@/components/LoadingScreen';     // Adjust path

// --- Context ---
import { useAuth } from '@/context/authcontext';          // Adjust path
import Register from '@/pages/Register';
import { StudentForm } from './components/students/studentForm/StudentForm';
import ExamResultsEntryPage from './pages/exams/ExamResultsEntryPage';
import StudentExamResultsPage from './pages/students/StudentExamResultsPage';
import GradeLevelList from './pages/settings/GradeLevelList';
import RolePermissionManager from './pages/settings/RolePermissionManager';
import { Grade } from '@mui/icons-material';
import GradeLevelClassroomListPage from './pages/pages/GradeLevelClassroomListPage';

// --- ProtectedRoute and AuthRoute (Define them here or import if they are in separate files) ---
// It's often cleaner to keep these alongside the router if they are tightly coupled.

const ProtectedRoute = ({ children, roles = [] }: { children: React.ReactNode, roles?: string[] }) => {
    const { isAuthenticated, isLoading, userRole } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingScreen />;
    }
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
    const currentUserRole = userRole as string;
    if (roles.length > 0 && !roles.includes(currentUserRole)) {
        return <Navigate to="/unauthorized" replace />;
    }
    return <>{children}</>; // Use React.Fragment shorthand
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <LoadingScreen />;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return <>{children}</>; // Use React.Fragment shorthand
};

// Wrapper component to properly call useAuth hook
const MainLayoutWrapper = () => {
    return <MainLayout />;
};

// --- End ProtectedRoute and AuthRoute ---


const router = createHashRouter([
    // --- Main Application Layout & Routes ---
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayoutWrapper />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', element: <Dashboard /> },

            // --- Student Section ---
            {
                path: 'students',
                element: <Outlet />,
                children: [
                    { index: true, element: <StudentDashboard /> },
                    { path: 'list', element: <StudentList /> },
                    { path: 'create', element: <StudentForm /> },
                    { path: ':id', element: <StudentView /> },
                    { path: ':id/edit', element: <StudentForm /> },
                    { path: ':id/enrollments', element: <StudentEnrollmentsPage /> },
                    { path: ':studentId/enrollments/:enrollmentId/dashboard', element: <StudentEnrollmentDashboardPage /> },
                    { path: ':studentId/enrollments/:enrollmentId/notes', element: <StudentEnrollmentNotesPage /> },
                     { path: ':studentId/enrollments/:enrollmentId/warnings', element: <StudentWarningsPage /> },
                     { path: ':studentId/enrollments/:enrollmentId/absences', element: <StudentAbsencesPage /> },
                ]
            },
            {
                path: 'students/:studentId/exam-results', // New route for specific student
                element: <StudentExamResultsPage />
            },
            // --- Teacher Section ---
            {
                path: 'teachers',
                element: <Outlet />,
                children: [
                    { index: true, element: <Navigate to="list" replace /> }, // Default to list
                    { path: 'list', element: <TeacherList /> },
                    { path: 'create', element: <TeacherForm /> },
                    { path: ':id', element: <TeacherView /> },
                    { path: ':id/edit', element: <TeacherForm /> },
                ]
            },

           
            // --- School Section ---
            {
                path: 'schools', // Base path, often the list itself
                element: <Outlet />,
                children: [
                    { index:true, element: <Navigate to="list" replace />}, // For consistency
                    { path: 'list', element: <SchoolList />},
                    { path: 'create', element: <SchoolForm />},
                    { path: ':id', element: <SchoolView />},
                    { path: ':id/edit', element: <SchoolForm />}
                ]
            },
            
            // --- Settings Section ---
            {
                path: 'settings',
                element: <Outlet />,
                children: [
                    { index: true, element: <SettingsDashboard /> },
                    { path: 'grade-levels', element: <GradeLevelList /> }, // Renamed page
                    { path: 'subjects', element: <SubjectList /> },
                    { path: 'classrooms', element: <ClassroomList /> },
                    { path: 'school-grades', element: <SchoolGradeLevelManager /> },
                    { path: 'users', element: <UserList /> },
                    { path: 'roles-permissions', element: <RolePermissionManager /> }, // <-- Add this
                    { path: 'classroom-assigner', element: <ClassroomStudentAssigner /> },

                ]
            },

            // --- Curriculum Section ---
            {
                path: 'curriculum',
                element: <CurriculumManager />,
            },

            // --- Enrollments Section ---
            {
                path: 'enrollments',
                element: <StudentEnrollmentManager />,
            },

            // --- Exams Section ---
            {
                path: 'exams',
                element: <Outlet />,
                children: [
                     { index: true, element: <ExamList /> },
                     { path: ':examId/schedule', element: <ExamSchedulePage /> },
                     { path: ':examId/results', element: <ExamResultsEntryPage /> },
                ]
            },

             // --- Finance Section ---
             {
                  path: 'finances',
                  element: <Outlet />,
                  children: [
                       { index: true, element: <Navigate to="due-installments" replace />},
                       { path: 'due-installments', element: <DueInstallmentsPage /> },
                  ]
             },

            // --- School Explorer Section ---
            {
                path: 'schools-explorer',
                element: <Outlet />,
                children: [
                     { index: true, element: <SchoolExplorerPage /> },
                     { path: ':schoolId/classrooms', element: <SchoolClassroomListPage /> },
                     //-----------------
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
                     
                ]
            },
        ],
    },

    // --- Authentication Layout & Routes ---
    {
        path: '/auth',
        element: <AuthLayout />,
        errorElement: <ErrorPage />,
        children: [
            { path: 'login', element: (<AuthRoute><Login /></AuthRoute>) },
            { path: 'register', element: (<AuthRoute><Register /></AuthRoute>) },
        ],
    },

    // --- Standalone Pages ---
    { path: '/unauthorized', element: <Unauthorized /> },
    { path: '*', element: <NotFound /> }, // Catch-all 404
]);

export default router;