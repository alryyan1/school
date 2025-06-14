var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
// shadcn/ui components
import { Card, CardContent, } from "@/components/ui/card"; // Adjust path if needed
import { cn } from "@/lib/utils"; // Utility for combining class names
// lucide-react icons
import { Users, // SchoolIcon (for Teachers) replacement
UserCheck, // Example for Enrollment
Car, // Example for Transport
Settings, // SettingsIcon replacement
 } from 'lucide-react';
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore';
import { useTeacherStore } from '@/stores/teacherStore';
// Animation Variants (same as before)
var containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
var itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};
var Dashboard = function () {
    var _a = useState(true), isLoadingStats = _a[0], setIsLoadingStats = _a[1];
    var _b = useStudentEnrollmentStore(), enrollments = _b.enrollments, fetchAllEnrollments = _b.fetchAllEnrollments, loading = _b.loading;
    var _c = useTeacherStore(), teachers = _c.teachers, fetchTeachers = _c.fetchTeachers;
    // --- Fetch Dashboard Stats ---
    useEffect(function () {
        var fetchStats = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    fetchAllEnrollments();
                    fetchTeachers();
                }
                catch (error) {
                    console.error('Error fetching dashboard stats:', error);
                }
                finally {
                    setIsLoadingStats(false);
                }
                return [2 /*return*/];
            });
        }); };
        fetchStats();
    }, []); // Run once on mount
    // --- Define Dashboard Navigation Items ---
    // Use Tailwind color classes now
    var dashboardItems = [
        {
            title: 'التسجيل ( الاولي )',
            icon: Users,
            link: '/students/list',
            description: 'إدارة سجلات الطلاب الاساسيه.',
            iconColor: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100/80 dark:bg-blue-900/30",
        },
        {
            title: 'تعيين الطلاب', // Enrollment
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
    return (_jsx("section", { className: "min-h-[calc(100vh-64px)] w-full py-1 px-4 md:py-8 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800", dir: "rtl", children: _jsxs("div", { className: "container max-w-screen-xl mx-auto", children: [" ", _jsx(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6" // Adjusted grid columns and gaps
                    , children: dashboardItems.map(function (item) {
                        var IconComponent = item.icon;
                        return (_jsx(motion.div, { variants: itemVariants, className: "h-full", children: _jsx(RouterLink, { to: item.link, className: "h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg", children: _jsx(motion.div, { whileHover: { y: -4 }, whileTap: { scale: 0.98 }, className: "h-full", transition: { type: 'spring', stiffness: 300, damping: 20 }, children: _jsx(Card, { className: "h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-primary/10", children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center text-center p-5 sm:p-6 flex-grow", children: [_jsx("div", { className: cn("mb-4 flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14", // Adjusted size
                                                    item.bgColor || "bg-gray-100 dark:bg-gray-800"), children: _jsx(IconComponent, { className: cn("h-6 w-6 sm:h-7 sm:w-7", // Adjusted size
                                                        item.iconColor || "text-gray-600 dark:text-gray-400"), strokeWidth: 1.75 }) }), _jsx("h3", { className: "mb-1 text-base sm:text-lg font-semibold text-card-foreground", children: item.title }), _jsx("p", { className: "text-xs sm:text-sm text-muted-foreground", children: item.description })] }) }) }) }) }, item.link));
                    }) })] }) }));
};
export default Dashboard;
