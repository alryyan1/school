// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

// shadcn/ui components
import { Card, CardContent,} from "@/components/ui/card"; // Adjust path if needed
import { cn } from "@/lib/utils"; // Utility for combining class names

// lucide-react icons
import {
    Users,
    GraduationCap,
    UserCheck,
    Car,
    Settings,
    Calculator,
} from 'lucide-react';
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore';
import { useTeacherStore } from '@/stores/teacherStore';
import StatisticsRow from '@/components/dashboard/StatisticsRow';
import { useAuth } from '@/context/authcontext';

// Import API client if needed for actual stats fetching
// import axiosClient from '@/axios-client';

// Dashboard Stats Type

// Define the structure for each dashboard card item
interface DashboardItem {
    title: string;
    description: string;
    link: string;
    icon: React.ElementType; // Use React.ElementType for icon components
    iconColor?: string;      // Tailwind text color class (e.g., "text-primary")
    bgColor?: string;        // Tailwind background class (e.g., "bg-primary/10")
}

// Animation Variants (same as before)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.2 } },
};


const Dashboard: React.FC = () => {
    const { userRole } = useAuth();

    // --- Define Dashboard Navigation Items ---
    // Use Tailwind color classes now
    const baseDashboardItems: DashboardItem[] = [
        {
            title: 'التسجيل',
            icon: Users,
            link: '/students/list',
            description: 'إدارة سجلات الطلاب الاساسيه.',
            iconColor: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100/80 dark:bg-blue-900/30",
        },
        {
            title: 'الإعدادات',
            icon: Settings,
            link: '/settings', // Link to the settings dashboard
            description: 'تكوين إعدادات النظام المختلفة.',
            iconColor: "text-slate-600 dark:text-slate-400",
            bgColor: "bg-slate-100/80 dark:bg-slate-900/30",
        },
        {
            title: 'المتصفح',
            icon: Settings,
            link: '/schools-explorer', // Link to the settings dashboard
            description: 'معرض المدارس و الفصول',
            iconColor: "text-slate-600 dark:text-slate-400",
            bgColor: "bg-slate-100/80 dark:bg-slate-900/30",
        },
        // Add other items like Exams, Curriculum, etc. following the same pattern
        // {
        //     title: 'الامتحانات',
        //     icon: ClipboardCheck,
        //     link: '/exams',
        //     description: 'إدارة دورات الامتحانات وجداولها.',
        //     iconColor: "text-indigo-600 dark:text-indigo-400",
        //     bgColor: "bg-indigo-100/80 dark:bg-indigo-900/30",
        // },
        // {
        //     title: 'المناهج',
        //     icon: BookOpen,
        //     link: '/curriculum',
        //     description: 'إدارة المناهج الدراسية وتعيين المواد.',
        //     iconColor: "text-pink-600 dark:text-pink-400",
        //     bgColor: "bg-pink-100/80 dark:bg-pink-900/30",
        // },
    ];

    // Conditionally add accountant card based on user role
    const accountantCard: DashboardItem = {
        title: 'المحاسبة',
        icon: Calculator,
        link: '/finances',
        description: 'لوحة المحاسب: الايرادات والمصروفات.',
        iconColor: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-100/80 dark:bg-emerald-900/30",
    };

    // Create final dashboard items array with conditional accountant card
    const dashboardItems: DashboardItem[] = userRole === 'accountant' 
        ? [accountantCard, ...baseDashboardItems]
        : baseDashboardItems;

    // --- Render ---
    return (
        <section className="min-h-[calc(100vh-64px)] w-full py-1 px-4 md:py-8 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800" dir="rtl">
            <div className="container max-w-screen-xl mx-auto"> {/* Slightly wider container */}
                {/* Animated Title */}
           

                 {/* Statistics Row */}
                 {/* <StatisticsRow
                     enrollmentsCount={enrollments.length}
                     teachersCount={teachers.length}
                     coursesCount={0} // Placeholder for courses count
                     isLoadingEnrollments={loading}
                     isLoadingStats={isLoadingStats}
                 />
                */}
                     
                 
                 



                {/* Animated Grid for Navigation Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 sm:gap-5 lg:gap-6" // Adjusted grid columns and gaps
                >
                    {dashboardItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <motion.div
                                key={item.link}
                                variants={itemVariants}
                                className="h-full"
                            >
                                <RouterLink to={item.link} className="h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="h-full"
                                        transition={{ duration: 0.15 }}
                                    >
                                        <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-primary/10">
                                             <CardContent className="flex flex-col items-center justify-center text-center p-5 sm:p-6 flex-grow">
                                                 {/* Icon Container */}
                                                 <div className={cn(
                                                     "mb-4 flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14", // Adjusted size
                                                     item.bgColor || "bg-gray-100 dark:bg-gray-800"
                                                 )}>
                                                     <IconComponent className={cn(
                                                         "h-6 w-6 sm:h-7 sm:w-7", // Adjusted size
                                                         item.iconColor || "text-gray-600 dark:text-gray-400"
                                                     )} strokeWidth={1.75} />
                                                 </div>
                                                 {/* Title */}
                                                 <h3 className="mb-1 text-base sm:text-lg font-semibold text-card-foreground">
                                                      {item.title}
                                                 </h3>
                                                 {/* Description */}
                                                 <p className="text-xs sm:text-sm text-muted-foreground">
                                                     {item.description}
                                                 </p>
                                             </CardContent>
                                         </Card>
                                    </motion.div>
                                </RouterLink>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default Dashboard;