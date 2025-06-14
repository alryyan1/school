import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/AuthLayout.tsx
import { Box, Container, CssBaseline, ThemeProvider, Typography, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import { arSA } from '@mui/material/locale';
import { CacheProvider } from '@emotion/react';
import { cacheRtl } from '../constants';
var AuthLayout = function () {
    var theme = useTheme();
    // Create RTL theme override for auth pages
    var rtlTheme = createTheme({
        direction: 'rtl',
        palette: {
            background: {
                default: '#f5f5f5',
            },
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                    },
                },
            },
        },
    }, arSA);
    return (_jsx(CacheProvider, { value: cacheRtl, children: _jsx(ThemeProvider, { theme: rtlTheme, children: _jsxs(Box, { sx: {
                    display: 'flex',
                    minHeight: '100vh',
                    backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #e4f0fd 100%)',
                    backgroundAttachment: 'fixed',
                }, children: [_jsx(CssBaseline, {}), _jsx(Box, { sx: {
                            flex: 1,
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(to bottom, #1976d2, #115293)',
                            p: 4,
                        }, children: _jsxs(Box, { sx: { maxWidth: 500, textAlign: 'center', color: 'white' }, children: [_jsx(Typography, { variant: "h3", gutterBottom: true, sx: { fontWeight: 700 }, children: "\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0637\u0644\u0627\u0628" }), _jsx(Typography, { variant: "h6", children: "\u0646\u0638\u0627\u0645 \u0645\u062A\u0643\u0627\u0645\u0644 \u0644\u0625\u062F\u0627\u0631\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629" })] }) }), _jsxs(Container, { maxWidth: "sm", sx: {
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            py: 2,
                        }, children: [_jsxs(Box, { sx: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }, children: [_jsx(Outlet, {}), " "] }), _jsx(Box, { sx: { mt: 4, textAlign: 'center' }, children: _jsxs(Typography, { variant: "body2", color: "textSecondary", children: ["\u00A9 ", new Date().getFullYear(), " \u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062F\u0627\u0631\u0633 - \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629"] }) })] })] }) }) }));
};
export default AuthLayout;
