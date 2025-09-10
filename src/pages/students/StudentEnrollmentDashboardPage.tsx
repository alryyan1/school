import React, { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, StickyNote, CreditCard, AlertTriangle, CalendarX } from 'lucide-react';
import FeeInstallmentViewerDialog from '@/components/finances/FeeInstallmentViewerDialog';

const StudentEnrollmentDashboardPage: React.FC = () => {
  const { studentId, enrollmentId } = useParams<{ studentId: string; enrollmentId: string }>();
  const navigate = useNavigate();
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4" dir="rtl">
      <div className="flex justify-end items-center mb-6">
        <Button variant="outline" asChild>
          <RouterLink to={`/students/${studentId}/enrollments`}>
            <ArrowRight className="ml-2 h-4 w-4" />عودة لسجل التسجيلات
          </RouterLink>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Notes Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/students/${studentId}/enrollments/${enrollmentId}/notes`)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <StickyNote className="h-5 w-5 text-primary" />
              ملاحظات الطالب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">إدارة وكتابة الملاحظات الخاصة بهذا التسجيل.</p>
          </CardContent>
        </Card>
        {/* Payments Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setPaymentsOpen(true)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-primary" />
              الدفعات والأقساط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">عرض وإدارة أقساط الرسوم وسجل الدفعات وطباعة كشف الحساب.</p>
          </CardContent>
        </Card>
        {/* Disciplinary Warnings Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/students/${studentId}/enrollments/${enrollmentId}/warnings`)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-primary" />
              الإنذارات السلوكية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">تسجيل وعرض إنذارات الطالب الخاصة بهذا التسجيل.</p>
          </CardContent>
        </Card>
        {/* Absences Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/students/${studentId}/enrollments/${enrollmentId}/absences`)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarX className="h-5 w-5 text-primary" />
              الغياب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">تسجيل غياب الطالب لهذا التسجيل وعرض السجل.</p>
          </CardContent>
        </Card>
      </div>
      {/* Payments Dialog (installments & payments viewer) */}
      <FeeInstallmentViewerDialog
        open={paymentsOpen}
        onClose={() => setPaymentsOpen(false)}
        studentAcademicYearId={enrollmentId ? Number(enrollmentId) : null}
      />
    </div>
  );
};

export default StudentEnrollmentDashboardPage; 