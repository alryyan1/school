import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/layout/NavbarArea.tsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu, School, CalendarDays, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/authcontext'; // Adjust path
import { useSettingsStore } from '@/stores/settingsStore'; // Adjust path
import { useSchoolStore } from '@/stores/schoolStore'; // Adjust path
import { useAcademicYearStore } from '@/stores/academicYearStore'; // Adjust path
var NavbarArea = function (_a) {
    var onMobileMenuToggle = _a.onMobileMenuToggle;
    var _b = useAuth(), userName = _b.userName, userRole = _b.userRole, logout = _b.logout;
    var navigate = useNavigate();
    var _c = useSettingsStore(), activeSchoolId = _c.activeSchoolId, activeAcademicYearId = _c.activeAcademicYearId;
    var _d = useSchoolStore(), schools = _d.schools, fetchSchools = _d.fetchSchools, schoolsLoading = _d.loading;
    var _e = useAcademicYearStore(), academicYears = _e.academicYears, fetchAcademicYears = _e.fetchAcademicYears, yearsLoading = _e.loading;
    useEffect(function () {
        if (activeSchoolId && schools.length === 0)
            fetchSchools();
    }, [activeSchoolId, schools.length, fetchSchools]);
    useEffect(function () {
        // Fetch years only if an active school is set, and filter for that school
        if (activeSchoolId && activeAcademicYearId && academicYears.length === 0) {
            fetchAcademicYears(activeSchoolId); // Assuming fetchAcademicYears can take schoolId
        }
        else if (activeSchoolId && academicYears.length === 0) {
            fetchAcademicYears(activeSchoolId); // Fetch for the active school
        }
    }, [activeSchoolId, activeAcademicYearId, academicYears.length, fetchAcademicYears]);
    var activeSchool = schools.find(function (s) { return s.id === activeSchoolId; });
    // Ensure activeYear is also filtered by the activeSchoolId
    var activeYear = academicYears.find(function (ay) { return ay.id === activeAcademicYearId && ay.school_id === activeSchoolId; });
    var handleLogout = function () {
        logout();
        navigate('/auth/login');
    };
    return (_jsxs("header", { className: "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 justify-between", dir: "rtl", children: [_jsxs(Button, { variant: "ghost", size: "icon", className: "md:hidden", onClick: onMobileMenuToggle, children: [_jsx(Menu, { className: "h-6 w-6" }), _jsx("span", { className: "sr-only", children: "Toggle Menu" })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [activeSchoolId && (_jsxs(Link, { to: "/settings/general", className: "flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors", children: [_jsx(School, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: schoolsLoading ? _jsx(Skeleton, { className: "h-4 w-20" }) : ((activeSchool === null || activeSchool === void 0 ? void 0 : activeSchool.name) || "\u0645\u062F\u0631\u0633\u0629 (".concat(activeSchoolId, ")")) })] })), activeSchoolId && activeYear && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-muted-foreground", children: "/" }), _jsxs(Link, { to: "/settings/general", className: "flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors", children: [_jsx(CalendarDays, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: yearsLoading ? _jsx(Skeleton, { className: "h-4 w-20" }) : ((activeYear === null || activeYear === void 0 ? void 0 : activeYear.name) || "\u0639\u0627\u0645 (".concat(activeAcademicYearId, ")")) })] })] }))] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", className: "rounded-full", children: [_jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: "/placeholder-user.jpg", alt: userName || "User" }), " ", _jsx(AvatarFallback, { children: userName ? userName.charAt(0).toUpperCase() : _jsx(UserCircle, {}) })] }), _jsx("span", { className: "sr-only", children: "Toggle user menu" })] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [_jsx(DropdownMenuLabel, { className: "font-normal", children: _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: userName || "المستخدم" }), _jsx("p", { className: "text-xs leading-none text-muted-foreground", children: userRole || "الدور" })] }) }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: handleLogout, className: "text-red-600 dark:text-red-500 focus:bg-red-100/80 dark:focus:bg-red-900/30 focus:text-red-700 dark:focus:text-red-400 cursor-pointer", children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C"] })] })] })] }));
};
export default NavbarArea;
