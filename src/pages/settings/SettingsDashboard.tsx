// src/pages/settings/SettingsDashboard.tsx
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Added useNavigate
import { motion } from 'framer-motion';

// shadcn/ui components
import { Card, CardContent } from "@/components/ui/card"; // Adjust path if needed
import { Button } from "@/components/ui/button"; // Import Button for Back
import { cn } from "@/lib/utils"; // For combining class names

// lucide-react icons
import {
    Building2,      // For Schools
    CalendarDays,   // For Academic Years
    Milestone,      // For Grade Levels
    Library,        // For Subjects
    Settings as SettingsLucideIcon, // Renamed to avoid conflict with component name
    Users,
    MonitorPlay,    // For Exams
    Network,        // For Classrooms
    ListOrdered,    // Example for Curriculum
    School,         // For School-Grade Assignments
    GraduationCap,  // For Teachers (already defined in settingsItems below)
    ArrowRight,     // For Back Button
} from 'lucide-react';

// Define the structure for each settings card item
interface SettingsItem {
    title: string;
    description: string;
    link: string;
    icon: React.ElementType; // Use React.ElementType for icon components
    iconColor?: string;      // Optional: Tailwind text color class (e.g., "text-primary")
    bgColor?: string;        // Optional: Tailwind background class (e.g., "bg-primary/10")
}

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } }, // Slightly adjusted timing
};

const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 12 } }, // Adjusted spring
};

const SettingsDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Define your settings sections here
    const settingsItems: SettingsItem[] = [
        // Keep 'إدارة المدارس' link absolute if it's a top-level route outside /settings
        {
            title: 'إدارة المدارس',
            description: 'بيانات المدارس والفروع المسجلة.',
            link: '/schools/list', // This navigates to a top-level route
            icon: Building2,
            iconColor: "text-sky-600 dark:text-sky-400",
            bgColor: "bg-sky-100/70 dark:bg-sky-900/40",
        },
        {
            title: 'الأعوام الدراسية',
            description: 'إدارة الأعوام وتحديد العام النشط.',
            link: 'academic-years', // Relative to /settings
            icon: CalendarDays,
            iconColor: "text-red-600 dark:text-red-400",
            bgColor: "bg-red-100/70 dark:bg-red-900/40",
        },
        {
            title: 'المراحل الدراسية (عام)',
            description: 'إدارة المراحل والصفوف العامة.',
            link: 'grade-levels', // Relative
            icon: Milestone,
            iconColor: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-100/70 dark:bg-green-900/40",
        },
        {
            title: 'المواد التعليمية',
            description: 'إدارة المواد الدراسية ورموزها.',
            link: 'subjects', // Relative
            icon: Library,
            iconColor: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100/70 dark:bg-purple-900/40",
        },
        {
            title: 'المناهج السنوية',
            description: 'تعيين المواد للمعلمين والمراحل.',
            link: '/curriculum', // Absolute path if curriculum is a top-level section
            icon: ListOrdered,
            iconColor: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-100/70 dark:bg-orange-900/40",
        },
        {
            title: 'الفصول الدراسية',
            description: 'إدارة الفصول والقاعات الدراسية.',
            link: 'classrooms', // Relative
            icon: Network,
            iconColor: "text-teal-600 dark:text-teal-400",
            bgColor: "bg-teal-100/70 dark:bg-teal-900/40",
        },
        {
            title: 'دورات الامتحانات',
            description: 'إدارة دورات الامتحانات ومواعيدها.',
            link: '/exams', // Absolute path if exams is a top-level section
            icon: MonitorPlay,
            iconColor: "text-indigo-600 dark:text-indigo-400",
            bgColor: "bg-indigo-100/70 dark:bg-indigo-900/40",
        },
        {
            title: 'تعيين مراحل للمدارس',
            description: 'تحديد المراحل المتاحة لكل مدرسة.',
            link: 'school-grades', // Relative
            icon: School,
            iconColor: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-100/70 dark:bg-amber-900/40",
        },
        {
            title: 'إدارة المستخدمين',
            description: 'إدارة حسابات المستخدمين والصلاحيات.',
            link: 'users', // Relative
            icon: Users,
            iconColor: "text-rose-600 dark:text-rose-400",
            bgColor: "bg-rose-100/70 dark:bg-rose-900/40",
        },
         {
             title: 'الإعدادات الافتراضية',
             description: 'تحديد المدرسة والعام النشط الافتراضي.',
             link: 'general', // Relative
             icon: SettingsLucideIcon,
             iconColor: "text-slate-600 dark:text-slate-400",
             bgColor: "bg-slate-100/70 dark:bg-slate-900/40",
         },
         // Example: Link to main Teachers list
        // {
        //     title: 'قائمة المعلمين الرئيسية',
        //     description: 'عرض وإدارة جميع المعلمين.',
        //     link: '/teachers', // This is an absolute path
        //     icon: GraduationCap,
        //     iconColor: "text-lime-600 dark:text-lime-400",
        //     bgColor: "bg-lime-100/70 dark:bg-lime-900/40",
        // },
    ];


    return (
        <section className="min-h-[calc(100vh-112px)] w-full py-6 px-4 md:py-8 md:px-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" dir="rtl">
            <div className="container max-w-screen-lg mx-auto">
                {/* Animated Title & Back Button */}
                <motion.div
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.4 }}
                     className="flex justify-between items-center mb-8 md:mb-10"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-sky-400">
                        الإعدادات العامة للنظام
                    </h1>
                    <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                        <ArrowRight className="ml-2 h-4 w-4" />
                        العودة للرئيسية
                    </Button>
                </motion.div>

                {/* Animated Grid for Settings Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6"
                >
                    {settingsItems.map((item) => {
                        const IconComponent = item.icon;
                        // Determine if the link is internal to settings or absolute
                        const linkTo = item.link.startsWith('/') ? item.link : `/settings/${item.link}`;

                        return (
                            <motion.div
                                key={item.link}
                                variants={itemVariants}
                                className="h-full"
                            >
                                <RouterLink to={linkTo} className="h-full block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
                                    <motion.div
                                        whileHover={{ y: -5, scale: 1.025 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="h-full"
                                        transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                                    >
                                        <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-out group-hover:shadow-xl dark:group-hover:shadow-primary/25 border-border/60 group-hover:border-primary/50">
                                             <CardContent className="flex flex-col items-center justify-center text-center p-6 flex-grow">
                                                 {/* Icon Container */}
                                                 <div className={cn(
                                                     "mb-4 flex h-16 w-16 items-center justify-center rounded-full transform transition-transform duration-300 group-hover:scale-110",
                                                     item.bgColor || "bg-muted"
                                                 )}>
                                                     <IconComponent className={cn(
                                                         "h-7 w-7 sm:h-8 sm:w-8 transition-colors duration-300",
                                                         item.iconColor || "text-muted-foreground",
                                                         "group-hover:text-white" // Example: Change icon color on hover if background changes
                                                     )} strokeWidth={1.5} />
                                                 </div>
                                                 {/* Title */}
                                                 <h3 className="mb-1.5 text-md sm:text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                                      {item.title}
                                                 </h3>
                                                 {/* Description */}
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
        </section>
    );
};

export default SettingsDashboard;