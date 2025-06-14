// src/pages/students/StudentDashboard.tsx
import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, List, BarChart3 } from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';

// You might fetch some data here later using useStudentStore
// import { useStudentStore } from '@/stores/studentStore';

const StudentDashboard: React.FC = () => {
    const { students, fetchStudents, loading } = useStudentStore();
    const totalStudents = students.length;

    useEffect(() => {
        fetchStudents()
    }, [])

    return (
        <div className="container mx-auto mt-8 mb-8 px-4" dir="rtl">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">
                    إدارة شؤون الطلاب
                </h1>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button asChild className="py-3 px-6">
                        <RouterLink to="/students/create">
                            <UserPlus className="ml-2 h-4 w-4" />
                            إضافة طالب جديد
                        </RouterLink>
                    </Button>
                    <Button variant="outline" asChild className="py-3 px-6">
                        <RouterLink to="/students/list">
                            <List className="ml-2 h-4 w-4" />
                            عرض قائمة الطلاب
                        </RouterLink>
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* Student Count Card */}
                <Card className="text-center">
                    <CardHeader className="pb-2">
                        <BarChart3 className="h-10 w-10 mx-auto text-primary mb-2" />
                        <CardTitle className="text-lg">إجمالي الطلاب</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            {loading ? (
                                <Skeleton className="h-10 w-16 mx-auto" />
                            ) : (
                                totalStudents
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for future stats cards */}
                {/* You can add more cards here for additional statistics */}
            </div>
        </div>
    );
};

export default StudentDashboard;