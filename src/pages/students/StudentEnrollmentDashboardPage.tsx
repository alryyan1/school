import React from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, StickyNote } from 'lucide-react';

const StudentEnrollmentDashboardPage: React.FC = () => {
  const { studentId, enrollmentId } = useParams<{ studentId: string; enrollmentId: string }>();
  const navigate = useNavigate();

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <RouterLink to={`/students/${studentId}/enrollments`}>
            <ArrowRight className="ml-2 h-4 w-4" />عودة لسجل التسجيلات
          </RouterLink>
        </Button>
        <h2 className="text-2xl font-bold">لوحة تسجيل الطالب</h2>
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
        {/* Add more cards here for other features if needed */}
      </div>
    </div>
  );
};

export default StudentEnrollmentDashboardPage; 