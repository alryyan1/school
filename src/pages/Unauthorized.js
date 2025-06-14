import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Unauthorized.tsx
import { Button, Container, Typography, Box, useTheme } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/authcontext';
var Unauthorized = function () {
    var theme = useTheme();
    var navigate = useNavigate();
    var logout = useAuth().logout;
    return (_jsxs(Container, { maxWidth: "md", sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            py: 8,
            direction: 'rtl'
        }, children: [_jsx(Box, { sx: {
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    bgcolor: theme.palette.error.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 4
                }, children: _jsx(Typography, { variant: "h1", sx: {
                        color: theme.palette.error.contrastText,
                        fontSize: '3rem',
                        fontWeight: 700
                    }, children: "403" }) }), _jsx(Typography, { variant: "h4", component: "h1", gutterBottom: true, sx: { fontWeight: 700 }, children: "\u0644\u0627 \u062A\u0645\u062A\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644" }), _jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 4, maxWidth: 500 }, children: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0627\u0644\u0623\u0630\u0648\u0646\u0627\u062A \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062D\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0625\u0630\u0627 \u0643\u0646\u062A \u062A\u0639\u062A\u0642\u062F \u0623\u0646 \u0647\u0630\u0627 \u062E\u0637\u0623." }), _jsxs(Box, { sx: { display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(ArrowBack, {}), onClick: function () { return navigate(-1); }, sx: { px: 4, py: 1.5 }, children: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629" }), _jsx(Button, { variant: "outlined", component: Link, to: "/dashboard", startIcon: _jsx(Home, {}), sx: { px: 4, py: 1.5 }, children: "\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" })] }), _jsxs(Box, { sx: { mt: 6, color: theme.palette.text.secondary }, children: [_jsxs(Typography, { variant: "body2", children: ["\u0625\u0630\u0627 \u0627\u0633\u062A\u0645\u0631\u062A \u0627\u0644\u0645\u0634\u0643\u0644\u0629\u060C \u064A\u0631\u062C\u0649", ' ', _jsx(Link, { to: "/contact", style: {
                                    color: theme.palette.primary.main,
                                    textDecoration: 'none',
                                    fontWeight: 500
                                }, children: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A" })] }), _jsx(Button, { onClick: function () {
                            // alert('s')
                            logout();
                        }, children: "\u062A\u0633\u062C\u064A\u0644 \u062E\u0631\u0648\u062C" })] })] }));
};
export default Unauthorized;
