// src/components/layout/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { SidebarContent } from '../Sidebar'; // Import both Sidebar and SidebarContent
import NavbarArea from '@/components/layouts/NavbarArea';
import { Sheet, SheetContent } from "@/components/ui/sheet"; // For mobile sidebar
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MainLayout: React.FC = () => {
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
    const location = useLocation();

    // Close mobile sheet on route change
    useEffect(() => {
        setMobileSheetOpen(false);
    }, [location.pathname]);

    const handleMobileSheetToggle = () => {
        setMobileSheetOpen(!mobileSheetOpen);
    };

    return (
        <div className="flex min-h-screen w-full bg-muted/40" dir="rtl">
            {/* Desktop Sidebar Placeholder (Actual Sidebar is fixed) */}
            <div className={cn(
                "hidden md:block transition-all duration-300 ease-in-out",
                isDesktopCollapsed ? "w-16" : "w-60"
            )}>
                 {/* This is just a spacer. The actual sidebar is fixed positioned */}
            </div>
            
            {/* Actual Fixed Desktop Sidebar */}
            <Sidebar 
                isDesktopCollapsed={isDesktopCollapsed} 
                setIsDesktopCollapsed={setIsDesktopCollapsed}
            />

            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetContent side="right" className="p-0 w-[260px]" dir="rtl"> {/* RTL: side="right" */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileSheetOpen(false)}
                        className="absolute top-3 left-3 h-8 w-8 p-0 z-50" // RTL: left-3
                        aria-label="Close sidebar"
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <SidebarContent
                        isCollapsed={false} // Mobile sidebar is never "collapsed" in the same way
                        currentPathname={location.pathname}
                        onNavLinkClick={() => setMobileSheetOpen(false)} // Close on nav link click
                        showCollapseButton={false} // Don't show collapse button on mobile
                    />
                </SheetContent>
            </Sheet>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out">
                {/* Navbar Area */}
                <NavbarArea onMobileMenuToggle={handleMobileSheetToggle} />

                {/* Page Content */}
                <main className="flex-1 p-4 sm:px-6 sm:py-4 md:gap-8 overflow-y-auto"> {/* Changed to py-4 */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;