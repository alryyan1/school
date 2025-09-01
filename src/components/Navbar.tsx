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
  Stack,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuth } from "@/context/authcontext"; // Adjust path
import { useSchoolStore } from "@/stores/schoolStore"; // Adjust path

interface NavbarProps {
  userRole?: string;
}

const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // --- Get Active Settings ---
  // Removed useSettingsStore - you may need to implement alternative state management

  // --- Get Names from Stores ---
  const { schools, fetchSchools } = useSchoolStore();

  // Fetch schools if list is empty
  useEffect(() => {
    if (schools.length === 0) fetchSchools();
  }, [schools.length, fetchSchools]);

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
        {/* Removed active school/year display - implement your preferred state management */}
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
