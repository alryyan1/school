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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// src/stores/studentEnrollmentStore.ts
import { create } from 'zustand';
import { StudentAcademicYearApi } from '@/api/studentAcademicYearApi';
var initialState = { enrollments: [], enrollableStudents: [], loading: false, loadingEnrollable: false, error: null, isSearchResult: false };
export var useStudentEnrollmentStore = create(function (set, get) { return (__assign(__assign({}, initialState), { 
    // --- NEW SEARCH ACTION ---
    searchEnrollments: function (searchTerm) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1, msg;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!searchTerm || searchTerm.trim() === '') {
                        // If search term is empty, potentially clear results or revert to filtered view
                        get().clearEnrollments(); // Clear results if search term is empty
                        // Or trigger fetchEnrollments with current filters? Needs filter state access.
                        // For now, just clear.
                        return [2 /*return*/];
                    }
                    set({ loading: true, error: null, isSearchResult: true }); // Set search flag true
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, StudentAcademicYearApi.search(searchTerm)];
                case 2:
                    response = _c.sent();
                    set({ enrollments: response.data.data, loading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _c.sent();
                    console.error("Search Enrollments error:", error_1);
                    msg = ((_b = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل البحث عن تسجيلات الطلاب';
                    set({ error: msg, loading: false, enrollments: [] }); // Clear on error
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, fetchEnrollments: function (filters) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2, msg;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!filters.school_id || !filters.academic_year_id) {
                        set({ enrollments: [], loading: false, error: 'الرجاء تحديد المدرسة والعام الدراسي.' });
                        return [2 /*return*/];
                    }
                    set({ loading: true, error: null });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, StudentAcademicYearApi.getAll(filters)];
                case 2:
                    response = _c.sent();
                    set({ enrollments: response.data.data, loading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _c.sent();
                    msg = ((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل جلب تسجيلات الطلاب';
                    set({ error: msg, loading: false, enrollments: [] }); // Clear on error
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, fetchEnrollableStudents: function (academicYearId, schoolId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3, msg;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    set({ loadingEnrollable: true, error: null });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, StudentAcademicYearApi.getEnrollableStudents(academicYearId, schoolId)];
                case 2:
                    response = _c.sent();
                    set({ enrollableStudents: response.data.data, loadingEnrollable: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _c.sent();
                    msg = ((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل جلب الطلاب المتاحين للتسجيل';
                    set({ error: msg, loadingEnrollable: false, enrollableStudents: [] }); // Clear on error
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, enrollStudent: function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var response, newEnrollment_1, error_4, msg;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, StudentAcademicYearApi.create(data)];
                case 1:
                    response = _c.sent();
                    newEnrollment_1 = response.data.data;
                    set(function (state) { return ({
                        enrollments: __spreadArray(__spreadArray([], state.enrollments, true), [newEnrollment_1], false)
                    }); });
                    // Refetch available students as one has been removed from the list
                    //when using get() retrieve the current state and doesnt make rerender
                    get().fetchEnrollableStudents(data.academic_year_id, data.school_id);
                    return [2 /*return*/, newEnrollment_1];
                case 2:
                    error_4 = _c.sent();
                    console.error("Enroll Student error:", error_4);
                    msg = ((_b = (_a = error_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل تسجيل الطالب';
                    set({ error: msg }); // Set error state for potential display elsewhere
                    throw new Error(msg); // Re-throw for form handling
                case 3: return [2 /*return*/];
            }
        });
    }); }, updateEnrollment: function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
        var response, updatedEnrollment_1, error_5, msg;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, StudentAcademicYearApi.update(id, data)];
                case 1:
                    response = _c.sent();
                    updatedEnrollment_1 = response.data.data;
                    set(function (state) { return ({
                        enrollments: state.enrollments.map(function (e) { return (e.id === id ? updatedEnrollment_1 : e); }),
                    }); });
                    return [2 /*return*/, updatedEnrollment_1];
                case 2:
                    error_5 = _c.sent();
                    console.error("Update Enrollment error:", error_5);
                    msg = ((_b = (_a = error_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل تحديث تسجيل الطالب';
                    set({ error: msg });
                    throw new Error(msg);
                case 3: return [2 /*return*/];
            }
        });
    }); }, deleteEnrollment: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var deletedEnrollment, error_6, msg;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    deletedEnrollment = get().enrollments.find(function (e) { return e.id === id; });
                    return [4 /*yield*/, StudentAcademicYearApi.delete(id)];
                case 1:
                    _c.sent();
                    set(function (state) { return ({
                        enrollments: state.enrollments.filter(function (e) { return e.id !== id; }),
                    }); });
                    // Refetch enrollable students using context from deleted item
                    if (deletedEnrollment) {
                        get().fetchEnrollableStudents(deletedEnrollment.academic_year_id, deletedEnrollment.school_id);
                    }
                    return [2 /*return*/, true];
                case 2:
                    error_6 = _c.sent();
                    console.error("Delete Enrollment error:", error_6);
                    msg = ((_b = (_a = error_6.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل حذف تسجيل الطالب';
                    set({ error: msg });
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); }, clearEnrollments: function () { return set({ enrollments: [], error: null }); }, clearEnrollableStudents: function () { return set({ enrollableStudents: [] }); }, fetchAllEnrollments: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    set({ loading: true, error: null });
                    return [4 /*yield*/, StudentAcademicYearApi.getAllStudentAcademicYear()];
                case 1:
                    response = _a.sent();
                    set({ enrollments: response.data });
                    return [3 /*break*/, 4];
                case 2:
                    error_7 = _a.sent();
                    console.log(error_7);
                    set({ loading: false, error: error_7.toString() });
                    throw new Error(error_7);
                case 3:
                    set({ loading: false });
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); } })); });
