import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, BookOpen } from 'lucide-react';

interface StatisticsRowProps {
    enrollmentsCount: number;
    teachersCount: number;
    coursesCount: number;
    isLoadingEnrollments: boolean;
    isLoadingStats: boolean;
}

const StatisticsRow: React.FC<StatisticsRowProps> = ({
    enrollmentsCount,
    teachersCount,
    coursesCount,
    isLoadingEnrollments,
    isLoadingStats
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 md:mb-10">
            {/* Stat Card 1: Students */}
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">إجمالي الطلاب</p>
                        {isLoadingEnrollments ? (
                            <Skeleton className="h-7 w-16 mt-1" />
                        ) : (
                            <p className="text-2xl font-bold">{enrollmentsCount ?? '-'}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stat Card 2: Teachers */}
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">إجمالي المعلمين</p>
                        {isLoadingStats ? (
                            <Skeleton className="h-7 w-16 mt-1" />
                        ) : (
                            <p className="text-2xl font-bold">{teachersCount ?? '-'}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stat Card 3: Courses */}
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">إجمالي المقررات</p>
                        {isLoadingStats ? (
                            <Skeleton className="h-7 w-16 mt-1" />
                        ) : (
                            <p className="text-2xl font-bold">{coursesCount ?? '-'}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StatisticsRow; 