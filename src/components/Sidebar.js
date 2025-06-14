import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/layout/Sidebar.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils"; // Your shadcn/ui utility
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator"; // For visual separation
// lucide-react icons
import { ChevronRight, ChevronLeft, LayoutDashboard, Building2, Users, GraduationCap, UserCheck, Car, Settings, CalendarDays, Milestone, Library, Network, ClipboardCheck, School // For SchoolGradeLevels (already imported)
 } from 'lucide-react';
import { MenuBook } from '@mui/icons-material';
var mainNavItems = [
    { label: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
    { label: 'إدارة المدارس', href: '/schools/list', icon: Building2 },
    { label: 'شؤون الطلاب', href: '/students', icon: Users },
    { label: 'شؤون المعلمين', href: '/settings/teachers/list', icon: GraduationCap },
    { label: 'تسجيل الطلاب', href: '/enrollments', icon: UserCheck },
    { label: 'النقل المدرسي', href: '/transport/routes', icon: Car },
    { label: 'الامتحانات', href: '/settings/exams', icon: ClipboardCheck },
    { label: 'المناهج', href: '/settings/curriculum', icon: MenuBook },
];
var settingsNavItems = [
    { label: 'الإعدادات الرئيسية', href: '/settings', icon: Settings },
    { label: 'الأعوام الدراسية', href: '/settings/academic-years', icon: CalendarDays },
    { label: 'المراحل الدراسية', href: '/settings/grade-levels', icon: Milestone },
    { label: 'المواد التعليمية', href: '/settings/subjects', icon: Library },
    { label: 'الفصول الدراسية', href: '/settings/classrooms', icon: Network },
    { label: 'مراحل المدرسة', href: '/settings/school-grades', icon: School }, // Using School icon from lucide
    { label: 'إدارة المستخدمين', href: '/settings/users', icon: Users },
];
var SidebarContent = function (_a) {
    var isCollapsed = _a.isCollapsed, onNavLinkClick = _a.onNavLinkClick, currentPathname = _a.currentPathname, onCollapseToggle = _a.onCollapseToggle, _b = _a.showCollapseButton, showCollapseButton = _b === void 0 ? false : _b;
    var _c = useState(false), openSettings = _c[0], setOpenSettings = _c[1];
    useEffect(function () {
        setOpenSettings(currentPathname.startsWith('/settings'));
    }, [currentPathname]);
    var NavLink = function (_a) {
        var item = _a.item, isCollapsed = _a.isCollapsed, _b = _a.isSubItem, isSubItem = _b === void 0 ? false : _b, onClick = _a.onClick;
        var isActive = currentPathname === item.href || (item.href !== '/' && currentPathname.startsWith(item.href) && !item.subItems);
        var Icon = item.icon;
        return (_jsx(Link, { to: item.href, className: "block", onClick: onClick, children: _jsxs(Button, { variant: isActive ? "secondary" : "ghost", className: cn("w-full flex  justify-between h-9 sm:h-10 text-sm sm:text-base", // Adjusted height and text size
                isCollapsed ? "px-2" : "px-3", isSubItem && !isCollapsed ? "pr-7" : "" // RTL: pr for indent
                ), title: item.label, children: [_jsx(Icon, { className: cn("h-4 w-4 sm:h-5 sm:w-5", isCollapsed ? "" : "ml-2") }), " ", !isCollapsed && _jsx("span", { className: "truncate", children: item.label })] }) }));
    };
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: cn("flex items-center border-b h-14 px-4", // Reduced height
                isCollapsed ? "justify-center" : "justify-between"), children: [!isCollapsed && (_jsxs(Link, { to: "/", className: "flex items-center gap-2", onClick: onNavLinkClick, children: [_jsx(GraduationCap, { className: "h-6 w-6 text-primary" }), _jsx("span", { className: "font-bold text-md text-foreground", children: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062F\u0627\u0631\u0633" })] })), showCollapseButton && onCollapseToggle && (_jsx(Button, { variant: "ghost", size: "sm", onClick: onCollapseToggle, className: cn("h-8 w-8 p-0", isCollapsed && "mx-auto" // Center when collapsed
                        ), title: isCollapsed ? "توسيع الشريط الجانبي" : "طي الشريط الجانبي", children: isCollapsed ? (_jsx(ChevronLeft, { className: "h-4 w-4" })) : (_jsx(ChevronRight, { className: "h-4 w-4" })) }))] }), _jsxs(ScrollArea, { className: "flex-1 py-3 px-2", children: [" ", _jsxs("nav", { className: "grid gap-1", children: [mainNavItems.map(function (item) { return (_jsx(NavLink, { item: item, isCollapsed: isCollapsed, onClick: onNavLinkClick }, item.href)); }), _jsx(Separator, { className: "my-2" }), _jsxs("div", { children: [_jsxs(Button, { variant: currentPathname.startsWith('/settings') && !isCollapsed && openSettings ? "secondary" : "ghost", className: cn("w-full justify-start h-9 sm:h-10 text-sm sm:text-base", isCollapsed ? "px-2" : "px-3"), onClick: function () {
                                            setOpenSettings(!openSettings);
                                        }, title: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", children: [_jsx(Settings, { className: cn("h-4 w-4 sm:h-5 sm:w-5", isCollapsed ? "" : "ml-2") }), " ", !isCollapsed && (_jsx("span", { className: "truncate flex-1 text-right", children: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" })), !isCollapsed && (openSettings ?
                                                _jsx(ChevronLeft, { className: "h-4 w-4 mr-auto transition-transform duration-200 rotate-[-90deg]" }) : // RTL: mr
                                                _jsx(ChevronRight, { className: "h-4 w-4 mr-auto transition-transform duration-200 rotate-[-90deg]" }) // RTL: mr
                                            )] }), _jsx(AnimatePresence, { children: !isCollapsed && openSettings && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.2 }, className: "overflow-hidden grid gap-1 mt-1", children: settingsNavItems.map(function (item) { return (_jsx(NavLink, { item: item, isCollapsed: isCollapsed, isSubItem: true, onClick: onNavLinkClick }, item.href)); }) })) })] })] })] })] }));
};
var Sidebar = function (_a) {
    var isDesktopCollapsed = _a.isDesktopCollapsed, setIsDesktopCollapsed = _a.setIsDesktopCollapsed;
    var location = useLocation();
    var handleCollapseToggle = function () {
        setIsDesktopCollapsed(!isDesktopCollapsed);
    };
    return (_jsx(_Fragment, { children: _jsx("aside", { className: cn("fixed top-0 right-0 z-30 h-screen bg-background border-l transition-all duration-300 ease-in-out hidden md:block", // Hidden on mobile
            isDesktopCollapsed ? "w-16" : "w-60" // Adjusted width
            ), dir: "rtl", children: _jsx(SidebarContent, { isCollapsed: isDesktopCollapsed, currentPathname: location.pathname, onCollapseToggle: handleCollapseToggle, showCollapseButton: true }) }) }));
};
export { SidebarContent }; // Export SidebarContent for use in mobile Sheet
export default Sidebar;
