# Error Handling System

This document describes the error handling system implemented in the school management application.

## Overview

The error handling system consists of several components that work together to provide a comprehensive error handling experience:

1. **ErrorPage** - A reusable error page component
2. **ErrorBoundary** - A React error boundary for catching JavaScript errors
3. **Custom Error Classes** - Utility classes for different types of errors
4. **useAsyncError Hook** - For handling async errors in functional components

## Components

### ErrorPage

The main error page component that displays user-friendly error messages based on the error type.

**Features:**
- Handles different HTTP status codes (404, 401, 403, 500, etc.)
- Network error detection
- Development mode error details
- Action buttons for recovery
- RTL support for Arabic

**Usage:**
```tsx
import ErrorPage from '@/pages/ErrorPage';

// In router
{
  path: '/some-route',
  element: <SomeComponent />,
  errorElement: <ErrorPage />
}

// With custom error
<ErrorPage 
  error={customError} 
  resetError={() => setError(null)} 
/>
```

### ErrorBoundary

A React error boundary component that catches JavaScript errors in component trees.

**Features:**
- Catches JavaScript errors in child components
- Provides fallback UI
- Error logging capability
- Reset functionality

**Usage:**
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorComponent />}>
  <YourComponent />
</ErrorBoundary>
```

## Custom Error Classes

Located in `src/utils/errors.ts`, these classes provide structured error handling:

- `AppError` - Base error class
- `NetworkError` - For network/connection issues
- `ValidationError` - For form validation errors
- `AuthenticationError` - For authentication issues
- `AuthorizationError` - For permission issues
- `NotFoundError` - For 404 errors
- `ServerError` - For server-side errors

**Usage:**
```tsx
import { ValidationError, createErrorFromResponse } from '@/utils/errors';

// Create custom error
throw new ValidationError('بيانات غير صحيحة', { field: 'email' });

// Create from API response
try {
  const response = await apiCall();
} catch (error) {
  const appError = createErrorFromResponse(error.response);
  throw appError;
}
```

## Hooks

### useAsyncError

A custom hook for handling async errors in functional components.

**Usage:**
```tsx
import { useAsyncError } from '@/hooks/useAsyncError';

const MyComponent = () => {
  const throwError = useAsyncError();

  const handleAsyncOperation = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      throwError(error);
    }
  };

  return <div>...</div>;
};
```

## Router Integration

The error handling is integrated into the router configuration:

```tsx
const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />, // Global error handler
    children: [
      // ... routes
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <ErrorPage />, // Auth-specific error handler
    children: [
      // ... auth routes
    ]
  }
]);
```

## Error Types Handled

### HTTP Status Codes
- **404** - Page not found
- **401** - Unauthorized access
- **403** - Forbidden access
- **500** - Server error
- **Other** - Generic error handling

### JavaScript Errors
- **TypeError** - Network/API errors
- **ReferenceError** - Undefined variables
- **SyntaxError** - Code syntax issues
- **General** - Any other JavaScript errors

### Network Errors
- Connection failures
- Timeout errors
- CORS issues

## Best Practices

1. **Use Error Boundaries** - Wrap critical components with ErrorBoundary
2. **Custom Error Classes** - Use appropriate error classes for different scenarios
3. **User-Friendly Messages** - Always provide clear, actionable error messages
4. **Development Details** - Show technical details only in development mode
5. **Recovery Actions** - Provide clear actions for users to recover from errors

## Example Implementation

```tsx
import React from 'react';
import { useAsyncError } from '@/hooks/useAsyncError';
import { ValidationError } from '@/utils/errors';
import ErrorBoundary from '@/components/ErrorBoundary';

const MyComponent = () => {
  const throwError = useAsyncError();

  const handleSubmit = async (data) => {
    try {
      if (!data.email) {
        throw new ValidationError('البريد الإلكتروني مطلوب');
      }
      
      await submitData(data);
    } catch (error) {
      throwError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form content */}
    </form>
  );
};

// Wrap with error boundary
const WrappedComponent = () => (
  <ErrorBoundary>
    <MyComponent />
  </ErrorBoundary>
);
```

## Configuration

The error handling system can be configured through:

1. **Environment Variables** - Control development vs production behavior
2. **Error Reporting** - Integrate with external error reporting services
3. **Custom Messages** - Override default error messages
4. **Styling** - Customize error page appearance

## Troubleshooting

### Common Issues

1. **Error Boundary Not Catching Errors**
   - Ensure ErrorBoundary is a class component
   - Check that errors are thrown, not just logged

2. **Async Errors Not Caught**
   - Use useAsyncError hook for async operations
   - Ensure errors are properly thrown

3. **Router Errors Not Displayed**
   - Verify errorElement is set in router configuration
   - Check that ErrorPage component is properly imported

### Debug Mode

In development mode, the ErrorPage will display:
- Full error details
- Stack traces
- Error object structure

This helps with debugging but should be disabled in production. 