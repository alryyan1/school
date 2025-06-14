import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/MainLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { SidebarContent } from './Sidebar'; // Import both Sidebar and SidebarContent
import NavbarArea from '@/components/layouts/NavbarArea';
import { Sheet, SheetContent } from "@/components/ui/sheet"; // For mobile sidebar
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
var MainLayout = function () {
    var _a = useState(false), isDesktopCollapsed = _a[0], setIsDesktopCollapsed = _a[1];
    var _b = useState(false), mobileSheetOpen = _b[0], setMobileSheetOpen = _b[1];
    var location = useLocation();
    // Close mobile sheet on route change
    useEffect(function () {
        setMobileSheetOpen(false);
    }, [location.pathname]);
    var handleMobileSheetToggle = function () {
        setMobileSheetOpen(!mobileSheetOpen);
    };
    return (_jsxs("div", { className: "flex min-h-screen w-full bg-muted/40", dir: "rtl", children: [_jsx("div", { className: cn("hidden md:block transition-all duration-300 ease-in-out", isDesktopCollapsed ? "w-16" : "w-60") }), _jsx(Sidebar, { isDesktopCollapsed: isDesktopCollapsed, setIsDesktopCollapsed: setIsDesktopCollapsed }), _jsx(Sheet, { open: mobileSheetOpen, onOpenChange: setMobileSheetOpen, children: _jsxs(SheetContent, { side: "right", className: "p-0 w-[260px]", dir: "rtl", children: [" ", _jsx(Button, { variant: "ghost", size: "sm", onClick: function () { return setMobileSheetOpen(false); }, className: "absolute top-3 left-3 h-8 w-8 p-0 z-50" // RTL: left-3
                            , "aria-label": "Close sidebar", children: _jsx(X, { className: "h-4 w-4 text-muted-foreground" }) }), _jsx(SidebarContent, { isCollapsed: false, currentPathname: location.pathname, onNavLinkClick: function () { return setMobileSheetOpen(false); }, showCollapseButton: false })] }) }), _jsxs("div", { className: "flex flex-col flex-1 transition-all duration-300 ease-in-out", children: [_jsx(NavbarArea, { onMobileMenuToggle: handleMobileSheetToggle }), _jsxs("main", { className: "flex-1 p-4 sm:px-6 sm:py-4 md:gap-8 overflow-y-auto", children: [" ", _jsx(Outlet, {})] })] })] }));
};
export default MainLayout;
