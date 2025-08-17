// src/components/students/StudentEnrollmentInfo.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StudentAcademicYear } from '@/types/studentAcademicYear';
import { Student } from '@/types/student';
import { 
  GraduationCap, 
  School, 
  Calendar, 
  Users,
  AlertCircle 
} from 'lucide-react';

interface StudentEnrollmentInfoProps {
  enrollment: StudentAcademicYear | null;
  student: Student;
}

// Helper to display data or placeholder
const displayData = (data: string | number | null | undefined, placeholder = 'غير محدد') => {
  return data ? `${data}` : placeholder;
};

const StudentEnrollmentInfo: React.FC<StudentEnrollmentInfoProps> = ({ 
  enrollment, 
  student 
}) => {
  if (!enrollment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            معلومات التسجيل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لا يوجد تسجيل نشط للطالب في العام الدراسي الحالي
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          معلومات التسجيل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enrollment ID */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm font-medium">رقم التسجيل:</span>
          </div>
          <Badge variant="secondary" className="font-mono">
            #{enrollment.id}
          </Badge>
        </div>

        {/* School */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <School className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">المدرسة:</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {displayData(enrollment.school?.name)}
          </span>
        </div>

        {/* Grade Level */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">المرحلة الدراسية:</span>
          </div>
          <Badge variant="outline">
            {displayData(enrollment.grade_level?.name)}
          </Badge>
        </div>

        {/* Academic Year */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">العام الدراسي:</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {displayData(enrollment.academic_year?.name)}
          </span>
        </div>

        {/* Classroom */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">الفصل:</span>
          </div>
          {enrollment.classroom ? (
            <Badge variant="default">
              {enrollment.classroom.name}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              غير محدد
            </span>
          )}
        </div>

        {/* Enrollment Status */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-sm font-medium">حالة التسجيل:</span>
          </div>
          <Badge 
            variant={
              enrollment.status === 'active' ? 'default' :
              enrollment.status === 'graduated' ? 'secondary' :
              enrollment.status === 'transferred' ? 'outline' :
              'destructive'
            }
          >
            {enrollment.status === 'active' ? 'نشط' :
             enrollment.status === 'graduated' ? 'متخرج' :
             enrollment.status === 'transferred' ? 'منقول' :
             enrollment.status === 'withdrawn' ? 'منسحب' : enrollment.status}
          </Badge>
        </div>

        {/* Fees */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">الرسوم:</span>
          </div>
          <span className="text-sm font-medium text-green-600">
            {enrollment.fees ? `${enrollment.fees.toLocaleString()}` : 'غير محدد'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentEnrollmentInfo; 