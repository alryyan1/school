import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, GraduationCap, Building } from 'lucide-react';
import axiosClient from '@/axios-client';
import { Student } from '@/types/student';
import { cn } from '@/lib/utils';

const StudentEnrollmentLayout: React.FC = () => {
  const { studentId, enrollmentId } = useParams<{ studentId: string; enrollmentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/students/${studentId}`);
        setStudent(res.data.data);
      } catch {
        // noop
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchStudent();
  }, [studentId]);

  const currentEnrollment = student?.enrollments?.find((e) => e.id?.toString() === enrollmentId);

  return (
    <div className="flex flex-col w-full" dir="rtl">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-3xl mx-auto px-4 py-3">
          {loading ? (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin h-5 w-5 text-primary" />
            </div>
          ) : student ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.image_url} alt={student.student_name} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-primary">{student.student_name}</h1>
                      <Badge variant="secondary">لوحة التسجيل</Badge>
                    </div>
                    {currentEnrollment ? (
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        {currentEnrollment.grade_level && (
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4" />
                            <span>الصف: {currentEnrollment.grade_level.name}</span>
                          </div>
                        )}
                        {currentEnrollment.school && (
                          <div className="flex items-center gap-1.5">
                            <Building className="h-4 w-4" />
                            <span>المدرسة: {currentEnrollment.school.name}</span>
                          </div>
                        )}
                        {currentEnrollment.academic_year && (
                          <div className="flex items-center gap-1.5">
                            <span>العام الدراسي: {currentEnrollment.academic_year}</span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Local nav for enrollment sub-pages */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <NavLink
                    to="dashboard"
                    end
                    className={({ isActive }) => cn(
                      "px-3 py-1.5 rounded-md text-sm",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    الرئيسية
                  </NavLink>
                  <NavLink
                    to="notes"
                    className={({ isActive }) => cn(
                      "px-3 py-1.5 rounded-md text-sm",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    الملاحظات
                  </NavLink>
                  <NavLink
                    to="warnings"
                    className={({ isActive }) => cn(
                      "px-3 py-1.5 rounded-md text-sm",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    الإنذارات
                  </NavLink>
                  <NavLink
                    to="absences"
                    className={({ isActive }) => cn(
                      "px-3 py-1.5 rounded-md text-sm",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    الغياب
                  </NavLink>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentEnrollmentLayout;


