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
// src/stores/studentStore.ts
import { create } from "zustand";
import { StudentApi } from "@/api/studentApi";
var initialState = {
    students: [],
    currentStudent: null,
    loading: false,
    error: null,
};
export var useStudentStore = create(function (set) { return (__assign(__assign({}, initialState), { fetchStudents: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ loading: true, error: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, StudentApi.getAll()];
                case 2:
                    response = _a.sent();
                    console.log(response.data, "students data");
                    set({ students: response.data.data, loading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    set({ error: "Failed to fetch students", loading: false });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, getStudentById: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ loading: true, error: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, StudentApi.getById(id)];
                case 2:
                    response = _a.sent();
                    set({ currentStudent: response.data.data, loading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    set({ error: "Failed to fetch student", loading: false });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, createStudent: function (student) { return __awaiter(void 0, void 0, void 0, function () {
        var response_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ loading: true, error: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, StudentApi.create(student)];
                case 2:
                    response_1 = _a.sent();
                    set(function (state) { return ({
                        students: __spreadArray(__spreadArray([], state.students, true), [response_1.data], false),
                        loading: false,
                    }); });
                    return [2 /*return*/, response_1.data];
                case 3:
                    error_3 = _a.sent();
                    set({ error: "Failed to create student", loading: false });
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    }); }, updateStudent: function (id, student) { return __awaiter(void 0, void 0, void 0, function () {
        var response_2, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ loading: true, error: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, StudentApi.update(id, student)];
                case 2:
                    response_2 = _a.sent();
                    set(function (state) { return ({
                        students: state.students.map(function (s) {
                            return s.id === id ? __assign(__assign({}, s), response_2.data) : s;
                        }),
                        currentStudent: response_2.data,
                        loading: false,
                    }); });
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    set({
                        error: "Failed to update student ".concat(error_4.toString(), " "),
                        loading: false,
                    });
                    throw error_4;
                case 4: return [2 /*return*/];
            }
        });
    }); }, deleteStudent: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    set({ loading: true, error: null });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, StudentApi.delete(id)];
                case 2:
                    _a.sent();
                    set(function (state) { return ({
                        students: state.students.filter(function (s) { return s.id !== id; }),
                        loading: false,
                    }); });
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    set({ error: "Failed to delete student", loading: false });
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    }); }, resetCurrentStudent: function () {
        set({ currentStudent: null });
    }, 
    // --- NEW ACTION IMPLEMENTATION ---
    updateStudentPhoto: function (id, photo) { return __awaiter(void 0, void 0, void 0, function () {
        var response, updatedStudent_1, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, StudentApi.updatePhoto(id, photo)];
                case 1:
                    response = _a.sent();
                    updatedStudent_1 = response.data.data;
                    // Update the current student in the store immediately
                    set(function (state) {
                        var _a;
                        return ({
                            currentStudent: ((_a = state.currentStudent) === null || _a === void 0 ? void 0 : _a.id) === id ? updatedStudent_1 : state.currentStudent,
                            // Optionally update the student in the main list as well
                            // students: state.students.map(s => s.id === id ? updatedStudent : s),
                        });
                    });
                    return [2 /*return*/, true]; // Indicate success
                case 2:
                    error_6 = _a.sent();
                    console.error("Failed to update photo for student ".concat(id, ":"), error_6);
                    // We'll let the component handle showing the error via snackbar
                    // You could set the store error state here too if desired:
                    // set({ error: error.response?.data?.message || 'فشل تحديث الصورة' });
                    return [2 /*return*/, false]; // Indicate failure
                case 3: return [2 /*return*/];
            }
        });
    }); } })); });
