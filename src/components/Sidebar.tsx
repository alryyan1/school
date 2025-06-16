// src/components/layout/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils"; // Your shadcn/ui utility
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator"; // For visual separation

// lucide-react icons
import {
    ChevronRight, ChevronLeft,
    LayoutDashboard, Building2, Users, GraduationCap, UserCheck, Car, Settings,
    CalendarDays, Milestone, Library, Network, ClipboardCheck,
    School // For SchoolGradeLevels (already imported)
} from 'lucide-react';
import { MenuBook } from '@mui/icons-material';

// Define Menu Item Structure
interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    subItems?: NavItem[];
}

const mainNavItems: NavItem[] = [
    { label: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
    { label: 'إدارة المدارس', href: '/schools/list', icon: Building2 },
    { label: 'شؤون المعلمين', href: '/teachers/list', icon: GraduationCap },
    { label: 'شؤون الطلاب', href: '/students', icon: Users },
    { label: 'الامتحانات', href: '/exams', icon: ClipboardCheck },
    { label: 'المناهج', href: '/curriculum', icon: MenuBook },
];

const settingsNavItems: NavItem[] = [
    { label: 'الإعدادات الرئيسية', href: '/settings', icon: Settings },
    { label: 'الأعوام الدراسية', href: '/settings/academic-years', icon: CalendarDays },
    { label: 'المراحل الدراسية', href: '/settings/grade-levels', icon: Milestone },
    { label: 'المواد التعليمية', href: '/settings/subjects', icon: Library },
    { label: 'الفصول الدراسية', href: '/settings/classrooms', icon: Network },
    { label: 'مراحل المدرسة', href: '/settings/school-grades', icon: School }, // Using School icon from lucide
    { label: 'إدارة المستخدمين', href: '/settings/users', icon: Users },
];


interface SidebarProps {
    isDesktopCollapsed: boolean;
    setIsDesktopCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContent: React.FC<{ 
    isCollapsed: boolean; 
    onNavLinkClick?: () => void; 
    currentPathname: string;
    onCollapseToggle?: () => void;
    showCollapseButton?: boolean;
}> = ({
    isCollapsed, onNavLinkClick, currentPathname, onCollapseToggle, showCollapseButton = false
}) => {
    const [openSettings, setOpenSettings] = useState(false);

    useEffect(() => {
        setOpenSettings(currentPathname.startsWith('/settings'));
    }, [currentPathname]);

    const NavLink: React.FC<{ item: NavItem; isCollapsed: boolean; isSubItem?: boolean; onClick?: () => void }> =
    ({ item, isCollapsed, isSubItem = false, onClick }) => {
        const isActive = currentPathname === item.href || (item.href !== '/' && currentPathname.startsWith(item.href) && !item.subItems);
        const Icon = item.icon;

        return (
            <Link to={item.href} className="block" onClick={onClick}>
                <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                        "w-full flex  justify-between h-9 sm:h-10 text-sm sm:text-base", // Adjusted height and text size
                        isCollapsed ? "px-2" : "px-3",
                        isSubItem && !isCollapsed ? "pr-7" : "" // RTL: pr for indent
                    )}
                    title={item.label} // Tooltip for collapsed state
                >
                    <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", isCollapsed ? "" : "ml-2")} /> {/* RTL: ml for margin */}
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Button>
            </Link>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header / Logo Area with Collapse Button */}
            <div className={cn(
                "flex items-center border-b h-14 px-4", // Reduced height
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                {!isCollapsed && (
                    <Link to="/" className="flex items-center gap-2" onClick={onNavLinkClick}>
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span className="font-bold text-md text-foreground">إدارة المدارس</span>
                    </Link>
                )}
                
                {/* Collapse Button - only show on desktop */}
                {showCollapseButton && onCollapseToggle && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCollapseToggle}
                        className={cn(
                            "h-8 w-8 p-0",
                            isCollapsed && "mx-auto" // Center when collapsed
                        )}
                        title={isCollapsed ? "توسيع الشريط الجانبي" : "طي الشريط الجانبي"}
                    >
                        {isCollapsed ? (
                            <ChevronLeft className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </div>

            {/* Navigation Links */}
            <ScrollArea className="flex-1 py-3 px-2"> {/* Adjusted padding */}
                <nav className="grid gap-1">
                    {mainNavItems.map((item) => (
                        <NavLink key={item.href} item={item} isCollapsed={isCollapsed} onClick={onNavLinkClick} />
                    ))}

                    <Separator className="my-2" />

                    {/* Settings Section with Submenu */}
                    <div>
                        <Button
                            variant={currentPathname.startsWith('/settings') && !isCollapsed && openSettings ? "secondary" : "ghost"}
                            className={cn("w-full justify-start h-9 sm:h-10 text-sm sm:text-base", isCollapsed ? "px-2" : "px-3")}
                            onClick={() => {
                                setOpenSettings(!openSettings);
                            }}
                            title="الإعدادات"
                        >
                            <Settings className={cn("h-4 w-4 sm:h-5 sm:w-5", isCollapsed ? "" : "ml-2")} /> {/* RTL: ml */}
                            {!isCollapsed && (
                                <span className="truncate flex-1 text-right">الإعدادات</span>
                            )}
                            {!isCollapsed && (
                                openSettings ?
                                <ChevronLeft className="h-4 w-4 mr-auto transition-transform duration-200 rotate-[-90deg]" /> : // RTL: mr
                                <ChevronRight className="h-4 w-4 mr-auto transition-transform duration-200 rotate-[-90deg]" />  // RTL: mr
                            )}
                        </Button>
                        <AnimatePresence>
                            {!isCollapsed && openSettings && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden grid gap-1 mt-1"
                                >
                                    {settingsNavItems.map((item) => (
                                        <NavLink key={item.href} item={item} isCollapsed={isCollapsed} isSubItem onClick={onNavLinkClick}/>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>
            </ScrollArea>
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ isDesktopCollapsed, setIsDesktopCollapsed }) => {
    const location = useLocation();

    const handleCollapseToggle = () => {
        setIsDesktopCollapsed(!isDesktopCollapsed);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 right-0 z-30 h-screen bg-background border-l transition-all duration-300 ease-in-out hidden md:block", // Hidden on mobile
                    isDesktopCollapsed ? "w-16" : "w-60" // Adjusted width
                )}
                dir="rtl"
            >
                <SidebarContent 
                    isCollapsed={isDesktopCollapsed} 
                    currentPathname={location.pathname}
                    onCollapseToggle={handleCollapseToggle}
                    showCollapseButton={true}
                />
            </aside>

            {/* Mobile Sidebar (Sheet) - Triggered by MainLayout's NavbarArea */}
            {/* This assumes the <SheetTrigger> is in the NavbarArea */}
            {/* The <Sheet> and <SheetContent> are defined in MainLayout */}
        </>
    );
};

export { SidebarContent }; // Export SidebarContent for use in mobile Sheet
export default Sidebar;