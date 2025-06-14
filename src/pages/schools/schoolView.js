var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/schools/SchoolView.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator"; // For dividers
import { cn } from "@/lib/utils";
// lucide-react icons
import { Edit3, ArrowRight, Building, Mail, Phone, User, CalendarDays, AlertCircle } from 'lucide-react';
import { useSchoolStore } from '@/stores/schoolStore'; // Adjust path
import dayjs from 'dayjs'; // For date formatting
var displayData = function (data, placeholder, suffix) {
    if (placeholder === void 0) { placeholder = 'غير محدد'; }
    if (suffix === void 0) { suffix = ''; }
    return data ? "".concat(data).concat(suffix) : placeholder;
};
// Simple component for displaying info items consistently
var InfoItem = function (_a) {
    var label = _a.label, value = _a.value, Icon = _a.icon, iconClass = _a.iconClass;
    return (_jsxs("div", { className: "flex items-start space-x-3 space-x-reverse", children: [" ", Icon && _jsx(Icon, { className: cn("h-5 w-5 mt-1 text-muted-foreground", iconClass) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: label }), _jsx("p", { className: "text-base text-foreground", children: typeof value === 'string' || typeof value === 'number' ? value : value })] })] }));
};
var SchoolView = function () {
    var _a;
    var id = useParams().id;
    var navigate = useNavigate();
    var schoolId = Number(id);
    var _b = useSchoolStore(), currentSchool = _b.currentSchool, loading = _b.loading, error = _b.error, getSchoolById = _b.getSchoolById, resetCurrentSchool = _b.resetCurrentSchool;
    useEffect(function () {
        if (schoolId) {
            getSchoolById(schoolId);
        }
        return function () { return resetCurrentSchool(); };
    }, [schoolId, getSchoolById, resetCurrentSchool]);
    if (loading && !currentSchool) { // Show skeleton only on initial load
        return (_jsx("div", { className: "container max-w-3xl mx-auto py-8 px-4", dir: "rtl", children: _jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsx(Skeleton, { className: "h-8 w-3/5" }), _jsx(Skeleton, { className: "h-10 w-24" })] }), _jsxs(CardContent, { className: "space-y-6 pt-6", children: [_jsxs("div", { className: "flex items-center space-x-6 space-x-reverse", children: [_jsx(Skeleton, { className: "h-24 w-24 rounded-md" }), _jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Skeleton, { className: "h-6 w-4/5" }), _jsx(Skeleton, { className: "h-4 w-2/5" })] })] }), _jsx(Separator, {}), __spreadArray([], Array(4), true).map(function (_, i) { return (_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-1/4" }), _jsx(Skeleton, { className: "h-5 w-3/4" })] }, i)); })] })] }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "container max-w-3xl mx-auto py-8 px-4", dir: "rtl", children: [_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "\u062E\u0637\u0623" }), _jsx(AlertDescription, { children: error })] }), _jsxs(Button, { variant: "outline", onClick: function () { return navigate('/schools/list'); }, className: "mt-4", children: [_jsx(ArrowRight, { className: "ml-2 h-4 w-4" }), "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0642\u0627\u0626\u0645\u0629"] })] }));
    }
    if (!currentSchool) {
        return (_jsxs("div", { className: "container max-w-3xl mx-auto py-8 px-4", dir: "rtl", children: [_jsxs(Alert, { children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "\u062A\u0646\u0628\u064A\u0647" }), _jsx(AlertDescription, { children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062F\u0631\u0633\u0629." })] }), _jsxs(Button, { variant: "outline", onClick: function () { return navigate('/schools/list'); }, className: "mt-4", children: [_jsx(ArrowRight, { className: "ml-2 h-4 w-4" }), "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0642\u0627\u0626\u0645\u0629"] })] }));
    }
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "container max-w-3xl mx-auto py-8 px-4", dir: "rtl", children: _jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2 border-b", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-2xl font-bold", children: currentSchool.name }), _jsxs(CardDescription, { children: ["\u0627\u0644\u0631\u0645\u0632: ", currentSchool.code] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: function () { return navigate('/schools/list'); }, children: [_jsx(ArrowRight, { className: "ml-2 h-4 w-4" }), " \u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0642\u0627\u0626\u0645\u0629"] }), _jsxs(Button, { size: "sm", onClick: function () { return navigate("/schools/".concat(currentSchool.id, "/edit")); }, children: [_jsx(Edit3, { className: "ml-2 h-4 w-4" }), " \u062A\u0639\u062F\u064A\u0644"] })] })] }), _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 items-start", children: [_jsx("div", { className: "md:col-span-1 flex flex-col items-center", children: _jsxs(Avatar, { className: "h-32 w-32 rounded-md mb-4 border", children: [_jsx(AvatarImage, { src: (_a = currentSchool.logo_url) !== null && _a !== void 0 ? _a : undefined, alt: currentSchool.name }), _jsx(AvatarFallback, { children: _jsx(Building, { className: "h-16 w-16 text-muted-foreground" }) })] }) }), _jsxs("div", { className: "md:col-span-2 grid gap-y-5", children: [_jsx(InfoItem, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", value: displayData(currentSchool.address), icon: Building }), _jsx(InfoItem, { label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", value: _jsx("a", { href: "mailto:".concat(currentSchool.email), className: "hover:underline text-primary", children: displayData(currentSchool.email) }), icon: Mail }), _jsx(InfoItem, { label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", value: _jsx("a", { href: "tel:".concat(currentSchool.phone), className: "hover:underline text-primary", children: displayData(currentSchool.phone) }), icon: Phone }), _jsx(InfoItem, { label: "\u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u064A\u0631", value: displayData(currentSchool.principal_name), icon: User }), _jsx(InfoItem, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u0623\u0633\u064A\u0633", value: displayData(currentSchool.establishment_date ? dayjs(currentSchool.establishment_date).format('DD / MMMM / YYYY') : null), icon: CalendarDays })] })] }) }), _jsx(CardFooter, { className: "border-t pt-4", children: _jsxs("p", { className: "text-xs text-muted-foreground", children: ["\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B: ", displayData(currentSchool.updated_at ? dayjs(currentSchool.updated_at).format('DD MMM YYYY, hh:mm A') : null)] }) })] }) }));
};
export default SchoolView;
