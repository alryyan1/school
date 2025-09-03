// src/components/Navbar.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/authcontext"; // Adjust path
import { useSchoolStore } from "@/stores/schoolStore"; // Adjust path
import UserPreferencesDialog from "./UserPreferencesDialog";

interface NavbarProps {
  userRole?: string;
}

const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);

  // --- Get Names from Stores ---
  const { schools, fetchSchools } = useSchoolStore();

  // Fetch schools if list is empty
  useEffect(() => {
    if (schools.length === 0) fetchSchools();
  }, [schools.length, fetchSchools]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-background border-b">
      {/* Active School and Year Display */}
      <div className="flex items-center space-x-4">
        {/* Removed active school/year display - implement your preferred state management */}
      </div>

      {/* Spacer to push user menu to the right */}
      <div className="flex-grow" />

      {/* User Information and Menu */}
      <div className="flex items-center space-x-3">
        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPreferencesDialogOpen(true)}
          className="h-9 w-9"
          title="الإعدادات"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* User Info */}
        <span className="hidden sm:block text-sm text-muted-foreground">
          {userName || "المستخدم"} ({userRole || "الدور"})
        </span>

        {/* User Avatar and Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt={userName || "المستخدم"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userName ? userName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName || "المستخدم"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userRole || "الدور"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPreferencesDialogOpen(true)}>
              <Settings className="ml-2 h-4 w-4" />
              <span>الإعدادات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="ml-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User Preferences Dialog */}
      <UserPreferencesDialog
        open={preferencesDialogOpen}
        onOpenChange={setPreferencesDialogOpen}
      />
    </div>
  );
};

export default Navbar;
