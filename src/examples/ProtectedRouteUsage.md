# ProtectedRoute Component Usage

The `ProtectedRoute` component provides authentication and authorization protection for your React routes.

## Basic Usage

### Import the component
```tsx
import { ProtectedRoute, AuthRoute } from '@/components/ProtectedRoute';
```

### Protect any authenticated route
```tsx
// Allow any authenticated user
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### Protect routes with specific roles
```tsx
// Allow only admin users
<ProtectedRoute roles={['admin']}>
  <AdminPanel />
</ProtectedRoute>

// Allow admin and teacher users
<ProtectedRoute roles={['admin', 'teacher']}>
  <TeacherDashboard />
</ProtectedRoute>

// Allow multiple roles
<ProtectedRoute roles={['admin', 'teacher', 'student']}>
  <SharedResource />
</ProtectedRoute>
```

### Protect authentication routes
```tsx
// Redirect authenticated users away from login/register
<AuthRoute>
  <Login />
</AuthRoute>

<AuthRoute>
  <Register />
</AuthRoute>
```

## Router Configuration Example

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute, AuthRoute } from '@/components/ProtectedRoute';

const router = createBrowserRouter([
  // Protected main application
  {
    path: "/",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      
      // Teacher-only routes
      {
        path: "teachers",
        element: (
          <ProtectedRoute roles={["admin", "teacher"]}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: "list", element: <TeacherList /> },
          { path: "create", element: <TeacherForm /> },
        ],
      },
      
      // Admin-only routes
      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: "users", element: <UserManagement /> },
          { path: "settings", element: <SystemSettings /> },
        ],
      },
    ],
  },
  
  // Authentication routes
  {
    path: "/auth",
    element: <AuthLayout />,
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
]);
```

## Features

- **Authentication Check**: Redirects unauthenticated users to `/auth/login`
- **Authorization Check**: Redirects unauthorized users to `/unauthorized`
- **Loading State**: Shows loading screen while checking authentication
- **Redirect State**: Preserves the original URL for post-login redirect
- **Role-based Access**: Supports multiple roles per route
- **TypeScript Support**: Fully typed with proper interfaces

## Props

### ProtectedRoute Props
- `children`: React.ReactNode - The component(s) to render if authorized
- `roles?`: string[] - Array of roles allowed to access the route (optional)

### AuthRoute Props
- `children`: React.ReactNode - The authentication component to render

## Dependencies

- `@/context/authcontext` - Authentication context
- `@/components/LoadingScreen` - Loading component
- `react-router-dom` - Navigation and routing 