// src/components/Navbar.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip, // Added Chip
  Tooltip,
  Skeleton,
  Stack, // Added Skeleton for loading names
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SchoolIcon from "@mui/icons-material/School"; // For School
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"; // For Year
import { useAuth } from "@/context/authcontext"; // Adjust path
import { useSettingsStore } from "@/stores/settingsStore"; // Adjust path
import { useSchoolStore } from "@/stores/schoolStore"; // Adjust path
import { useAcademicYearStore } from "@/stores/academicYearStore"; // Adjust path

interface NavbarProps {
  userRole?: string;
}

const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // --- Get Active Settings ---
  const { activeSchoolId, activeAcademicYearId } = useSettingsStore();

  // --- Get Names from Stores ---
  const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
  const {
    academicYears,
    fetchAcademicYears,
    loading: yearsLoading,
  } = useAcademicYearStore();

  // Fetch schools and years if IDs are set but lists are empty
  useEffect(() => {
    if (activeSchoolId && schools.length === 0) fetchSchools();
  }, [activeSchoolId, schools.length, fetchSchools]);

  useEffect(() => {
    if (activeAcademicYearId && academicYears.length === 0)
      fetchAcademicYears();
  }, [activeAcademicYearId, academicYears.length, fetchAcademicYears]);

  const activeSchool = schools.find((s) => s.id === activeSchoolId);
  const activeYear = academicYears.find(
    (ay) => ay.id === activeAcademicYearId && ay.school_id === activeSchoolId
  );

  const handleMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/auth/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        px: { xs: 0, sm: 1 },
      }}
    >
      {/* Active School and Year Display */}
      <Stack direction="row" spacing={1} alignItems="center">
        {activeSchoolId && (
          <Tooltip title="المدرسة النشطة حالياً" placement="bottom-start">
            <Chip
              icon={<SchoolIcon fontSize="small" />}
              label={
                schoolsLoading ? (
                  <Skeleton width={60} height={20} />
                ) : (
                  activeSchool?.name || `مدرسة (${activeSchoolId})`
                )
              }
              size="small"
              variant="outlined"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/settings/general")} // Link to general settings
            />
          </Tooltip>
        )}
        {activeYear &&
          activeSchoolId && ( // Show year only if school is selected
            <Tooltip
              title="العام الدراسي النشط حالياً"
              placement="bottom-start"
            >
              <Chip
                icon={<CalendarTodayIcon fontSize="small" />}
                label={
                  yearsLoading ? (
                    <Skeleton width={60} height={20} />
                  ) : (
                    activeYear?.name || `عام (${activeAcademicYearId})`
                  )
                }
                size="small"
                variant="outlined"
                sx={{ cursor: "pointer" }}
                onClick={() => navigate("/settings/general")} // Link to general settings
              />
            </Tooltip>
          )}
      </Stack>

      {/* Spacer to push user menu to the right */}
      <Box sx={{ flexGrow: 1 }} />

      {/* User Information and Menu */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography
          variant="subtitle1"
          sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
        >
          {userName || "المستخدم"} ({userRole || "الدور"})
        </Typography>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
            {userName ? userName.charAt(0).toUpperCase() : <AccountCircle />}
          </Avatar>
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          keepMounted
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          sx={{ "& .MuiPaper-root": { mt: 1 } }} // Margin top for menu
        >
          {/* <MenuItem onClick={handleClose}>ملفي الشخصي</MenuItem> */}
          <MenuItem onClick={handleLogout}>تسجيل الخروج</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Navbar;
