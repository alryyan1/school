// src/pages/ErrorPage.tsx
import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Home, 
  ArrowLeft, 
  RefreshCw, 
  Server, 
  Wifi, 
  FileX,
  UserX,
  Shield
} from 'lucide-react';

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetError }) => {
  const routeError = useRouteError();
  const navigate = useNavigate();
  
  // Use provided error or route error
  const currentError = error || routeError;
  
  // Determine error type and get appropriate content
  const getErrorContent = () => {
    if (isRouteErrorResponse(currentError)) {
      switch (currentError.status) {
        case 404:
          return {
            icon: <FileX className="h-16 w-16 text-muted-foreground" />,
            title: 'الصفحة غير موجودة',
            description: 'عذراً، الصفحة التي تبحث عنها غير موجودة.',
            details: 'قد تكون الرابط غير صحيح أو تم نقل الصفحة.',
            actions: [
              { label: 'العودة للرئيسية', action: () => navigate('/dashboard'), icon: <Home className="h-4 w-4" /> },
              { label: 'العودة للخلف', action: () => navigate(-1), icon: <ArrowLeft className="h-4 w-4" /> }
            ]
          };
        case 401:
          return {
            icon: <UserX className="h-16 w-16 text-muted-foreground" />,
            title: 'غير مصرح لك بالوصول',
            description: 'عذراً، ليس لديك صلاحية للوصول لهذه الصفحة.',
            details: 'يرجى تسجيل الدخول أو التواصل مع المسؤول للحصول على الصلاحيات المطلوبة.',
            actions: [
              { label: 'تسجيل الدخول', action: () => navigate('/auth/login'), icon: <UserX className="h-4 w-4" /> },
              { label: 'العودة للرئيسية', action: () => navigate('/dashboard'), icon: <Home className="h-4 w-4" /> }
            ]
          };
        case 403:
          return {
            icon: <Shield className="h-16 w-16 text-muted-foreground" />,
            title: 'ممنوع الوصول',
            description: 'عذراً، ممنوع عليك الوصول لهذا المحتوى.',
            details: 'قد تحتاج إلى صلاحيات إضافية أو قد يكون المحتوى محظوراً.',
            actions: [
              { label: 'العودة للرئيسية', action: () => navigate('/dashboard'), icon: <Home className="h-4 w-4" /> },
              { label: 'العودة للخلف', action: () => navigate(-1), icon: <ArrowLeft className="h-4 w-4" /> }
            ]
          };
        case 500:
          return {
            icon: <Server className="h-16 w-16 text-muted-foreground" />,
            title: 'خطأ في الخادم',
            description: 'عذراً، حدث خطأ في الخادم.',
            details: 'يرجى المحاولة مرة أخرى لاحقاً أو التواصل مع المسؤول.',
            actions: [
              { label: 'إعادة المحاولة', action: () => window.location.reload(), icon: <RefreshCw className="h-4 w-4" /> },
              { label: 'العودة للرئيسية', action: () => navigate('/dashboard'), icon: <Home className="h-4 w-4" /> }
            ]
          };
        default:
          return {
            icon: <AlertTriangle className="h-16 w-16 text-muted-foreground" />,
            title: `خطأ ${currentError.status}`,
            description: currentError.statusText || 'حدث خطأ غير متوقع.',
            details: 'يرجى المحاولة مرة أخرى أو التواصل مع المسؤول.',
            actions: [
              { label: 'إعادة المحاولة', action: () => window.location.reload(), icon: <RefreshCw className="h-4 w-4" /> },
              { label: 'العودة للرئيسية', action: () => navigate('/dashboard'), icon: <Home className="h-4 w-4" /> }
            ]
          };
      }
    }
    
    // Handle network errors
    if (currentError instanceof TypeError && currentError.message.includes('fetch')) {
      return {
        icon: <Wifi className="h-16 w-16 text-muted-foreground" />,
        title: 'خطأ في الاتصال',
        description: 'عذراً، لا يمكن الاتصال بالخادم.',
        details: 'يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
        actions: [
          { label: 'إعادة المحاولة', action: () => window.location.reload(), icon: <RefreshCw className="h-4 w-4" /> },
          { label: 'العودة للرئيسية', action: () => navigate('/dashboard'), icon: <Home className="h-4 w-4" /> }
        ]
      };
    }
    
    // Handle general errors
    return {
      icon: <AlertTriangle className="h-16 w-16 text-muted-foreground" />,
      title: 'حدث خطأ غير متوقع',
      description: 'عذراً، حدث خطأ غير متوقع.',
      details: currentError?.message || 'يرجى المحاولة مرة أخرى أو التواصل مع المسؤول.',
      actions: [
        { label: 'إعادة المحاولة', action: () => window.location.reload(), icon: <RefreshCw className="h-4 w-4" /> },
        { label: 'العودة للرئيسية', action: () => navigate('/dashboard'), icon: <Home className="h-4 w-4" /> }
      ]
    };
  };

  const errorContent = getErrorContent();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {errorContent.icon}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {errorContent.title}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {errorContent.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorContent.details}
            </AlertDescription>
          </Alert>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && currentError && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">تفاصيل الخطأ (للطور):</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                {JSON.stringify(currentError, null, 2)}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {errorContent.actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                variant={index === 0 ? "default" : "outline"}
                className="w-full"
              >
                {action.icon}
                <span className="mr-2">{action.label}</span>
              </Button>
            ))}
          </div>

          {/* Reset Error Button (if provided) */}
          {resetError && (
            <Button
              onClick={resetError}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة تعيين الخطأ
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage; 