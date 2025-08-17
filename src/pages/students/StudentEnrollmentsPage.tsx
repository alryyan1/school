import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight } from 'lucide-react';
// import { Student } from '@/types/student';
import { StudentAcademicYear, EnrollmentType } from '@/types/studentAcademicYear';
import { useStudentStore } from '@/stores/studentStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSnackbar } from 'notistack';
import { useAuth } from '@/context/authcontext';
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore';

const statusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'نشط';
    case 'graduated': return 'متخرج';
    case 'transferred': return 'منقول';
    case 'withdrawn': return 'منسحب';
    default: return status;
  }
};

const statusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'graduated': return 'secondary';
    case 'transferred': return 'outline';
    case 'withdrawn': return 'destructive';
    default: return 'outline';
  }
};

const StudentEnrollmentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStudentById, currentStudent, loading, error } = useStudentStore();
  const [fetched, setFetched] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { permissions } = useAuth();
  const canSetEnrollmentType = (permissions || []).includes('set student enrollment type');
  const { updateEnrollment } = useStudentEnrollmentStore();

  useEffect(() => {
    if (id && !fetched) {
      getStudentById(Number(id));
      setFetched(true);
    }
  }, [id, getStudentById, fetched]);

  if (loading || !fetched) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!currentStudent) {
    return (
      <Alert>
        <AlertDescription>لم يتم العثور على بيانات الطالب.</AlertDescription>
      </Alert>
    );
  }

  const enrollments: StudentAcademicYear[] = currentStudent.enrollments ?? [];

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4" dir="rtl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">سجل تسجيلات الطالب</CardTitle>
            <Button variant="outline" asChild>
              <RouterLink to={`/students/${currentStudent.id}`}>
                <ArrowRight className="ml-2 h-4 w-4" />عودة لملف الطالب
              </RouterLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 border">رقم التسجيل</th>
                  <th className="p-2 border">المدرسة</th>
                  <th className="p-2 border">المرحلة</th>
                  <th className="p-2 border">العام الدراسي</th>
                  <th className="p-2 border">الفصل</th>
                  <th className="p-2 border">الحالة</th>
                  <th className="p-2 border">نوع التسجيل</th>
                  <th className="p-2 border">الرسوم</th>
                  <th className="p-2 border">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4 text-muted-foreground">لا توجد تسجيلات لهذا الطالب.</td>
                  </tr>
                ) : (
                  enrollments.map((enrollment) => (
                    <tr
                      key={enrollment.id}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => navigate(`/students/${currentStudent.id}/enrollments/${enrollment.id}/dashboard`)}
                    >
                      <td className="p-2 border font-mono">#{enrollment.id}</td>
                      <td className="p-2 border">{enrollment.school?.name ?? 'غير محدد'}</td>
                      <td className="p-2 border">{enrollment.grade_level?.name ?? 'غير محدد'}</td>
                      <td className="p-2 border">{enrollment.academic_year?.name ?? 'غير محدد'}</td>
                      <td className="p-2 border">{enrollment.classroom?.name ?? <span className="italic text-muted-foreground">غير محدد</span>}</td>
                      <td className="p-2 border">
                        <Badge variant={statusVariant(enrollment.status)}>{statusLabel(enrollment.status)}</Badge>
                      </td>
                      <td className="p-2 border" onClick={(e) => e.stopPropagation()}>
                        {canSetEnrollmentType ? (
                          <Select
                            value={(enrollment.enrollment_type || 'regular') as EnrollmentType}
                            onValueChange={async (val) => {
                              try {
                                await updateEnrollment(Number(enrollment.id), { enrollment_type: val as EnrollmentType });
                                if (id) {
                                  await getStudentById(Number(id));
                                }
                                enqueueSnackbar('تم تحديث نوع التسجيل', { variant: 'success' });
                              } catch {
                                enqueueSnackbar('فشل تحديث نوع التسجيل', { variant: 'error' });
                              }
                            }}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="اختر النوع..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">عادي</SelectItem>
                              <SelectItem value="scholarship">منحة</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span>{(enrollment.enrollment_type || 'regular') === 'scholarship' ? 'منحة' : 'عادي'}</span>
                        )}
                      </td>
                      <td className="p-2 border text-green-700 font-semibold">{enrollment.fees ? `${enrollment.fees.toLocaleString()}` : 'غير محدد'}</td>
                      <td className="p-2 border">{enrollment.created_at ? new Date(enrollment.created_at).toLocaleDateString('ar-EG') : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEnrollmentsPage; 