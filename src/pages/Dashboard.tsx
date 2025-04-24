// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

// shadcn/ui components
import { Card, CardContent,} from "@/components/ui/card"; // Adjust path if needed
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { cn } from "@/lib/utils"; // Utility for combining class names

// lucide-react icons
import {
    Users, // PeopleIcon replacement
    GraduationCap, // SchoolIcon (for Teachers) replacement
    Building, // BusinessIcon (for Schools) replacement
    UserCheck, // Example for Enrollment
    Car, // Example for Transport
    Settings, // SettingsIcon replacement
    BookOpen, // Example for Courses
} from 'lucide-react';
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore';
import { useTeacherStore } from '@/stores/teacherStore';

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
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};


const Dashboard: React.FC = () => {
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [stats, setStats] = useState({});
    const {enrollments,fetchAllEnrollments,loading} = useStudentEnrollmentStore()
    const {teachers,fetchTeachers} = useTeacherStore()
    // --- Fetch Dashboard Stats ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                fetchAllEnrollments()
                fetchTeachers()
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setStats({}); // Set empty on error
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchStats();
    }, []); // Run once on mount

    // --- Define Dashboard Navigation Items ---
    // Use Tailwind color classes now
    const dashboardItems: DashboardItem[] = [
        {
            title: 'التسجيل ( الاولي )',
            icon: Users,
            link: '/students/list',
            description: 'إدارة سجلات الطلاب الاساسيه.',
            iconColor: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100/80 dark:bg-blue-900/30",
        },
        {
            title: 'المعلمون',
            icon: GraduationCap,
            link: '/teachers',
            description: 'إدارة ملفات المعلمين وجداولهم.',
            iconColor: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100/80 dark:bg-purple-900/30",
        },
         {
             title: 'المدارس',
             icon: Building,
             link: '/schools/list', // Link directly to list if no separate school dashboard
             description: 'إدارة بيانات المدارس والفروع.',
             iconColor: "text-amber-600 dark:text-amber-400",
             bgColor: "bg-amber-100/80 dark:bg-amber-900/30",
         },
         {
            title: 'تسجيل الطلاب', // Enrollment
            icon: UserCheck,
            link: '/enrollments',
            description: 'تسجيل الطلاب في الأعوام والمراحل الدراسية.',
            iconColor: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-100/80 dark:bg-emerald-900/30",
        },
        {
            title: 'النقل المدرسي',
            icon: Car,
            link: '/transport/routes',
            description: 'إدارة مسارات النقل وتسجيل الطلاب.',
            iconColor: "text-cyan-600 dark:text-cyan-400",
            bgColor: "bg-cyan-100/80 dark:bg-cyan-900/30",
        },
        {
            title: 'اقساط    خلال شهر',
            icon: Car,
            link: '/finance/due-installments',
            description: 'الاقساط التي يجب ان يتم سدادها هذا الاسبوع',
            iconColor: "text-cyan-600 dark:text-cyan-400",
            bgColor: "bg-cyan-100/80 dark:bg-cyan-900/30",
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

    // --- Render ---
    return (
        <section className="min-h-[calc(100vh-64px)] w-full py-6 px-4 md:py-8 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800" dir="rtl">
            <div className="container max-w-screen-xl mx-auto"> {/* Slightly wider container */}
                {/* Animated Title */}
                <motion.div
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 text-primary dark:text-blue-400">
                        لوحة التحكم الرئيسية
                    </h1>
                </motion.div>

                 {/* Statistics Row */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 md:mb-10">
                     {/* Stat Card 1: Students */}
                     <Card>
                         <CardContent className="flex items-center gap-4 p-4">
                              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                 <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-muted-foreground">إجمالي الطلاب</p>
                                 {loading ? <Skeleton className="h-7 w-16 mt-1" /> :
                                     <p className="text-2xl font-bold">{enrollments.length ?? '-'}</p>
                                 }
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
                                   {isLoadingStats ? <Skeleton className="h-7 w-16 mt-1" /> :
                                      <p className="text-2xl font-bold">{stats.teacherCount ?? '-'}</p>
                                   }
                               </div>
                         </CardContent>
                     </Card>
                      {/* Stat Card 3: Courses (Example) */}
                      <Card>
                         <CardContent className="flex items-center gap-4 p-4">
                               <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                   <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                               </div>
                               <div>
                                   <p className="text-sm font-medium text-muted-foreground">إجمالي المقررات</p>
                                    {isLoadingStats ? <Skeleton className="h-7 w-16 mt-1" /> :
                                       <p className="text-2xl font-bold">{stats.courseCount ?? '-'}</p>
                                    }
                               </div>
                         </CardContent>
                      </Card>
                 </div>
               
                     
                 
                 



                {/* Animated Grid for Navigation Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6" // Adjusted grid columns and gaps
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
                                        whileHover={{ y: -4 }} // Simpler lift effect
                                        whileTap={{ scale: 0.98 }}
                                        className="h-full"
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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