// src/utils/errors.ts

export interface CustomError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

export class AppError extends Error implements CustomError {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'خطأ في الاتصال بالخادم', details?: any) {
    super(message, 'NETWORK_ERROR', 0, details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'بيانات غير صحيحة', details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'خطأ في المصادقة', details?: any) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'غير مصرح لك بالوصول', details?: any) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'المورد غير موجود', details?: any) {
    super(message, 'NOT_FOUND_ERROR', 404, details);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'خطأ في الخادم', details?: any) {
    super(message, 'SERVER_ERROR', 500, details);
    this.name = 'ServerError';
  }
}

// Utility function to create error from API response
export const createErrorFromResponse = (response: any): AppError => {
  const status = response?.status || 500;
  const message = response?.data?.message || 'حدث خطأ غير متوقع';
  const details = response?.data?.errors || response?.data;

  switch (status) {
    case 400:
      return new ValidationError(message, details);
    case 401:
      return new AuthenticationError(message, details);
    case 403:
      return new AuthorizationError(message, details);
    case 404:
      return new NotFoundError(message, details);
    case 500:
      return new ServerError(message, details);
    default:
      return new AppError(message, 'API_ERROR', status, details);
  }
};

// Utility function to check if error is a specific type
export const isErrorType = (error: any, type: string): boolean => {
  return error?.name === type || error?.code === type;
};

// Utility function to get user-friendly error message
export const getErrorMessage = (error: any): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'حدث خطأ غير متوقع';
}; 