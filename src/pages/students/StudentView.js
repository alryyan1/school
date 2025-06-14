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
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// src/pages/students/StudentView.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Edit, ArrowRight, User, Upload, X, } from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
import { Gender } from '@/types/student';
import { useSnackbar } from 'notistack';
// Helper to display data or placeholder
var displayData = function (data, placeholder, suffix) {
    if (placeholder === void 0) { placeholder = 'غير محدد'; }
    if (suffix === void 0) { suffix = ''; }
    return data ? "".concat(data).concat(suffix) : placeholder;
};
// Simple component for displaying info items consistently
var InfoItem = function (_a) {
    var label = _a.label, value = _a.value;
    return (_jsxs("div", { className: "grid grid-cols-3 gap-4 py-2", children: [_jsxs("div", { className: "text-sm font-medium text-muted-foreground", children: [label, ":"] }), _jsx("div", { className: "col-span-2", children: typeof value === 'string' || typeof value === 'number' ? (_jsx("div", { className: "text-sm", children: value })) : (value) })] }));
};
var StudentView = function () {
    var _a;
    var id = useParams().id;
    var enqueueSnackbar = useSnackbar().enqueueSnackbar;
    var fileInputRef = useRef(null);
    var _b = useStudentStore(), currentStudent = _b.currentStudent, loading = _b.loading, storeError = _b.error, getStudentById = _b.getStudentById, resetCurrentStudent = _b.resetCurrentStudent, updateStudentPhoto = _b.updateStudentPhoto;
    // State for photo upload
    var _c = useState(null), selectedFile = _c[0], setSelectedFile = _c[1];
    var _d = useState(false), isUploading = _d[0], setIsUploading = _d[1];
    var _e = useState(null), uploadError = _e[0], setUploadError = _e[1];
    useEffect(function () {
        var studentId = parseInt(id !== null && id !== void 0 ? id : '', 10);
        if (!isNaN(studentId)) {
            getStudentById(studentId);
        }
        else {
            console.error("Invalid Student ID provided in URL");
        }
        return function () { return resetCurrentStudent(); };
    }, [id, getStudentById, resetCurrentStudent]);
    // Clear upload state if student changes
    useEffect(function () {
        setSelectedFile(null);
        setIsUploading(false);
        setUploadError(null);
    }, [currentStudent]);
    var handleFileChange = function (event) {
        if (event.target.files && event.target.files[0]) {
            var file = event.target.files[0];
            if (file.size > 2 * 1024 * 1024) { // Max 2MB
                setUploadError("حجم الملف كبير جداً (الحد الأقصى 2 ميجا).");
                setSelectedFile(null);
                if (fileInputRef.current)
                    fileInputRef.current.value = '';
                return;
            }
            setSelectedFile(file);
            setUploadError(null);
        }
        else {
            setSelectedFile(null);
        }
    };
    var handleUpload = function () { return __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedFile || !currentStudent)
                        return [2 /*return*/];
                    setIsUploading(true);
                    setUploadError(null);
                    return [4 /*yield*/, updateStudentPhoto(currentStudent.id, selectedFile)];
                case 1:
                    success = _a.sent();
                    setIsUploading(false);
                    if (success) {
                        enqueueSnackbar('تم تحديث صورة الطالب بنجاح', { variant: 'success' });
                        setSelectedFile(null);
                        if (fileInputRef.current)
                            fileInputRef.current.value = '';
                    }
                    else {
                        setUploadError(useStudentStore.getState().error || 'فشل رفع الصورة. حاول مرة أخرى.');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    if (loading && !currentStudent) {
        return (_jsx("div", { className: "container mx-auto p-6", dir: "rtl", children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsx(Skeleton, { className: "h-8 w-full" }), _jsx(Skeleton, { className: "h-8 w-full" }), _jsx(Skeleton, { className: "h-8 w-full" })] }) }) }) }));
    }
    if (storeError) {
        return (_jsx("div", { className: "container mx-auto p-6", dir: "rtl", children: _jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: storeError }) }) }));
    }
    if (!currentStudent) {
        return (_jsx("div", { className: "container mx-auto p-6", dir: "rtl", children: _jsx(Alert, { children: _jsx(AlertDescription, { children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0637\u0627\u0644\u0628." }) }) }));
    }
    var studentName = currentStudent.student_name || "الطالب";
    var imageUrl = currentStudent.image_url;
    var imagePreviewUrl = selectedFile ? URL.createObjectURL(selectedFile) : imageUrl;
    return (_jsx("div", { className: "container mx-auto p-6", dir: "rtl", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs(CardTitle, { className: "text-2xl", children: ["\u0645\u0644\u0641 \u0627\u0644\u0637\u0627\u0644\u0628: ", studentName] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", asChild: true, children: _jsxs(RouterLink, { to: "/students/list", children: [_jsx(ArrowRight, { className: "ml-2 h-4 w-4" }), "\u0627\u0644\u0642\u0627\u0626\u0645\u0629"] }) }), _jsx(Button, { asChild: true, children: _jsxs(RouterLink, { to: "/students/".concat(currentStudent.id, "/edit"), children: [_jsx(Edit, { className: "ml-2 h-4 w-4" }), "\u062A\u0639\u062F\u064A\u0644"] }) })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsx("div", { className: "md:col-span-1", children: _jsxs("div", { className: "flex flex-col items-center space-y-4", children: [_jsxs(Avatar, { className: "w-40 h-40", children: [_jsx(AvatarImage, { src: "".concat(imagePreviewUrl), alt: studentName }), _jsx(AvatarFallback, { className: "text-4xl", children: studentName.charAt(0) || _jsx(User, { className: "w-16 h-16" }) })] }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/png, image/jpeg, image/gif", onChange: handleFileChange, className: "hidden" }), _jsxs(Button, { variant: "outline", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, disabled: isUploading, className: "w-full", children: [_jsx(Upload, { className: "ml-2 h-4 w-4" }), isUploading ? 'جار الرفع...' : (selectedFile ? 'تأكيد الرفع' : 'تغيير الصورة')] }), selectedFile && !isUploading && (_jsxs(Button, { onClick: handleUpload, className: "w-full", children: ["\u062A\u0623\u0643\u064A\u062F \u0631\u0641\u0639 \"", selectedFile.name.substring(0, 15), "...\""] })), isUploading && _jsx(Progress, { value: 50, className: "w-full" }), uploadError && (_jsx(Alert, { variant: "destructive", className: "w-full", children: _jsxs(AlertDescription, { className: "flex items-center justify-between", children: [uploadError, _jsx(Button, { variant: "ghost", size: "sm", onClick: function () { return setUploadError(null); }, children: _jsx(X, { className: "h-4 w-4" }) })] }) }))] }) }), _jsxs("div", { className: "md:col-span-3 space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4 pb-2 border-b", children: "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629" }), _jsxs("div", { className: "space-y-2", children: [_jsx(InfoItem, { label: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644", value: displayData(currentStudent.student_name) }), _jsx(InfoItem, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F", value: displayData(currentStudent.date_of_birth) }), _jsx(InfoItem, { label: "\u0627\u0644\u062C\u0646\u0633", value: _jsx(Badge, { variant: currentStudent.gender === Gender.Male ? "info" : "secondary", children: displayData(currentStudent.gender) }) }), _jsx(InfoItem, { label: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0645\u0631\u063A\u0648\u0628\u0629", value: _jsx(Badge, { variant: "outline", children: displayData(currentStudent.wished_level) }) }), _jsx(InfoItem, { label: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0648\u0637\u0646\u064A", value: displayData(currentStudent.goverment_id) }), _jsx(InfoItem, { label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", value: displayData(currentStudent.email) }), _jsx(InfoItem, { label: "\u0627\u0644\u0645\u062F\u0631\u0633\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629", value: displayData(currentStudent.referred_school) }), _jsx(InfoItem, { label: "\u0646\u0633\u0628\u0629 \u0627\u0644\u0646\u062C\u0627\u062D \u0627\u0644\u0633\u0627\u0628\u0642\u0629", value: displayData(currentStudent.success_percentage, undefined, '%') }), _jsx(InfoItem, { label: "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0635\u062D\u064A\u0629", value: displayData(currentStudent.medical_condition) })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4 pb-2 border-b", children: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0623\u0628" }), _jsxs("div", { className: "space-y-2", children: [_jsx(InfoItem, { label: "\u0627\u0633\u0645 \u0627\u0644\u0623\u0628", value: displayData(currentStudent.father_name) }), _jsx(InfoItem, { label: "\u0627\u0644\u0648\u0638\u064A\u0641\u0629", value: displayData(currentStudent.father_job) }), _jsx(InfoItem, { label: "\u0627\u0644\u0647\u0627\u062A\u0641", value: displayData(currentStudent.father_phone) }), _jsx(InfoItem, { label: "\u0648\u0627\u062A\u0633\u0627\u0628", value: displayData(currentStudent.father_whatsapp) }), _jsx(InfoItem, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", value: displayData(currentStudent.father_address) })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4 pb-2 border-b", children: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0623\u0645" }), _jsxs("div", { className: "space-y-2", children: [_jsx(InfoItem, { label: "\u0627\u0633\u0645 \u0627\u0644\u0623\u0645", value: displayData(currentStudent.mother_name) }), _jsx(InfoItem, { label: "\u0627\u0644\u0648\u0638\u064A\u0641\u0629", value: displayData(currentStudent.mother_job) }), _jsx(InfoItem, { label: "\u0627\u0644\u0647\u0627\u062A\u0641", value: displayData(currentStudent.mother_phone) }), _jsx(InfoItem, { label: "\u0648\u0627\u062A\u0633\u0627\u0628", value: displayData(currentStudent.mother_whatsapp) }), _jsx(InfoItem, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", value: displayData(currentStudent.mother_address) })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4 pb-2 border-b", children: "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631 \u0627\u0644\u0622\u062E\u0631" }), _jsxs("div", { className: "space-y-2", children: [_jsx(InfoItem, { label: "\u0627\u0644\u0627\u0633\u0645", value: displayData(currentStudent.other_parent) }), _jsx(InfoItem, { label: "\u0635\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0628\u0629", value: displayData(currentStudent.relation_of_other_parent) }), _jsx(InfoItem, { label: "\u0627\u0644\u0648\u0638\u064A\u0641\u0629", value: displayData(currentStudent.relation_job) }), _jsx(InfoItem, { label: "\u0627\u0644\u0647\u0627\u062A\u0641", value: displayData(currentStudent.relation_phone) }), _jsx(InfoItem, { label: "\u0648\u0627\u062A\u0633\u0627\u0628", value: displayData(currentStudent.relation_whatsapp) })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4 pb-2 border-b", children: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0642\u0628\u0648\u0644" }), _jsxs("div", { className: "space-y-2", children: [_jsx(InfoItem, { label: "\u0627\u0644\u062D\u0627\u0644\u0629", value: _jsx(Badge, { variant: currentStudent.approved ? "success" : "outline", children: currentStudent.approved ? 'مقبول' : 'قيد المراجعة' }) }), _jsx(InfoItem, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0642\u0628\u0648\u0644", value: displayData(currentStudent.aproove_date) }), _jsx(InfoItem, { label: "\u062A\u0645 \u0627\u0644\u0642\u0628\u0648\u0644 \u0628\u0648\u0627\u0633\u0637\u0629 (ID)", value: displayData((_a = currentStudent.approved_by_user) === null || _a === void 0 ? void 0 : _a.toString()) }), _jsx(InfoItem, { label: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0642\u0628\u0648\u0644", value: _jsx(Badge, { variant: currentStudent.message_sent ? "success" : "outline", children: currentStudent.message_sent ? 'نعم' : 'لا' }) })] })] })] })] }) })] }) }));
};
export default StudentView;
