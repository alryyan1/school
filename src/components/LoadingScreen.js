import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/LoadingScreen.tsx
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
var LoadingScreen = function () {
    var theme = useTheme();
    return (_jsxs(Box, { sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            // backgroundColor: theme.palette.background.default,
            gap: 2,
            direction: 'rtl'
        }, children: [_jsx(CircularProgress, { size: 60, thickness: 4, sx: {
                    color: theme.palette.primary.main,
                    animationDuration: '1000ms' // Slower animation
                } }), _jsx(Typography, { variant: "h6", sx: {
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                    mt: 2
                }, children: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644..." }), _jsx(Typography, { variant: "body2", sx: {
                    color: theme.palette.text.secondary,
                    maxWidth: '300px',
                    textAlign: 'center'
                }, children: "\u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A" })] }));
};
export default LoadingScreen;
