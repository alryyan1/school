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
import { jsx as _jsx } from "react/jsx-runtime";
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import axiosClient from '@/axios-client';
var AuthContext = createContext(undefined);
export var AuthProvider = function (_a) {
    var children = _a.children;
    var _b = useState({
        isAuthenticated: null,
        userRole: null,
        userId: null,
        userName: null,
        isLoading: true,
    }), state = _b[0], setState = _b[1];
    var enqueueSnackbar = useSnackbar().enqueueSnackbar;
    var checkAuth = useCallback(function (signal) { return __awaiter(void 0, void 0, void 0, function () {
        var token, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true })); });
                    console.log('check auth started');
                    token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                    if (!token) {
                        setState({
                            isAuthenticated: false,
                            userRole: null,
                            userId: null,
                            userName: null,
                            isLoading: false,
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    setState(function (prev) {
                        return __assign(__assign({}, prev), { isLoading: true });
                    });
                    return [4 /*yield*/, axiosClient.get('auth/verify', {
                            signal: signal
                        })];
                case 2:
                    response = _a.sent();
                    if (response.data.valid) {
                        console.log('user is valid');
                        setState({
                            isAuthenticated: true,
                            userRole: response.data.user.role,
                            userId: response.data.user.id.toString(),
                            userName: response.data.user.name,
                            isLoading: false,
                        });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.log(error_1, 'error inside check auth', 'error name', error_1.name);
                    if (error_1.name != 'CanceledError') {
                        setState({
                            isAuthenticated: false,
                            userRole: null,
                            userId: null,
                            userName: null,
                            isLoading: false,
                        });
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    var login = function (username, password, rememberMe) { return __awaiter(void 0, void 0, void 0, function () {
        var response, storage, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true })); });
                    return [4 /*yield*/, axiosClient.post('login', { username: username, password: password })];
                case 1:
                    response = _a.sent();
                    storage = rememberMe ? localStorage : sessionStorage;
                    storage.setItem('authToken', response.data.token);
                    axiosClient.defaults.headers.common['Authorization'] = "Bearer ".concat(response.data.token);
                    setState({
                        isAuthenticated: true,
                        userRole: response.data.user.role,
                        userId: response.data.user.id,
                        userName: response.data.user.name,
                        isLoading: false,
                    });
                    enqueueSnackbar('تم تسجيل الدخول بنجاح', { variant: 'success' });
                    return [2 /*return*/, true]; // Indicate success
                case 2:
                    error_2 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false })); });
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var logout = useCallback(function () {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        delete axiosClient.defaults.headers.common['Authorization'];
        setState({
            isAuthenticated: false,
            userRole: null,
            userId: null,
            userName: null,
            isLoading: false,
        });
        enqueueSnackbar('تم تسجيل الخروج بنجاح', { variant: 'success' });
    }, [enqueueSnackbar]);
    useEffect(function () {
        var controller = new AbortController();
        var authenticate = function () { return __awaiter(void 0, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, checkAuth(controller.signal)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Authentication error:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        authenticate();
        // Cleanup function
        return function () {
            controller.abort();
        };
    }, [checkAuth]);
    return (_jsx(AuthContext.Provider, { value: __assign(__assign({}, state), { login: login, logout: logout }), children: children }));
};
export var useAuth = function () {
    var context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
