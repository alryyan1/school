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
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/students/studentForm/StudentForm.tsx
import { useForm, FormProvider } from "react-hook-form";
import { EducationLevel, Gender } from "@/types/student";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { StudentInfoTab } from "./StudentTabs/StudentInfoTab";
import { FatherInfoTab } from "./StudentTabs/FatherInfoTab";
import { MotherInfoTab } from "./StudentTabs/MotherInfoTab";
import { AdditionalInfoTab } from "./StudentTabs/AdditionalInfoTab";
import dayjs from "dayjs";
import { useStudentStore } from "@/stores/studentStore";
import { useSnackbar } from "notistack";
// Keep initial state for create mode and form structure reference
var initialStudentState = {
    student_name: "",
    father_name: "",
    father_job: "",
    father_address: "",
    father_phone: "",
    father_whatsapp: null,
    mother_name: "",
    mother_job: "",
    mother_address: "",
    mother_phone: "",
    mother_whatsapp: null,
    email: null,
    date_of_birth: dayjs().subtract(5, 'year').format("YYYY-MM-DD"),
    gender: Gender.Male,
    closest_name: null,
    closest_phone: null,
    referred_school: null,
    success_percentage: null,
    medical_condition: null,
    other_parent: "",
    relation_of_other_parent: "",
    relation_job: "",
    relation_phone: "",
    relation_whatsapp: "",
    image: null,
    approved: false,
    approved_by_user: null,
    message_sent: false,
    goverment_id: "",
    wished_level: EducationLevel.Primary,
};
// LocalStorage key (consider if still needed, might conflict with edit)
// const localStorageKey = "studentFormData";
export var StudentForm = function () {
    var id = useParams().id;
    var navigate = useNavigate();
    var studentId = id ? parseInt(id, 10) : undefined;
    var isEditMode = !!studentId;
    var methods = useForm({
        defaultValues: initialStudentState,
    });
    var _a = useStudentStore(), createStudent = _a.createStudent, updateStudent = _a.updateStudent, getStudentById = _a.getStudentById, currentStudent = _a.currentStudent, studentStoreLoading = _a.loading, resetCurrentStudent = _a.resetCurrentStudent;
    var enqueueSnackbar = useSnackbar().enqueueSnackbar;
    var _b = useState("student-info"), activeTab = _b[0], setActiveTab = _b[1];
    var _c = useState(false), isSubmitting = _c[0], setIsSubmitting = _c[1];
    var _d = useState(false), isFetchingData = _d[0], setIsFetchingData = _d[1];
    // Fetch data on mount if in edit mode
    useEffect(function () {
        if (isEditMode && studentId) {
            var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setIsFetchingData(true);
                            resetCurrentStudent();
                            return [4 /*yield*/, getStudentById(studentId)];
                        case 1:
                            _a.sent();
                            setIsFetchingData(false);
                            return [2 /*return*/];
                    }
                });
            }); };
            fetchData();
        }
        else {
            methods.reset(initialStudentState);
        }
        return function () {
            resetCurrentStudent();
        };
    }, [studentId, isEditMode, getStudentById, methods, resetCurrentStudent]);
    // Populate form once data is fetched in edit mode
    useEffect(function () {
        if (isEditMode && currentStudent && currentStudent.id === studentId) {
            methods.reset(currentStudent);
        }
    }, [currentStudent, isEditMode, methods, studentId]);
    // Handle form submission (Create or Update)
    var onSubmit = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var createData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!(isEditMode && studentId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateStudent(studentId, data)];
                case 2:
                    _a.sent();
                    enqueueSnackbar('تم تحديث بيانات الطالب بنجاح', { variant: 'success' });
                    navigate("/students/".concat(studentId));
                    return [3 /*break*/, 5];
                case 3:
                    createData = data;
                    return [4 /*yield*/, createStudent(createData)];
                case 4:
                    _a.sent();
                    navigate('../list');
                    enqueueSnackbar('تم إضافة الطالب بنجاح', { variant: 'success' });
                    methods.reset(initialStudentState);
                    setActiveTab("student-info");
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    enqueueSnackbar(isEditMode ? 'حدث خطأ أثناء تحديث البيانات' : 'حدث خطأ أثناء إضافة الطالب', { variant: 'error' });
                    console.error('Submission error:', error_1);
                    return [3 /*break*/, 8];
                case 7:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Handle Loading and Error States during initial data fetch
    if (isFetchingData || (isEditMode && studentStoreLoading && !currentStudent)) {
        return (_jsx("div", { className: "container mx-auto p-6", dir: "rtl", children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin" }), _jsx("span", { children: "\u062C\u0627\u0631 \u062A\u062D\u0645\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0637\u0627\u0644\u0628..." })] }) }) }) }));
    }
    if (isEditMode && !studentStoreLoading && !currentStudent && !isFetchingData) {
        return (_jsx("div", { className: "container mx-auto p-6", dir: "rtl", children: _jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: ["\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0637\u0627\u0644\u0628 \u0627\u0644\u0645\u062D\u062F\u062F \u0628\u0627\u0644\u0645\u0639\u0631\u0641: ", studentId, "."] })] }) }));
    }
    var tabItems = [
        { value: "student-info", label: "معلومات الطالب", component: _jsx(StudentInfoTab, {}) },
        { value: "father-info", label: "معلومات الأب", component: _jsx(FatherInfoTab, {}) },
        { value: "mother-info", label: "معلومات الأم", component: _jsx(MotherInfoTab, {}) },
        { value: "additional-info", label: "معلومات ولي الأمر الآخر", component: _jsx(AdditionalInfoTab, {}) },
    ];
    return (_jsx("div", { className: "container mx-auto p-6", dir: "rtl", children: _jsx(FormProvider, __assign({}, methods, { children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-2xl text-center", children: isEditMode ? "\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0637\u0627\u0644\u0628: ".concat((currentStudent === null || currentStudent === void 0 ? void 0 : currentStudent.student_name) || '') : 'إضافة طالب جديد' }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: methods.handleSubmit(onSubmit), children: [_jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsx(TabsList, { className: "grid w-full grid-cols-4", children: tabItems.map(function (tab) { return (_jsx(TabsTrigger, { value: tab.value, className: "text-sm", children: tab.label }, tab.value)); }) }), tabItems.map(function (tab) { return (_jsx(TabsContent, { value: tab.value, className: "mt-6", children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: tab.component }) }) }, tab.value)); })] }), Object.keys(methods.formState.errors).length > 0 && (_jsxs(Alert, { variant: "destructive", className: "mt-6", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("div", { className: "font-semibold mb-2", children: "\u064A\u0631\u062C\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u0627\u0644\u062A\u0627\u0644\u064A\u0629:" }), _jsx("ul", { className: "list-disc list-inside space-y-1", children: Object.entries(methods.formState.errors).map(function (_a) {
                                                        var key = _a[0], error = _a[1];
                                                        return (_jsxs("li", { className: "text-sm", children: [error === null || error === void 0 ? void 0 : error.message, " (", key, ")"] }, key));
                                                    }) })] })] })), _jsxs("div", { className: "flex justify-between items-center mt-6 pt-6 border-t", children: [_jsx(Button, { type: "button", variant: "outline", disabled: activeTab === "student-info", onClick: function () {
                                                var currentIndex = tabItems.findIndex(function (tab) { return tab.value === activeTab; });
                                                if (currentIndex > 0) {
                                                    setActiveTab(tabItems[currentIndex - 1].value);
                                                }
                                            }, children: "\u0627\u0644\u0633\u0627\u0628\u0642" }), _jsx(Button, { type: "submit", disabled: isSubmitting || studentStoreLoading, className: "min-w-32", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "ml-2 h-4 w-4 animate-spin" }), "\u062C\u0627\u0631 \u0627\u0644\u062D\u0641\u0638..."] })) : (isEditMode ? 'حفظ التعديلات' : 'إضافة الطالب') }), _jsx(Button, { type: "button", variant: "outline", onClick: function () {
                                                var currentIndex = tabItems.findIndex(function (tab) { return tab.value === activeTab; });
                                                if (currentIndex < tabItems.length - 1) {
                                                    setActiveTab(tabItems[currentIndex + 1].value);
                                                }
                                            }, disabled: activeTab === "additional-info", children: "\u0627\u0644\u062A\u0627\u0644\u064A" })] })] }) })] }) })) }));
};
