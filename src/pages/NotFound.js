import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Typography, Box, Button, styled } from '@mui/material';
import { Link } from 'react-router-dom';
var StyledContainer = styled(Box)(function (_a) {
    var theme = _a.theme;
    return ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // Take up the full viewport height
        textAlign: 'center',
        padding: theme.spacing(3),
        direction: 'rtl', // Set direction to rtl
    });
});
var NotFound = function () {
    return (_jsxs(StyledContainer, { children: [_jsx(Typography, { variant: "h4", component: "h1", gutterBottom: true, children: "404 - \u0627\u0644\u0635\u0641\u062D\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" }), _jsx(Typography, { variant: "body1", paragraph: true, children: "\u0639\u0630\u0631\u064B\u0627\u060C \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u062A\u064A \u062A\u0628\u062D\u062B \u0639\u0646\u0647\u0627." }), _jsx(Button, { variant: "contained", color: "primary", component: Link, to: "/", children: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" })] }));
};
export default NotFound;
