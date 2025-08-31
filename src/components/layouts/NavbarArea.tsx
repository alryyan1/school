// src/components/layout/NavbarArea.tsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu, School, CalendarDays, LogOut, UserCircle, Shield, ChevronDown } from 'lucide-react';
import StudentSearch from '@/components/StudentSearch';

import { useAuth } from '@/context/authcontext'; // Adjust path
import { useSettingsStore } from '@/stores/settingsStore'; // Adjust path
import { useSchoolStore } from '@/stores/schoolStore'; // Adjust path

interface NavbarAreaProps {
    onMobileMenuToggle: () => void; // For mobile sidebar
}

const NavbarArea: React.FC<NavbarAreaProps> = ({ onMobileMenuToggle }) => {
    const { userName, userRole, permissions, logout } = useAuth();
    const navigate = useNavigate();

    const { activeSchoolId, activeAcademicYear } = useSettingsStore();
    const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();

    // Show student search on all pages
    const showStudentSearch = true;

    useEffect(() => {
        if (activeSchoolId && schools.length === 0) fetchSchools();
    }, [activeSchoolId, schools.length, fetchSchools]);

    const activeSchool = schools.find(s => s.id === activeSchoolId);

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 justify-between" dir="rtl">
            {/* Mobile Menu Toggle (left side in RTL) */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuToggle}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
            </Button>

            {/* Mobile Student Search - Show on all pages */}
            {showStudentSearch && (
                <div className="md:hidden flex-1 mx-2">
                    <StudentSearch />
                </div>
            )}

            {/* Active School/Year Display */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
                {activeSchoolId && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <School className="h-4 w-4" />
                        <span className="font-medium">
                            {schoolsLoading ? <Skeleton className="h-4 w-20" /> : (activeSchool?.name || `مدرسة (${activeSchoolId})`)}
                        </span>
                    </span>
                )}
                {activeAcademicYear && (
                    <>
                        <span className="text-muted-foreground">/</span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span className="font-medium">
                                {activeAcademicYear}
                            </span>
                        </span>
                    </>
                )}
            </div>

            {/* Student Search - Show on all pages */}
            {showStudentSearch && (
                <div className="hidden md:flex flex-1 max-w-md mx-4">
                    <StudentSearch />
                </div>
            )}

            {/* User Menu (right side in RTL) */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full h-auto p-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder-user.jpg" alt={userName || "User"} />
                                <AvatarFallback className="text-xs">
                                    {userName ? userName.substring(0, 2).toUpperCase() : <UserCircle />}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden sm:block text-sm font-medium text-right">
                                {userName || "المستخدم"}
                            </span>
                        </div>
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{userName || "المستخدم"}</p>
                            <p className="text-xs leading-none text-muted-foreground">{userRole || "الدور"}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Role and Permissions Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <DropdownMenuItem className="cursor-pointer">
                                <Shield className="mr-2 h-4 w-4" />
                                <span className="flex-1 text-right">الدور والصلاحيات</span>
                                <ChevronDown className="mr-auto h-4 w-4" />
                            </DropdownMenuItem>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left" align="start" className="w-64">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">معلومات الصلاحيات</p>
                                    <p className="text-xs leading-none text-muted-foreground">الدور: {userRole || "غير محدد"}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {permissions && permissions.length > 0 ? (
                                <>
                                    <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                                        الصلاحيات الممنوحة:
                                    </DropdownMenuLabel>
                                    <div className="max-h-32 overflow-y-auto">
                                        {permissions.map((permission, index) => (
                                            <DropdownMenuItem key={index} className="text-xs cursor-default">
                                                <span className="truncate">{permission}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <DropdownMenuItem className="text-xs text-muted-foreground cursor-default">
                                    لا توجد صلاحيات محددة
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <DropdownMenuSeparator />
                    {/* <DropdownMenuItem>ملفي الشخصي</DropdownMenuItem> */}
                    {/* <DropdownMenuItem>إعدادات الحساب</DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-500 focus:bg-red-100/80 dark:focus:bg-red-900/30 focus:text-red-700 dark:focus:text-red-400 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        تسجيل الخروج
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
};
export default NavbarArea;