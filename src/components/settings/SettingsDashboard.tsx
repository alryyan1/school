// src/pages/settings/SettingsDashboard.tsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
// Import shadcn/ui components
import { cn } from "@/lib/utils"; // For combining class names

// Import lucide-react icons
import {
    Building2, // Alternative for School
    CalendarDays,
    Milestone, // Alternative for Stairs/Grade Levels
    Library, // Alternative for Book/Subjects
    Settings,
    Users,
    MonitorPlay, // Alternative for BookOnline/Exams
    Network, // Alternative for Stairs/Grade Levels
    ListOrdered, // Example for Curriculum
    School
} from 'lucide-react';

// Define the structure for each settings card item
interface SettingsItem {
    title: string;
    description: string;
    link: string;
    icon: React.ElementType; // Use React.ElementType for icon components
    iconColor?: string; // Optional: Tailwind text color class (e.g., "text-primary")
    bgColor?: string; // Optional: Tailwind background class (e.g., "bg-primary/10")
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

const SettingsDashboard: React.FC = () => {

    // Define your settings sections using lucide icons and Tailwind colors
    const settingsItems: SettingsItem[] = [
        {
            title: 'إدارة المدارس',
            description: 'إضافة وتعديل بيانات المدارس المسجلة.',
            link: '/schools/list', // Keep link direct if School List is outside settings route
            icon: Building2,
            iconColor: "text-sky-600",
            bgColor: "bg-sky-100/80 dark:bg-sky-900/30",
        },
        {
            title: 'الأعوام الدراسية',
            description: 'إدارة الأعوام الدراسية وتحديد العام الحالي.',
            link: 'academic-years', // Relative link within /settings
            icon: CalendarDays,
            iconColor: "text-red-600",
            bgColor: "bg-red-100/80 dark:bg-red-900/30",
        },
        {
            title: 'المراحل الدراسية',
            description: 'إدارة المراحل والصفوف الدراسية.',
            link: 'grade-levels', // Relative link within /settings
            icon: Milestone,
            iconColor: "text-green-600",
            bgColor: "bg-green-100/80 dark:bg-green-900/30",
        },
        {
            title: 'المواد التعليميه',
            description: 'إدارة المواد ورموزها.',
            link: 'subjects', // Relative link within /settings
            icon: Library,
            iconColor: "text-purple-600",
            bgColor: "bg-purple-100/80 dark:bg-purple-900/30",
        },
        {
            title: 'المناهج الدراسية',
            description: 'تعيين المواد والمعلمين لكل مرحلة وعام.',
            link: 'curriculum', // Link to the separate curriculum manager page
            icon: ListOrdered, // Or another appropriate icon
            iconColor: "text-orange-600",
            bgColor: "bg-orange-100/80 dark:bg-orange-900/30",
        },
        {
            title: 'الفصول الدراسية',
            description: 'إدارة الفصول والقاعات الدراسيه.',
            link: 'classrooms', // Relative link within /settings
            icon: Network, // Using Network as alternative for linked rooms/groups
            iconColor: "text-teal-600",
            bgColor: "bg-teal-100/80 dark:bg-teal-900/30",
        },
        {
            title: 'دورات الامتحانات',
            description: 'إدارة دورات الامتحانات ومواعيدها.',
            link: 'exams', // Link to separate exams page
            icon: MonitorPlay,
            iconColor: "text-indigo-600",
            bgColor: "bg-indigo-100/80 dark:bg-indigo-900/30",
        },
        {
            title: 'مراحل المدرسة', // Renamed for clarity (School Grade Level Assignment)
            description: 'تعيين المراحل الدراسية المتاحة لكل مدرسة.',
            link: 'school-grades', // Relative link within /settings
            icon:MonitorPlay, // Using Lucide School icon
            iconColor: "text-amber-600",
            bgColor: "bg-amber-100/80 dark:bg-amber-900/30",
        },
        {
            title: 'إدارة المستخدمين',
            description: 'إدارة حسابات المستخدمين والصلاحيات.',
            link: 'users', // Relative link within /settings
            icon: Users,
            iconColor: "text-rose-600",
            bgColor: "bg-rose-100/80 dark:bg-rose-900/30",
        },
         {
             title: 'الإعدادات العامة',
             description: 'تكوين الإعدادات العامة الأخرى للنظام.',
             link: 'general', // Example relative link
             icon: Settings,
             iconColor: "text-slate-600",
             bgColor: "bg-slate-100/80 dark:bg-slate-900/30",
         },
    ];


    return (
        // Main container with background and padding - using Tailwind
        <section className="min-h-[calc(100vh-64px)] w-full py-6 px-4 md:py-8 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" dir="rtl">
            <div className="container max-w-screen-lg mx-auto">
                {/* Animated Title */}
                <motion.div
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-primary dark:text-sky-400">
                        الإعدادات العامة للنظام
                    </h1>
                </motion.div>

                {/* Animated Grid for Settings Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8" // Responsive grid layout
                >
                    {settingsItems.map((item) => {
                        const IconComponent = item.icon; // Get the icon component type
                        return (
                            <motion.div
                                key={item.link}
                                variants={itemVariants}
                                className="h-full" // Ensure motion div fills grid item height
                            >
                                <RouterLink to={item.link} className="h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
                                    <motion.div
                                        whileHover={{ y: -4, scale: 1.02 }} // Lift effect on hover
                                        whileTap={{ scale: 0.98 }}
                                        className="h-full"
                                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                    >
                                        <Card className="h-full flex flex-col transition-shadow hover:shadow-lg dark:hover:shadow-primary/20">
                                             {/* Using CardContent for structure */}
                                             <CardContent className="flex flex-col items-center justify-center text-center p-6 flex-grow">
                                                 {/* Icon Container */}
                                                 <div className={cn(
                                                     "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
                                                     item.bgColor || "bg-gray-100 dark:bg-gray-800" // Default background
                                                 )}>
                                                     <IconComponent className={cn(
                                                         "h-7 w-7",
                                                         item.iconColor || "text-gray-600 dark:text-gray-400" // Default icon color
                                                     )} strokeWidth={1.75} />
                                                 </div>
                                                 {/* Title */}
                                                 <h3 className="mb-1 text-lg font-semibold text-card-foreground">
                                                      {item.title}
                                                 </h3>
                                                 {/* Description */}
                                                 <p className="text-sm text-muted-foreground">
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