// src/components/MainLayout.tsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  Menu,
  Dashboard,
  People,
  School,
  Settings,
  Logout,
  ChevronRight,
  ChevronLeft,
} from "@mui/icons-material";
import { arSA } from "@mui/material/locale";
import { CacheProvider } from "@emotion/react";
import { cacheRtl } from "../constants";
import Navbar from "./Navbar";

const drawerWidth = 240;

const MainLayout = ({
  onLogout,
  userRole,
}: {
  onLogout: () => void;
  userRole: string | null;
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePath, setActivePath] = useState("");

  // Create RTL theme override
  const rtlTheme = createTheme(
    {
      direction: "rtl",
      palette: {
        primary: {
          main: "#1976d2",
        },
        secondary: {
          main: "#dc004e",
        },
      },
    },
    arSA
  );

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    {
      text: "لوحة التحكم",
      icon: <Dashboard />,
      path: "/dashboard",
      roles: ["admin", "teacher", "student"],
    },
    {
      text: "إدارة الطلاب",
      icon: <People />,
      path: "/students",
      roles: ["admin", "teacher"],
    },
    {
      text: "إدارة الصفوف",
      icon: <School />,
      path: "/classes",
      roles: ["admin"],
    },
    {
      text: "الإعدادات",
      icon: <Settings />,
      path: "/settings",
      roles: ["admin", "teacher"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole || "")
  );

  const drawer = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem
            key={item.text}
            disablePadding
            sx={{
              backgroundColor: activePath.startsWith(item.path)
                ? theme.palette.action.selected
                : "transparent",
            }}
          >
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ minWidth: "40px" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={onLogout}>
            <ListItemIcon sx={{ minWidth: "40px" }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="تسجيل الخروج" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={rtlTheme}>
        <Navbar/>
        {/* <div
          style={{
            display: "grid",
            gridTemplateColumns: `1fr ${drawerWidth}px`,
          }}
        > */}
          <Box
            component="main"
            sx={{
              p: 3,
            }}
          >
            <Outlet />
          </Box>
        {/* </div> */}
      </ThemeProvider>
    </CacheProvider>
  );
};

export default MainLayout;
