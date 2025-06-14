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
// src/pages/schools/SchoolList.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Optional: for page/row animations
// shadcn/ui components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // shadcn Alert
import { Input } from "@/components/ui/input"; // For potential search
// lucide-react icons
import { PlusCircle, MoreHorizontal, Edit3, Trash2, Eye, Building, AlertCircle, } from "lucide-react";
import { useSchoolStore } from "@/stores/schoolStore"; // Adjust path
import { useSnackbar } from "notistack"; // Still useful for general notifications
// Removed MUI Pagination, DataGrid, Tooltip, etc.
var SchoolList = function () {
    var navigate = useNavigate();
    var enqueueSnackbar = useSnackbar().enqueueSnackbar;
    // --- Store Data & Actions ---
    // Assuming useSchoolStore doesn't use pagination for schools as per previous request
    var _a = useSchoolStore(), schools = _a.schools, loading = _a.loading, error = _a.error, fetchSchools = _a.fetchSchools, deleteSchool = _a.deleteSchool;
    // --- Local State ---
    var _b = useState(false), deleteDialogOpen = _b[0], setDeleteDialogOpen = _b[1];
    var _c = useState(null), schoolToDelete = _c[0], setSchoolToDelete = _c[1];
    var _d = useState(""), searchTerm = _d[0], setSearchTerm = _d[1]; // For local search/filter
    // --- Effects ---
    useEffect(function () {
        fetchSchools(); // Fetches all schools
    }, [fetchSchools]);
    // --- Handlers ---
    var handleOpenDeleteDialog = function (school) {
        setSchoolToDelete(school);
        setDeleteDialogOpen(true);
    };
    var handleCloseDeleteDialog = function () {
        setSchoolToDelete(null);
        setDeleteDialogOpen(false);
    };
    var handleDeleteConfirm = function () { return __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!schoolToDelete) return [3 /*break*/, 2];
                    return [4 /*yield*/, deleteSchool(schoolToDelete.id)];
                case 1:
                    success = _a.sent();
                    if (success) {
                        enqueueSnackbar("تم حذف المدرسة بنجاح", { variant: "success" });
                    }
                    else {
                        // Error message from store or fallback
                        enqueueSnackbar(useSchoolStore.getState().error || "فشل حذف المدرسة", {
                            variant: "error",
                        });
                    }
                    handleCloseDeleteDialog();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    // --- Filtered Schools for Display ---
    var filteredSchools = React.useMemo(function () {
        if (!searchTerm)
            return schools;
        return schools.filter(function (school) {
            return school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (school.email &&
                    school.email.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    }, [schools, searchTerm]);
    // --- Animation Variants (Optional) ---
    var containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };
    var itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };
    // --- Render Skeletons for Loading ---
    if (loading) {
        return (_jsxs("div", { className: "container max-w-screen-xl mx-auto py-6 px-4 md:py-8 md:px-6", dir: "rtl", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx(Skeleton, { className: "h-10 w-48" }), _jsx(Skeleton, { className: "h-10 w-32" })] }), _jsx(Skeleton, { className: "h-12 w-full mb-4" }), " ", _jsx("div", { className: "border rounded-lg", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsx(TableRow, { children: __spreadArray([], Array(6), true).map(function (_, i) { return (_jsx(TableHead, { children: _jsx(Skeleton, { className: "h-5 w-full" }) }, i)); }) }) }), _jsx(TableBody, { children: __spreadArray([], Array(5), true).map(function (_, i) { return (_jsx(TableRow, { children: __spreadArray([], Array(6), true).map(function (_, j) { return (_jsx(TableCell, { children: _jsx(Skeleton, { className: "h-5 w-full" }) }, j)); }) }, i)); }) })] }) })] }));
    }
    // --- Render Error State ---
    if (error) {
        return (_jsxs("div", { className: "container max-w-screen-xl mx-auto py-6 px-4 md:py-8 md:px-6", dir: "rtl", children: [_jsxs(Alert, { variant: "destructive", className: "mb-6", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "\u062E\u0637\u0623" }), _jsx(AlertDescription, { children: error })] }), _jsx(Button, { onClick: function () { return fetchSchools(); }, variant: "outline", children: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629" })] }));
    }
    // --- Main Render ---
    return (_jsxs("div", { className: "container max-w-screen-xl mx-auto py-6 px-4 md:py-8 md:px-6", dir: "rtl", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-center mb-6 gap-4", children: [_jsx("h1", { className: "text-2xl font-semibold text-foreground", children: "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u062F\u0627\u0631\u0633" }), _jsxs("div", { className: "flex gap-2 w-full sm:w-auto", children: [_jsx(Input, { type: "text", placeholder: "\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645, \u0627\u0644\u0631\u0645\u0632, \u0623\u0648 \u0627\u0644\u0628\u0631\u064A\u062F...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "max-w-xs w-full" }), _jsxs(Button, { onClick: function () { return navigate("/schools/create"); }, className: "whitespace-nowrap", children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), " \u0625\u0636\u0627\u0641\u0629 \u0645\u062F\u0631\u0633\u0629"] })] })] }), _jsx("div", { className: "border rounded-lg overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-[60px] text-center", children: "\u0627\u0644\u0634\u0639\u0627\u0631" }), _jsx(TableHead, { children: "\u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u0631\u0633\u0629" }), _jsx(TableHead, { className: "hidden sm:table-cell", children: "\u0627\u0644\u0631\u0645\u0632" }), _jsx(TableHead, { className: "hidden md:table-cell", children: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A" }), _jsx(TableHead, { className: "hidden md:table-cell", children: "\u0627\u0644\u0647\u0627\u062A\u0641" }), _jsx(TableHead, { className: "hidden lg:table-cell", children: "\u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u064A\u0631" }), _jsx(TableHead, { className: "w-[80px] text-center", children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: filteredSchools.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "h-24 text-center text-muted-foreground", children: searchTerm
                                        ? "لم يتم العثور على مدارس تطابق بحثك."
                                        : "لا توجد مدارس لعرضها. قم بإضافة مدرسة جديدة." }) })) : (filteredSchools.map(function (school) {
                                var _a;
                                return (_jsxs(motion.tr, { variants: itemVariants, initial: "hidden", animate: "visible", className: "hover:bg-muted/50 transition-colors", children: [_jsx(TableCell, { className: "text-center", children: _jsxs(Avatar, { className: "h-9 w-9 mx-auto", children: [_jsx(AvatarImage, { src: (_a = school.logo_url) !== null && _a !== void 0 ? _a : undefined, alt: school.name }), _jsx(AvatarFallback, { children: _jsx(Building, { className: "h-4 w-4 text-muted-foreground" }) })] }) }), _jsx(TableCell, { className: "font-medium", children: school.name }), _jsx(TableCell, { className: "hidden sm:table-cell", children: school.code }), _jsx(TableCell, { className: "hidden md:table-cell", children: school.email || "-" }), _jsx(TableCell, { className: "hidden md:table-cell", children: school.phone || "-" }), _jsx(TableCell, { className: "hidden lg:table-cell", children: school.principal_name || "-" }), _jsx(TableCell, { className: "text-center", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", children: [_jsx(MoreHorizontal, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "\u0641\u062A\u062D \u0627\u0644\u0642\u0627\u0626\u0645\u0629" })] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-[160px]", dir: "rtl", children: [_jsx(DropdownMenuLabel, { children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" }), _jsxs(DropdownMenuItem, { onSelect: function () { return navigate("/schools/".concat(school.id)); }, children: [_jsx(Eye, { className: "ml-2 h-4 w-4" }), " \u0639\u0631\u0636"] }), _jsxs(DropdownMenuItem, { onSelect: function () {
                                                                    return navigate("/schools/".concat(school.id, "/edit"));
                                                                }, children: [_jsx(Edit3, { className: "ml-2 h-4 w-4" }), " \u062A\u0639\u062F\u064A\u0644"] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onSelect: function () { return handleOpenDeleteDialog(school); }, className: "text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50", children: [_jsx(Trash2, { className: "ml-2 h-4 w-4" }), " \u062D\u0630\u0641"] })] })] }) })] }, school.id));
                            })) })] }) }), _jsx(Dialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, dir: "rtl", children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" }), _jsxs(DialogDescription, { children: ["\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \u0627\u0644\u0645\u062F\u0631\u0633\u0629 \"", schoolToDelete === null || schoolToDelete === void 0 ? void 0 : schoolToDelete.name, "\"\u061F \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621.", _jsx("br", {}), _jsx("span", { className: "text-destructive font-medium text-sm", children: "(\u062A\u062D\u0630\u064A\u0631: \u0642\u062F \u064A\u0624\u062F\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u062F\u0631\u0633\u0629 \u0625\u0644\u0649 \u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0647\u0627 \u0645\u062B\u0644 \u0627\u0644\u0641\u0635\u0648\u0644\u060C \u0627\u0644\u0637\u0644\u0627\u0628\u060C \u0625\u0644\u062E.)" })] })] }), _jsxs(DialogFooter, { className: "gap-2 sm:justify-start", children: [_jsx(DialogClose, { asChild: true, children: _jsx(Button, { type: "button", variant: "outline", children: "\u0625\u0644\u063A\u0627\u0621" }) }), _jsx(Button, { type: "button", variant: "destructive", onClick: handleDeleteConfirm, children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" })] })] }) })] }));
};
export default SchoolList;
