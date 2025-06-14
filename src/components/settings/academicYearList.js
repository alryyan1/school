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
// src/pages/settings/AcademicYearList.tsx
import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, CircularProgress, Alert, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon, RadioButtonUnchecked as RadioButtonUncheckedIcon, ArrowBack } from '@mui/icons-material';
import { useAcademicYearStore } from '@/stores/academicYearStore';
import { useSchoolStore } from '@/stores/schoolStore'; // Import school store
import AcademicYearForm from '@/components/settings/AcademicYearForm'; // Import the Form Dialog
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { NavLink } from 'react-router-dom';
var AcademicYearList = function () {
    var enqueueSnackbar = useSnackbar().enqueueSnackbar;
    var _a = useAcademicYearStore(), academicYears = _a.academicYears, loading = _a.loading, error = _a.error, fetchAcademicYears = _a.fetchAcademicYears, deleteAcademicYear = _a.deleteAcademicYear;
    var _b = useSchoolStore(), schools = _b.schools, fetchSchoolList = _b.fetchSchools, schoolsLoading = _b.loading; // Get schools and fetch function
    var _c = useState(false), formOpen = _c[0], setFormOpen = _c[1];
    var _d = useState(null), editingYear = _d[0], setEditingYear = _d[1];
    var _e = useState(false), deleteDialogOpen = _e[0], setDeleteDialogOpen = _e[1];
    var _f = useState(null), yearToDelete = _f[0], setYearToDelete = _f[1];
    var _g = useState(''), selectedSchoolFilter = _g[0], setSelectedSchoolFilter = _g[1]; // State for filter
    // Fetch schools on mount
    useEffect(function () {
        fetchSchoolList();
    }, [fetchSchoolList]);
    // Fetch academic years when filter changes or initially
    useEffect(function () {
        fetchAcademicYears(selectedSchoolFilter || undefined); // Pass filter value or undefined
    }, [selectedSchoolFilter, fetchAcademicYears]);
    var handleOpenForm = function (year) {
        setEditingYear(year || null);
        setFormOpen(true);
    };
    var handleCloseForm = function () {
        setFormOpen(false);
        setEditingYear(null);
    };
    var handleOpenDeleteDialog = function (year) {
        setYearToDelete(year);
        setDeleteDialogOpen(true);
    };
    var handleCloseDeleteDialog = function () {
        setYearToDelete(null);
        setDeleteDialogOpen(false);
    };
    var handleDeleteConfirm = function () { return __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!yearToDelete) return [3 /*break*/, 2];
                    return [4 /*yield*/, deleteAcademicYear(yearToDelete.id)];
                case 1:
                    success = _a.sent();
                    if (success)
                        enqueueSnackbar('تم حذف العام الدراسي بنجاح', { variant: 'success' });
                    else
                        enqueueSnackbar(useAcademicYearStore.getState().error || 'فشل حذف العام الدراسي', { variant: 'error' }); // Show specific error from store if delete fails
                    handleCloseDeleteDialog();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    // Handle filter change
    var handleFilterChange = function (event) {
        setSelectedSchoolFilter(event.target.value);
    };
    return (_jsxs(Container, { maxWidth: "lg", sx: { mt: 4, mb: 4, direction: 'rtl' }, children: [_jsx(NavLink, { to: '..', children: _jsx(ArrowBack, {}) }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }, children: [_jsx(Typography, { variant: "h4", component: "h1", children: "\u0627\u0644\u0623\u0639\u0648\u0627\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629" }), _jsxs(FormControl, { sx: { minWidth: 200 }, size: "small", children: [_jsx(InputLabel, { id: "school-filter-label", children: "\u062A\u0635\u0641\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0645\u062F\u0631\u0633\u0629" }), _jsxs(Select, { labelId: "school-filter-label", label: "\u062A\u0635\u0641\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0645\u062F\u0631\u0633\u0629", value: selectedSchoolFilter, onChange: handleFilterChange, disabled: schoolsLoading, children: [_jsx(MenuItem, { value: "", children: _jsx("em", { children: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u062F\u0627\u0631\u0633" }) }), schools.map(function (school) { return (_jsx(MenuItem, { value: school.id, children: school.name }, school.id)); })] })] }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: function () { return handleOpenForm(); }, children: "\u0625\u0636\u0627\u0641\u0629 \u0639\u0627\u0645 \u062F\u0631\u0627\u0633\u064A" })] }), loading && _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', p: 5 }, children: _jsx(CircularProgress, {}) }), !loading && error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), !loading && !error && (_jsx(Paper, { elevation: 2, children: _jsx(TableContainer, { children: _jsxs(Table, { sx: { minWidth: 650 }, "aria-label": "academic years table", children: [_jsx(TableHead, { sx: { bgcolor: 'grey.100' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A" }), _jsx(TableCell, { children: "\u0627\u0644\u0645\u062F\u0631\u0633\u0629" }), _jsx(TableCell, { align: "center", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629" }), _jsx(TableCell, { align: "center", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0646\u0647\u0627\u064A\u0629" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u062D\u0627\u0644\u064A\u061F" }), _jsx(TableCell, { align: "right", children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsxs(TableBody, { children: [academicYears.length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0639\u0648\u0627\u0645 \u062F\u0631\u0627\u0633\u064A\u0629 \u0644\u0639\u0631\u0636\u0647\u0627." }) })), academicYears.map(function (year) {
                                        var _a;
                                        return (_jsxs(TableRow, { hover: true, sx: { '&:last-child td, &:last-child th': { border: 0 } }, children: [_jsx(TableCell, { component: "th", scope: "row", children: year.name }), _jsx(TableCell, { children: ((_a = year.school) === null || _a === void 0 ? void 0 : _a.name) || 'N/A' }), " ", _jsx(TableCell, { align: "center", children: dayjs(year.start_date).format('YYYY/MM/DD') }), _jsx(TableCell, { align: "center", children: dayjs(year.end_date).format('YYYY/MM/DD') }), _jsx(TableCell, { align: "center", children: _jsx(Tooltip, { title: year.is_current ? 'العام الدراسي الحالي' : 'ليس العام الحالي', children: year.is_current ? _jsx(CheckCircleIcon, { color: "success" }) : _jsx(RadioButtonUncheckedIcon, { color: "disabled" }) }) }), _jsx(TableCell, { align: "right", children: _jsxs(Stack, { direction: "row", spacing: 1, justifyContent: "flex-end", children: [_jsx(Tooltip, { title: "\u062A\u0639\u062F\u064A\u0644", children: _jsx(IconButton, { size: "small", color: "primary", onClick: function () { return handleOpenForm(year); }, children: _jsx(EditIcon, { fontSize: "inherit" }) }) }), _jsx(Tooltip, { title: "\u062D\u0630\u0641", children: _jsx(IconButton, { size: "small", color: "error", onClick: function () { return handleOpenDeleteDialog(year); }, children: _jsx(DeleteIcon, { fontSize: "inherit" }) }) })] }) })] }, year.id));
                                    })] })] }) }) })), _jsx(AcademicYearForm, { open: formOpen, onClose: handleCloseForm, initialData: editingYear }), _jsxs(Dialog, { open: deleteDialogOpen, onClose: handleCloseDeleteDialog, children: [_jsx(DialogTitle, { children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" }), _jsx(DialogContent, { children: _jsxs(DialogContentText, { children: ["\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \"", yearToDelete === null || yearToDelete === void 0 ? void 0 : yearToDelete.name, "\"\u061F"] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseDeleteDialog, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleDeleteConfirm, color: "error", children: "\u062D\u0630\u0641" })] })] })] }));
};
export default AcademicYearList;
