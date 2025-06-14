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
// src/stores/teacherStore.ts
import { create } from 'zustand';
import { TeacherApi } from '@/api/teacherApi';
var initialState = {
    teachers: [],
    currentTeacher: null,
    loading: false,
    error: null,
    pagination: null,
};
export var useTeacherStore = create(function (set, get) { return (__assign(__assign({}, initialState), { fetchTeachers: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (page) {
            var response, error_1, message;
            var _a, _b;
            if (page === void 0) { page = 1; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        set({ loading: true, error: null });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, TeacherApi.getAll(page)];
                    case 2:
                        response = _c.sent();
                        set({
                            teachers: response.data.data,
                            pagination: {
                                currentPage: response.data.meta.current_page,
                                lastPage: response.data.meta.last_page,
                                total: response.data.meta.total,
                                perPage: response.data.meta.per_page,
                            },
                            loading: false,
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        console.error("Failed to fetch teachers:", error_1);
                        message = ((_b = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل في جلب بيانات المدرسين';
                        set({ error: message, loading: false });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }, getTeacherById: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    set({ loading: true, error: null, currentTeacher: null }); // Reset current on fetch
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, TeacherApi.getById(id)];
                case 2:
                    response = _c.sent();
                    set({ currentTeacher: response.data, loading: false });
                    return [2 /*return*/, response.data];
                case 3:
                    error_2 = _c.sent();
                    console.error("Failed to fetch teacher ".concat(id, ":"), error_2);
                    message = ((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل في جلب بيانات المدرس';
                    set({ error: message, loading: false });
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); }, createTeacher: function (teacher) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    set({ loading: true, error: null });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, TeacherApi.create(teacher)];
                case 2:
                    response = _c.sent();
                    // Optionally refetch the list or add manually
                    // get().fetchTeachers(); // Refetch current page after add
                    set(function (state) { return ({
                        // Simple add might put it out of pagination order, refetch is safer
                        // teachers: [...state.teachers, response.data], // Add manually (less ideal with pagination)
                        loading: false
                    }); });
                    return [2 /*return*/, response.data];
                case 3:
                    error_3 = _c.sent();
                    console.error("Failed to create teacher:", error_3);
                    message = ((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل في إضافة المدرس';
                    set({ error: message, loading: false });
                    // Re-throw might be useful for form handling
                    // throw new Error(message);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); }, updateTeacher: function (id, teacher) { return __awaiter(void 0, void 0, void 0, function () {
        var response_1, error_4, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    set({ loading: true, error: null });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, TeacherApi.update(id, teacher)];
                case 2:
                    response_1 = _c.sent();
                    set(function (state) {
                        var _a;
                        return ({
                            teachers: state.teachers.map(function (t) {
                                return t.id === id ? __assign(__assign({}, t), response_1.data) : t;
                            } // Update in list
                            ),
                            currentTeacher: ((_a = state.currentTeacher.data) === null || _a === void 0 ? void 0 : _a.id) === id ? response_1.data : state.currentTeacher, // Update current if viewing
                            loading: false,
                        });
                    });
                    return [2 /*return*/, response_1.data];
                case 3:
                    error_4 = _c.sent();
                    console.error("Failed to update teacher ".concat(id, ":"), error_4);
                    message = ((_b = (_a = error_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل في تحديث بيانات المدرس';
                    set({ error: message, loading: false });
                    // throw new Error(message);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); }, deleteTeacher: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    set({ loading: true, error: null });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, TeacherApi.delete(id)];
                case 2:
                    _c.sent();
                    set(function (state) {
                        var _a;
                        return ({
                            teachers: state.teachers.filter(function (t) { return t.id !== id; }), // Remove from list
                            currentTeacher: ((_a = state.currentTeacher) === null || _a === void 0 ? void 0 : _a.id) === id ? null : state.currentTeacher, // Clear if current deleted
                            loading: false,
                        });
                    });
                    return [2 /*return*/, true]; // Indicate success
                case 3:
                    error_5 = _c.sent();
                    console.error("Failed to delete teacher ".concat(id, ":"), error_5);
                    message = ((_b = (_a = error_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل في حذف المدرس';
                    set({ error: message, loading: false });
                    return [2 /*return*/, false]; // Indicate failure
                case 4: return [2 /*return*/];
            }
        });
    }); }, resetCurrentTeacher: function () {
        set({ currentTeacher: null });
    } })); });
