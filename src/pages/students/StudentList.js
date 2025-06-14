var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
// src/pages/students/StudentList.tsx
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { Edit, Eye, Plus, FileText, ChevronUp, ChevronDown, Mail, } from "lucide-react";
import { useStudentStore } from "@/stores/studentStore";
import { Gender } from "@/types/student";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { webUrl } from "@/constants";
import dayjs from "dayjs";
var StudentList = function () {
    var _a = useStudentStore(), students = _a.students, loading = _a.loading, error = _a.error, fetchStudents = _a.fetchStudents, deleteStudent = _a.deleteStudent, updateStudent = _a.updateStudent;
    var enqueueSnackbar = useSnackbar().enqueueSnackbar;
    var navigate = useNavigate();
    // Pagination state
    var _b = useState(0), page = _b[0], setPage = _b[1];
    var _c = useState(10), rowsPerPage = _c[0], setRowsPerPage = _c[1];
    // Sorting state
    var _d = useState("id"), orderBy = _d[0], setOrderBy = _d[1];
    var _e = useState("desc"), order = _e[0], setOrder = _e[1];
    // Filtering state
    var _f = useState(""), searchTerm = _f[0], setSearchTerm = _f[1];
    useEffect(function () {
        fetchStudents();
    }, [fetchStudents]);
    var handleDelete = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, deleteStudent(id)];
                case 1:
                    _a.sent();
                    enqueueSnackbar("تم حذف الطالب بنجاح", { variant: "success" });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    enqueueSnackbar("فشل في حذف الطالب", { variant: "error" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handlePrintList = function () {
        var reportUrl = "".concat(webUrl, "reports/students/list-pdf");
        var filters = new URLSearchParams();
        if (filters.toString()) {
            reportUrl += "?" + filters.toString();
        }
        window.open(reportUrl, "_blank");
    };
    var handleSort = function (property) {
        var isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };
    var filteredStudents = students.filter(function (student) {
        return Object.values(student).some(function (value) {
            return value &&
                value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
    });
    var sortedStudents = filteredStudents.sort(function (a, b) {
        var aValue = a[orderBy];
        var bValue = b[orderBy];
        if (aValue === undefined || bValue === undefined)
            return 0;
        if (typeof aValue == "number" && typeof bValue == "number") {
            return order == "asc" ? aValue - bValue : bValue - aValue;
        }
        if (order === "asc") {
            return aValue.toString().localeCompare(bValue.toString());
        }
        else {
            return bValue.toString().localeCompare(aValue.toString());
        }
    });
    var paginatedStudents = sortedStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    var totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
    function handleAccept(student) {
        var result = confirm("تأكيد العمليه");
        if (result) {
            updateStudent(student.id, __assign(__assign({}, student), { approved: true, aproove_date: dayjs().format("YYYY-MM-DD HH:mm:ss") }));
        }
    }
    var SortButton = function (_a) {
        var column = _a.column, children = _a.children;
        return (_jsxs(Button, { variant: "ghost", onClick: function () { return handleSort(column); }, className: "h-auto p-0 font-medium hover:bg-transparent", children: [children, orderBy === column && (order === "asc" ? _jsx(ChevronUp, { className: "ml-1 h-4 w-4" }) : _jsx(ChevronDown, { className: "ml-1 h-4 w-4" }))] }));
    };
    if (loading)
        return (_jsx("div", { className: "container mx-auto p-6", dir: "rtl", children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsx(Skeleton, { className: "h-8 w-full" }), _jsx(Skeleton, { className: "h-8 w-full" }), _jsx(Skeleton, { className: "h-8 w-full" })] }) }) }) }));
    if (error)
        return (_jsx("div", { className: "container mx-auto p-6", dir: "rtl", children: _jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) }) }));
    return (_jsx("div", { className: "container mx-auto p-6", dir: "rtl", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center flex-wrap gap-4", children: [_jsx(CardTitle, { className: "text-2xl", children: "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0644\u0627\u0628" }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsx(Input, { placeholder: "\u0628\u062D\u062B...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "w-80" }), _jsxs(Button, { onClick: function () { return navigate("/students/create"); }, children: [_jsx(Plus, { className: "ml-2 h-4 w-4" }), "\u0625\u0636\u0627\u0641\u0629 \u0637\u0627\u0644\u0628 \u062C\u062F\u064A\u062F"] }), _jsxs(Button, { variant: "outline", onClick: handlePrintList, children: [_jsx(FileText, { className: "ml-2 h-4 w-4" }), "\u0637\u0628\u0627\u0639\u0629 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0644\u0627\u0628"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-center", children: _jsx(SortButton, { column: "id", children: "\u0627\u0644\u0643\u0648\u062F" }) }), _jsx(TableHead, { className: "text-center", children: _jsx(SortButton, { column: "student_name", children: "\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628" }) }), _jsx(TableHead, { className: "text-center", children: _jsx(SortButton, { column: "gender", children: "\u0627\u0644\u062C\u0646\u0633" }) }), _jsx(TableHead, { className: "text-center", children: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641" }), _jsx(TableHead, { className: "text-center", children: "\u0627\u0644\u0645\u0633\u062A\u0648\u0649" }), _jsx(TableHead, { className: "text-center", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx(TableHead, { className: "text-center", children: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629" }), _jsx(TableHead, { className: "text-center", children: "\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0645\u0644\u0641" }), _jsx(TableHead, { className: "text-center", children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: paginatedStudents.map(function (student) { return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "text-center", children: student.id }), _jsx(TableCell, { className: "text-center", children: student.student_name }), _jsx(TableCell, { className: "text-center", children: _jsx(Badge, { variant: student.gender === Gender.Male ? "info" : "secondary", children: student.gender === Gender.Male ? "ذكر" : "أنثى" }) }), _jsx(TableCell, { className: "text-center", children: student.father_phone }), _jsx(TableCell, { className: "text-center", children: student.wished_level }), _jsx(TableCell, { className: "text-center", children: _jsx(Badge, { variant: student.approved ? "success" : "outline", children: student.approved ? "مقبول" : "قيد المراجعة" }) }), _jsx(TableCell, { className: "text-center", children: student.wished_level }), _jsx(TableCell, { className: "text-center", children: _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx("a", { href: "".concat(webUrl, "students/").concat(student.id, "/pdf"), target: "_blank", rel: "noopener noreferrer", children: "PDF" }) }) }), _jsx(TableCell, { className: "text-center", children: _jsxs("div", { className: "flex justify-center gap-1", children: [_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/students/".concat(student.id)); }, children: _jsx(Eye, { className: "h-4 w-4 text-blue-600" }) }) }), _jsx(TooltipContent, { children: "\u0639\u0631\u0636" })] }) }), _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/students/".concat(student.id, "/edit")); }, children: _jsx(Edit, { className: "h-4 w-4 text-green-600" }) }) }), _jsx(TooltipContent, { children: "\u062A\u0639\u062F\u064A\u0644" })] }) }), student.aproove_date == null && (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", onClick: function () { return handleAccept(student); }, children: _jsx(Mail, { className: "h-4 w-4 text-green-600" }) }) }), _jsx(TooltipContent, { children: "\u0642\u0628\u0648\u0644" })] }) }))] }) })] }, student.id)); }) })] }) }), _jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["\u0639\u0631\u0636 ", page * rowsPerPage + 1, "-", Math.min((page + 1) * rowsPerPage, filteredStudents.length), " \u0645\u0646 ", filteredStudents.length] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: function () { return setPage(page - 1); }, disabled: page === 0, children: "\u0627\u0644\u0633\u0627\u0628\u0642" }), _jsxs("span", { className: "text-sm", children: ["\u0635\u0641\u062D\u0629 ", page + 1, " \u0645\u0646 ", totalPages] }), _jsx(Button, { variant: "outline", size: "sm", onClick: function () { return setPage(page + 1); }, disabled: page >= totalPages - 1, children: "\u0627\u0644\u062A\u0627\u0644\u064A" })] })] })] })] }) }));
};
export default StudentList;
