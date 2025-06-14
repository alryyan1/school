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
// src/stores/gradeLevelStore.ts
import { create } from 'zustand';
import { GradeLevelApi } from '@/api/gradeLevelApi';
var initialState = { gradeLevels: [], loading: false, error: null };
export var useGradeLevelStore = create(function (set, get) { return (__assign(__assign({}, initialState), { fetchGradeLevels: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    set({ loading: true, error: null });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, GradeLevelApi.getAll()];
                case 2:
                    response = _c.sent();
                    set({ gradeLevels: response.data.data, loading: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _c.sent();
                    message = ((_b = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل جلب المراحل الدراسية';
                    set({ error: message, loading: false });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, createGradeLevel: function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var response, newGradeLevel_1, error_2, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, GradeLevelApi.create(data)];
                case 1:
                    response = _c.sent();
                    newGradeLevel_1 = response.data.data;
                    set(function (state) { return ({
                        gradeLevels: __spreadArray(__spreadArray([], state.gradeLevels, true), [newGradeLevel_1], false).sort(function (a, b) { return a.name.localeCompare(b.name); }), // Add and sort
                    }); });
                    return [2 /*return*/, newGradeLevel_1];
                case 2:
                    error_2 = _c.sent();
                    console.error("Create GradeLevel error:", error_2);
                    message = ((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل إضافة المرحلة';
                    set({ error: message });
                    throw new Error(message);
                case 3: return [2 /*return*/];
            }
        });
    }); }, updateGradeLevel: function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
        var response, updatedGradeLevel_1, error_3, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, GradeLevelApi.update(id, data)];
                case 1:
                    response = _c.sent();
                    updatedGradeLevel_1 = response.data.data;
                    set(function (state) { return ({
                        gradeLevels: state.gradeLevels.map(function (gl) {
                            return gl.id === id ? updatedGradeLevel_1 : gl;
                        }).sort(function (a, b) { return a.name.localeCompare(b.name); }), // Update and sort
                    }); });
                    return [2 /*return*/, updatedGradeLevel_1];
                case 2:
                    error_3 = _c.sent();
                    console.error("Update GradeLevel error:", error_3);
                    message = ((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل تحديث المرحلة';
                    set({ error: message });
                    throw new Error(message);
                case 3: return [2 /*return*/];
            }
        });
    }); }, deleteGradeLevel: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4, message;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, GradeLevelApi.delete(id)];
                case 1:
                    _c.sent();
                    set(function (state) { return ({
                        gradeLevels: state.gradeLevels.filter(function (gl) { return gl.id !== id; }),
                    }); });
                    return [2 /*return*/, true];
                case 2:
                    error_4 = _c.sent();
                    console.error("Delete GradeLevel error:", error_4);
                    message = ((_b = (_a = error_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'فشل حذف المرحلة';
                    set({ error: message }); // Set error in store for potential display
                    return [2 /*return*/, false]; // Indicate failure
                case 3: return [2 /*return*/];
            }
        });
    }); } })); });
