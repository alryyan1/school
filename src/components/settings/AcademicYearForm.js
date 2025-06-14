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
// src/components/settings/AcademicYearForm.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, FormControlLabel, Switch, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar';
import dayjs from 'dayjs';
import { useAcademicYearStore } from '@/stores/academicYearStore';
import { useSchoolStore } from '@/stores/schoolStore'; // To get schools for dropdown
import { useSnackbar } from 'notistack';
var AcademicYearForm = function (_a) {
    var open = _a.open, onClose = _a.onClose, initialData = _a.initialData;
    var isEditMode = !!initialData;
    var _b = useAcademicYearStore(), createAcademicYear = _b.createAcademicYear, updateAcademicYear = _b.updateAcademicYear;
    var _c = useSchoolStore(), schools = _c.schools, fetchSchoolList = _c.fetchSchools; // Fetch schools for dropdown
    var enqueueSnackbar = useSnackbar().enqueueSnackbar;
    var _d = React.useState(null), formError = _d[0], setFormError = _d[1];
    var _e = useForm({
        defaultValues: __assign({ name: '', start_date: dayjs().format('YYYY-MM-DD'), end_date: dayjs().add(9, 'month').format('YYYY-MM-DD'), is_current: false, school_id: '' }, (initialData ? __assign(__assign({}, initialData), { start_date: dayjs(initialData.start_date).format('YYYY-MM-DD'), end_date: dayjs(initialData.end_date).format('YYYY-MM-DD') }) : {})),
    }), control = _e.control, handleSubmit = _e.handleSubmit, reset = _e.reset, _f = _e.formState, errors = _f.errors, isSubmitting = _f.isSubmitting;
    // Fetch schools when the dialog opens if not already loaded
    useEffect(function () {
        if (open && schools.length === 0) {
            fetchSchoolList();
        }
    }, [open, schools.length, fetchSchoolList]);
    // Reset form when initialData changes or dialog opens/closes
    useEffect(function () {
        if (open) {
            setFormError(null); // Clear errors on open
            reset(__assign({ name: '', start_date: dayjs().format('YYYY-MM-DD'), end_date: dayjs().add(9, 'month').format('YYYY-MM-DD'), is_current: false, school_id: '' }, (initialData ? __assign(__assign({}, initialData), { start_date: dayjs(initialData.start_date).format('YYYY-MM-DD'), end_date: dayjs(initialData.end_date).format('YYYY-MM-DD') }) : {})));
        }
    }, [initialData, open, reset]);
    var onSubmit = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var submitData, error_1, backendErrors, errorMessages;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setFormError(null);
                    submitData = __assign(__assign({}, data), { school_id: Number(data.school_id) });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    if (!(isEditMode && initialData)) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateAcademicYear(initialData.id, submitData)];
                case 2:
                    _c.sent();
                    enqueueSnackbar('تم تحديث العام الدراسي بنجاح', { variant: 'success' });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, createAcademicYear(submitData)];
                case 4:
                    _c.sent();
                    enqueueSnackbar('تم إضافة العام الدراسي بنجاح', { variant: 'success' });
                    _c.label = 5;
                case 5:
                    onClose(); // Close dialog on success
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _c.sent();
                    console.error("Form submission error:", error_1);
                    backendErrors = (_b = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors;
                    if (backendErrors) {
                        errorMessages = Object.values(backendErrors).flat().join('. ');
                        setFormError("\u0641\u0634\u0644 \u0627\u0644\u062D\u0641\u0638: ".concat(errorMessages));
                    }
                    else {
                        setFormError(error_1.message || 'حدث خطأ غير متوقع.');
                    }
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: isEditMode ? 'تعديل العام الدراسي' : 'إضافة عام دراسي جديد' }), _jsx(LocalizationProvider, { dateAdapter: AdapterDayjs, adapterLocale: "ar", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [_jsxs(DialogContent, { children: [formError && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: formError }), _jsxs(Grid, { container: true, spacing: 2.5, sx: { pt: 1 }, children: [" ", _jsx(Grid, { item: true, xs: 12, children: _jsx(Controller, { name: "school_id", control: control, rules: { required: 'المدرسة مطلوبة' }, render: function (_a) {
                                                    var field = _a.field;
                                                    return (_jsxs(FormControl, { fullWidth: true, error: !!errors.school_id, children: [_jsx(InputLabel, { id: "school-select-label", children: "\u0627\u0644\u0645\u062F\u0631\u0633\u0629 *" }), _jsxs(Select, __assign({ labelId: "school-select-label", label: "\u0627\u0644\u0645\u062F\u0631\u0633\u0629 *" }, field, { value: field.value || '', disabled: isEditMode, children: [_jsx(MenuItem, { value: "", disabled: true, children: _jsx("em", { children: "\u0627\u062E\u062A\u0631 \u0645\u062F\u0631\u0633\u0629..." }) }), schools.map(function (school) { return (_jsx(MenuItem, { value: school.id, children: school.name }, school.id)); })] })), errors.school_id && _jsx(FormHelperText, { children: errors.school_id.message })] }));
                                                } }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Controller, { name: "name", control: control, rules: { required: 'اسم العام الدراسي مطلوب' }, render: function (_a) {
                                                    var _b;
                                                    var field = _a.field;
                                                    return (_jsx(TextField, __assign({}, field, { label: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A (\u0645\u062B\u0627\u0644: 2024-2025)", fullWidth: true, required: true, error: !!errors.name, helperText: (_b = errors.name) === null || _b === void 0 ? void 0 : _b.message })));
                                                } }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(Controller, { name: "start_date", control: control, rules: { required: 'تاريخ البداية مطلوب' }, render: function (_a) {
                                                    var _b;
                                                    var field = _a.field;
                                                    return (_jsx(DatePicker, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629 *", value: field.value ? dayjs(field.value) : null, onChange: function (d) { var _a; return field.onChange((_a = d === null || d === void 0 ? void 0 : d.format('YYYY-MM-DD')) !== null && _a !== void 0 ? _a : null); }, format: "YYYY/MM/DD", slotProps: { textField: { fullWidth: true, required: true, error: !!errors.start_date, helperText: (_b = errors.start_date) === null || _b === void 0 ? void 0 : _b.message } } }));
                                                } }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(Controller, { name: "end_date", control: control, rules: {
                                                    required: 'تاريخ النهاية مطلوب',
                                                    validate: function (value) { return dayjs(value).isAfter(dayjs(control._getWatch('start_date'))) || 'تاريخ النهاية يجب أن يكون بعد البداية'; }
                                                }, render: function (_a) {
                                                    var _b;
                                                    var field = _a.field;
                                                    return (_jsx(DatePicker, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0646\u0647\u0627\u064A\u0629 *", value: field.value ? dayjs(field.value) : null, onChange: function (d) { var _a; return field.onChange((_a = d === null || d === void 0 ? void 0 : d.format('YYYY-MM-DD')) !== null && _a !== void 0 ? _a : null); }, format: "YYYY/MM/DD", slotProps: { textField: { fullWidth: true, required: true, error: !!errors.end_date, helperText: (_b = errors.end_date) === null || _b === void 0 ? void 0 : _b.message } } }));
                                                } }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(FormControlLabel, { control: _jsx(Controller, { name: "is_current", control: control, render: function (_a) {
                                                        var field = _a.field;
                                                        return _jsx(Switch, __assign({}, field, { checked: field.value }));
                                                    } }), label: "\u062A\u0639\u064A\u064A\u0646 \u0643\u0640 \u0639\u0627\u0645 \u062F\u0631\u0627\u0633\u064A \u062D\u0627\u0644\u064A\u061F (\u0633\u064A\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0623\u0639\u0648\u0627\u0645 \u0627\u0644\u0623\u062E\u0631\u0649 \u0644\u0646\u0641\u0633 \u0627\u0644\u0645\u062F\u0631\u0633\u0629)" }) })] })] }), _jsxs(DialogActions, { sx: { px: 3, pb: 2 }, children: [_jsx(Button, { onClick: onClose, color: "inherit", disabled: isSubmitting, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { type: "submit", variant: "contained", color: "primary", disabled: isSubmitting, children: isSubmitting ? _jsx(CircularProgress, { size: 22 }) : (isEditMode ? 'حفظ التعديلات' : 'إضافة') })] })] }) })] }));
};
export default AcademicYearForm;
