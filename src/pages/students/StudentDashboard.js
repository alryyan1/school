import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/students/StudentDashboard.tsx
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, List, BarChart3 } from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
// You might fetch some data here later using useStudentStore
// import { useStudentStore } from '@/stores/studentStore';
var StudentDashboard = function () {
    var _a = useStudentStore(), students = _a.students, fetchStudents = _a.fetchStudents, loading = _a.loading;
    var totalStudents = students.length;
    useEffect(function () {
        fetchStudents();
    }, []);
    return (_jsxs("div", { className: "container mx-auto mt-8 mb-8 px-4", dir: "rtl", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold", children: "\u0625\u062F\u0627\u0631\u0629 \u0634\u0624\u0648\u0646 \u0627\u0644\u0637\u0644\u0627\u0628" }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Button, { asChild: true, className: "py-3 px-6", children: _jsxs(RouterLink, { to: "/students/create", children: [_jsx(UserPlus, { className: "ml-2 h-4 w-4" }), "\u0625\u0636\u0627\u0641\u0629 \u0637\u0627\u0644\u0628 \u062C\u062F\u064A\u062F"] }) }), _jsx(Button, { variant: "outline", asChild: true, className: "py-3 px-6", children: _jsxs(RouterLink, { to: "/students/list", children: [_jsx(List, { className: "ml-2 h-4 w-4" }), "\u0639\u0631\u0636 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0644\u0627\u0628"] }) })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6", children: _jsxs(Card, { className: "text-center", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(BarChart3, { className: "h-10 w-10 mx-auto text-primary mb-2" }), _jsx(CardTitle, { className: "text-lg", children: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0637\u0644\u0627\u0628" })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-4xl font-bold", children: loading ? (_jsx(Skeleton, { className: "h-10 w-16 mx-auto" })) : (totalStudents) }) })] }) })] }));
};
export default StudentDashboard;
