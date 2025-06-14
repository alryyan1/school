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
// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Box, Button, Checkbox, FormControl, FormControlLabel, IconButton, InputAdornment, TextField, Typography, CircularProgress, Paper, useTheme } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/context/authcontext';
var Login = function () {
    var _a, _b;
    var _c = useState(''), username = _c[0], setUsername = _c[1];
    var _d = useState(''), password = _d[0], setPassword = _d[1];
    var location = useLocation();
    var _e = useState(false), rememberMe = _e[0], setRememberMe = _e[1];
    var _f = useState(false), showPassword = _f[0], setShowPassword = _f[1];
    var _g = useAuth(), login = _g.login, isLoading = _g.isLoading;
    var enqueueSnackbar = useSnackbar().enqueueSnackbar;
    var theme = useTheme();
    var navigate = useNavigate();
    // Determine where to redirect after login
    // Check if state and state.from exist, otherwise default to '/dashboard'
    var from = ((_b = (_a = location.state) === null || _a === void 0 ? void 0 : _a.from) === null || _b === void 0 ? void 0 : _b.pathname) || "/dashboard";
    console.log(from, 'from');
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!username || !password) {
                        enqueueSnackbar('يرجى إدخال اسم المستخدم  وكلمة المرور', { variant: 'warning' });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, login(username, password, rememberMe)];
                case 2:
                    _a.sent();
                    // Navigate to the 'from' path instead of hardcoding '/dashboard'
                    navigate(from, { replace: true });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    errorMessage = 'فشل تسجيل الدخول';
                    if (error_1.response) {
                        switch (error_1.response.status) {
                            case 401:
                                errorMessage = ' اسم المستخدم أو كلمة المرور غير صحيحة';
                                break;
                            case 403:
                                errorMessage = 'حسابك غير مفعل، يرجى التواصل مع المسؤول';
                                break;
                            case 429:
                                errorMessage = 'محاولات تسجيل دخول كثيرة، يرجى الانتظار';
                                break;
                        }
                    }
                    enqueueSnackbar(errorMessage, {
                        variant: 'error',
                        autoHideDuration: 5000
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (_jsxs(Paper, { elevation: 3, sx: {
            p: 4,
            width: '100%',
            maxWidth: 450,
            borderRadius: 2
        }, children: [_jsx(Typography, { variant: "h4", component: "h1", align: "center", gutterBottom: true, sx: { fontWeight: 700 }, children: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" }), _jsx(Typography, { variant: "body1", color: "textSecondary", align: "center", sx: { mb: 4 }, children: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643" }), _jsxs(Box, { component: "form", onSubmit: handleSubmit, sx: { mt: 2 }, children: [_jsx(FormControl, { fullWidth: true, sx: { mb: 3 }, children: _jsx(TextField, { label: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 ", type: "username", value: username, onChange: function (e) { return setUsername(e.target.value); }, required: true, autoComplete: "username", autoFocus: true, variant: "outlined", InputProps: {
                                sx: { borderRadius: 1 }
                            } }) }), _jsx(FormControl, { fullWidth: true, sx: { mb: 2 }, children: _jsx(TextField, { label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", type: showPassword ? 'text' : 'password', value: password, onChange: function (e) { return setPassword(e.target.value); }, required: true, autoComplete: "current-password", variant: "outlined", InputProps: {
                                sx: { borderRadius: 1 },
                                endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: function () { return setShowPassword(!showPassword); }, edge: "end", children: showPassword ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }) }))
                            } }) }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }, children: [_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: rememberMe, onChange: function (e) { return setRememberMe(e.target.checked); }, color: "primary" }), label: "\u062A\u0630\u0643\u0631\u0646\u064A" }), _jsx(Link, { to: "/forgot-password", style: { textDecoration: 'none' }, children: _jsx(Typography, { variant: "body2", color: "primary", children: "\u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061F" }) })] }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", size: "large", disabled: isLoading, sx: {
                            py: 1.5,
                            borderRadius: 1,
                            fontSize: '1rem'
                        }, children: isLoading ? (_jsx(CircularProgress, { size: 4, color: "inherit" })) : ('تسجيل الدخول') }), _jsx(Box, { sx: { mt: 3, textAlign: 'center' }, children: _jsxs(Typography, { variant: "body2", children: ["\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u062D\u0633\u0627\u0628\u061F", ' ', _jsx(Link, { to: "/auth/register", style: { fontWeight: 600, textDecoration: 'none' }, children: "\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628 \u062C\u062F\u064A\u062F" })] }) })] })] }));
};
export default Login;
