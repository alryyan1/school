// src/pages/students/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// lucide-react icons
import {
    Users, UserPlus, ListChecks, UserCog, Contact, Banknote, Briefcase, Users2, ArrowRightLeft,
    ClipboardList, LayoutGrid,
    UserCheck
} from 'lucide-react';

// Import API client if you uncomment the stats fetching
import axiosClient from '@/axios-client'; // Adjust path
import { useStudentStore } from '@/stores/studentStore'; // To get total student count if not from dashboard stats

interface DashboardStats {
    studentCount?: number;
    activeStudents?: number; // Example new stat
    newEnrollmentsThisMonth?: number; // Example new stat
    // Add other stats as needed
}

interface QuickLinkItem {
    title: string;
    description: string;
    link: string;
    icon: React.ElementType;
    iconColor?: string;
    bgColor?: string;
}

// Animation Variants
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 }}};
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 }}};
const statItemVariants = { hidden: { scale: 0.5, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 150, damping: 10 }}};


const StudentDashboard: React.FC = () => {
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({});

    // Use studentStore for total count as a fallback or primary source
    const { students: allStudents, fetchStudents } = useStudentStore();

    useEffect(() => {
        // Fetch all students if needed for the total count,
        // or rely on a dedicated stats endpoint
        if (allStudents.length === 0) {
            fetchStudents(); // This fetches all students, might be heavy
        }

        const fetchDashboardStats = async () => {
            setIsLoadingStats(true);
            try {
                // --- UNCOMMENT AND USE YOUR ACTUAL API ENDPOINT FOR DETAILED STATS ---
                // const response = await axiosClient.get('/dashboard-stats');
                // setStats(response.data);
                // --- --- --- --- --- --- --- --- --- --- --- --- ---

                // --- Mock Data (REMOVE WHEN API IS READY) ---
                await new Promise(resolve => setTimeout(resolve, 700));
                // Use count from studentStore if available, else mock
                setStats({
                    studentCount: allStudents.length > 0 ? allStudents.length : 125, // Example
                    activeStudents: 110, // Mock
                    newEnrollmentsThisMonth: 15 // Mock
                });
                // --- --- --- --- --- --- --- --- --- --- --- ---
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setStats({ studentCount: allStudents.length > 0 ? allStudents.length : 0 });
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchDashboardStats();
    }, [allStudents.length, fetchStudents]); // Re-fetch if allStudents count changes

    const quickLinks: QuickLinkItem[] = [
        {
            title: 'قائمة الطلاب الكاملة',
            description: 'عرض وتعديل جميع الطلاب المسجلين.',
            link: '/students/list',
            icon: ListChecks,
            iconColor: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100/70 dark:bg-blue-900/30",
        },
        {
            title: 'إضافة طالب جديد',
            description: 'تسجيل طالب جديد في النظام.',
            link: '/students/create',
            icon: UserPlus,
            iconColor: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-100/70 dark:bg-green-900/30",
        },
        {
            title: 'تسجيل الطلاب السنوي',
            description: 'إدارة تسجيل الطلاب في الأعوام والمراحل الدراسية.',
            link: '/enrollments',
            icon: UserCheck,
            iconColor: "text-sky-600 dark:text-sky-400",
            bgColor: "bg-sky-100/70 dark:bg-sky-900/30",
        },
        {
            title: 'توزيع الطلاب على الفصول',
            description: 'تعيين الطلاب غير الموزعين إلى فصول دراسية.',
            link: '/settings/grade-levels', // This is your GradeLevelStudentAssigner
            icon: ArrowRightLeft,
            iconColor: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100/70 dark:bg-purple-900/30",
        },
        {
            title: 'إدارة دفعات الطلاب',
            description: 'متابعة الأقساط والدفعات المالية للطلاب.',
            link: '/finances/due-installments', // Or link to a page to select a student first
            icon: Banknote,
            iconColor: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-100/70 dark:bg-amber-900/30",
        },
        // Add more relevant links
    ];

    const StatCard: React.FC<{ title: string; value?: number | string; icon: React.ElementType; isLoading: boolean; iconColor?: string; bgColor?: string }> =
    ({ title, value, icon: Icon, isLoading, iconColor="text-primary", bgColor="bg-primary/10" }) => (
        <Card>
            <CardContent className="flex items-center justify-between p-4 sm:p-5">
                <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5">{title}</p>
                    {isLoading ? <Skeleton className="h-7 w-16 mt-1" /> :
                        <p className="text-xl sm:text-2xl font-bold text-foreground">{value ?? '-'}</p>
                    }
                </div>
                <div className={cn("p-2.5 sm:p-3 rounded-full", bgColor)}>
                    <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)} />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-[calc(100vh-112px)] w-full py-6 px-4 md:py-8 bg-slate-50 dark:bg-slate-900" dir="rtl">
            <div className="container max-w-screen-xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-primary dark:text-sky-400">
                        لوحة تحكم شؤون الطلاب
                    </h1>
                </motion.div>

                {/* Statistics Section */}
                <motion.div
                    variants={containerVariants} initial="hidden" animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8"
                >
                    <motion.div variants={statItemVariants}>
                         <StatCard title="إجمالي الطلاب المسجلين" value={stats.studentCount} icon={Users2} isLoading={isLoadingStats} iconColor="text-blue-600" bgColor="bg-blue-100 dark:bg-blue-900/30" />
                    </motion.div>
              
                     <motion.div variants={statItemVariants}>
                         <StatCard title="تسجيلات جديدة (آخر شهر)" value={stats.newEnrollmentsThisMonth} icon={UserPlus} isLoading={isLoadingStats} iconColor="text-sky-600" bgColor="bg-sky-100 dark:bg-sky-900/30" />
                    </motion.div>
                    {/* Add more StatCards here */}
                </motion.div>

                <Separator className="my-6 md:my-8" />

                {/* Quick Links/Management Cards Section */}
                <motion.h2
                    initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-xl md:text-2xl font-semibold text-foreground mb-4 md:mb-6"
                >
                    إدارة ووصول سريع
                </motion.h2>
                <motion.div
                    variants={containerVariants} initial="hidden" animate="visible"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6"
                >
                    {quickLinks.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <motion.div key={item.link} variants={itemVariants} className="h-full">
                                <RouterLink to={item.link} className="h-full block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
                                    <motion.div
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="h-full"
                                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                    >
                                        <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-out group-hover:shadow-lg dark:group-hover:shadow-primary/20 border-border/70 group-hover:border-primary/40">
                                             <CardContent className="flex flex-col items-center justify-center text-center p-5 sm:p-6 flex-grow">
                                                 <div className={cn("mb-3 flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14 transform transition-transform duration-300 group-hover:scale-110", item.bgColor || "bg-muted")}>
                                                     <IconComponent className={cn("h-6 w-6 sm:h-7 sm:w-7 transition-colors duration-300", item.iconColor || "text-muted-foreground", "group-hover:text-white")} strokeWidth={1.75} />
                                                 </div>
                                                 <h3 className="mb-1 text-base sm:text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                                      {item.title}
                                                 </h3>
                                                 <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
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
        </div>
    );
};

export default StudentDashboard;