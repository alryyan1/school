import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, StickyNote, CreditCard, AlertTriangle, CalendarX, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from 'lucide-react';
import FeeInstallmentViewerDialog from '@/components/finances/FeeInstallmentViewerDialog';
import axiosClient from '@/axios-client';

interface Student {
  id: number;
  student_name: string;
  image_url?: string;
}

const StudentEnrollmentDashboardPage: React.FC = () => {
  const { studentId, enrollmentId } = useParams<{ studentId: string; enrollmentId: string }>();
  const navigate = useNavigate();
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = useState(true);

  const fetchStudent = async () => {
    setStudentLoading(true);
    try {
      const res = await axiosClient.get(`/students/${studentId}`);
      setStudent(res.data.data);
    } catch {
      console.error('فشل تحميل بيانات الطالب');
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4" dir="rtl">
      {/* Student Information Header */}
      {studentLoading ? (
        <div className="flex justify-center items-center mb-6">
          <Loader2 className="animate-spin h-6 w-6 text-primary" />
        </div>
      ) : student ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={student.image_url} alt={student.student_name} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-primary">{student.student_name}</h1>
                <Badge variant="secondary" className="mt-1">
                  لوحة تسجيل الطالب
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

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