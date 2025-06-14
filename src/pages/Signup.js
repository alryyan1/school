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
// src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Checkbox, FormControl, FormControlLabel, IconButton, InputAdornment, TextField, Typography, CircularProgress, Paper, useTheme } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import axiosClient from '@/axios-client';
import { useAuth } from '@/context/authcontext';
var Register = function () {
    var _a = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        agreeToTerms: false
    }), formData = _a[0], setFormData = _a[1];
    var _b = useState(false), showPassword = _b[0], setShowPassword = _b[1];
    var isLoading = useAuth().isLoading;
    var enqueueSnackbar = useSnackbar().enqueueSnackbar;
    var navigate = useNavigate();
    var theme = useTheme();
    var handleChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value, checked = _a.checked;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = name === 'agreeToTerms' ? checked : value, _a)));
        });
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1, errorMessage;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    // Validation
                    if (formData.password !== formData.confirmPassword) {
                        enqueueSnackbar('كلمة المرور غير متطابقة', { variant: 'error' });
                        return [2 /*return*/];
                    }
                    console.log(formData, 'formData');
                    if (!formData.agreeToTerms) {
                        enqueueSnackbar('يجب الموافقة على الشروط والأحكام', { variant: 'warning' });
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axiosClient.post('/register', {
                            name: formData.name,
                            username: formData.username,
                            email: formData.email,
                            password: formData.password,
                            password_confirmation: formData.confirmPassword,
                        })];
                case 2:
                    response = _c.sent();
                    enqueueSnackbar('تم إنشاء الحساب بنجاح', { variant: 'success' });
                    navigate('/auth/login');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _c.sent();
                    errorMessage = 'فشل في التسجيل';
                    if (axios.isAxiosError(error_1)) {
                        errorMessage = ((_b = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || errorMessage;
                    }
                    enqueueSnackbar(errorMessage, { variant: 'error' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (_jsx(Box, { sx: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, #f5f7fa 0%, #e4f0fd 100%)'
                : theme.palette.background.default,
            p: 2,
            direction: 'rtl'
        }, children: _jsxs(Paper, { elevation: 3, sx: {
                p: 4,
                width: '100%',
                maxWidth: 500,
                borderRadius: 2
            }, children: [_jsx(Typography, { variant: "h4", component: "h1", align: "center", gutterBottom: true, sx: { fontWeight: 700 }, children: "\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628 \u062C\u062F\u064A\u062F" }), _jsx(Typography, { variant: "body1", color: "textSecondary", align: "center", sx: { mb: 4 }, children: "\u0623\u062F\u062E\u0644 \u0645\u0639\u0644\u0648\u0645\u0627\u062A\u0643 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0644\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628" }), _jsxs(Box, { component: "form", onSubmit: handleSubmit, sx: { mt: 2 }, children: [_jsx(FormControl, { fullWidth: true, sx: { mb: 3 }, children: _jsx(TextField, { label: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644", name: "name", value: formData.name, onChange: handleChange, required: true, autoComplete: "name", autoFocus: true, variant: "outlined", InputProps: {
                                    sx: { borderRadius: 1 }
                                } }) }), _jsx(FormControl, { fullWidth: true, sx: { mb: 3 }, children: _jsx(TextField, { label: "\u0627\u0633\u0645 \u0627\u0644\u062F\u062E\u0648\u0644", name: "username", value: formData.username, onChange: handleChange, required: true, autoComplete: "username", autoFocus: true, variant: "outlined", InputProps: {
                                    sx: { borderRadius: 1 }
                                } }) }), _jsx(FormControl, { fullWidth: true, sx: { mb: 3 }, children: _jsx(TextField, { label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", type: "email", name: "email", value: formData.email, onChange: handleChange, required: true, autoComplete: "email", variant: "outlined", InputProps: {
                                    sx: { borderRadius: 1 }
                                } }) }), _jsx(FormControl, { fullWidth: true, sx: { mb: 2 }, children: _jsx(TextField, { label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", type: showPassword ? 'text' : 'password', name: "password", value: formData.password, onChange: handleChange, required: true, autoComplete: "new-password", variant: "outlined", InputProps: {
                                    sx: { borderRadius: 1 },
                                    endAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(IconButton, { onClick: function () { return setShowPassword(!showPassword); }, edge: "end", children: showPassword ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }) }))
                                } }) }), _jsx(FormControl, { fullWidth: true, sx: { mb: 2 }, children: _jsx(TextField, { label: "\u062A\u0623\u0643\u064A\u062F \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", type: showPassword ? 'text' : 'password', name: "confirmPassword", value: formData.confirmPassword, onChange: handleChange, required: true, variant: "outlined", InputProps: {
                                    sx: { borderRadius: 1 }
                                } }) }), _jsx(FormControlLabel, { control: _jsx(Checkbox, { name: "agreeToTerms", checked: formData.agreeToTerms, onChange: handleChange, color: "primary" }), label: _jsxs(Typography, { variant: "body2", children: ["\u0623\u0648\u0627\u0641\u0642 \u0639\u0644\u0649", ' ', _jsx(Link, { to: "/terms", style: { color: theme.palette.primary.main }, children: "\u0627\u0644\u0634\u0631\u0648\u0637 \u0648\u0627\u0644\u0623\u062D\u0643\u0627\u0645" })] }), sx: { mb: 3 } }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", size: "large", disabled: isLoading, sx: {
                                py: 1.5,
                                borderRadius: 1,
                                fontSize: '1rem'
                            }, children: isLoading ? (_jsx(CircularProgress, { size: 24, color: "inherit" })) : ('تسجيل الحساب') }), _jsx(Box, { sx: { mt: 3, textAlign: 'center' }, children: _jsxs(Typography, { variant: "body2", children: ["\u0644\u062F\u064A\u0643 \u062D\u0633\u0627\u0628 \u0628\u0627\u0644\u0641\u0639\u0644\u061F", _jsx(Link, { to: "/auth/login", style: { fontWeight: 600, textDecoration: 'none' }, children: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" })] }) })] })] }) }));
};
export default Register;
