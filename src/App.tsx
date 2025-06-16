// src/App.tsx
import React from "react"; // Keep React for JSX if needed (though less so now)
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { SnackbarProvider } from "notistack"; // If using MUI Snackbar
import "react-toastify/dist/ReactToastify.css";

// --- Theme and Global Styles ---
// If using shadcn/ui primarily, MUI ThemeProvider/CssBaseline might be optional
// or replaced by shadcn's ThemeProvider if you have one.
// For now, keeping MUI Theme if some components still use it.
import {
  ThemeProvider as MuiThemeProvider,
  createTheme as createMuiTheme,
} from "@mui/material/styles";
import { CssBaseline as MuiCssBaseline } from "@mui/material";
import { arSA } from "@mui/material/locale";
// If you have shadcn ThemeProvider:
// import { ThemeProvider as ShadcnThemeProvider } from "@/components/theme-provider" // Example path

// --- Global Contexts ---
import { AuthProvider } from "./context/authcontext"; // Adjust path
// Import other global providers if any (e.g., settingsStore rehydration if not automatic)

// --- Router ---

// --- Styling Constants (MUI specific, might be less relevant with full shadcn) ---
import { CacheProvider } from "@emotion/react";
import { cacheRtl } from "./constants"; // Assuming this is for MUI RTL
import router from "./router";

// --- Main App Component ---
function App() {
  // MUI Theme (keep if MUI components are still in use)
  const muiTheme = createMuiTheme(
    {
      direction: "rtl",
      typography: {
        fontFamily: ["Cairo", "sans-serif"].join(","), // Base font for MUI
      },
      palette: {
        primary: { main: "#1976d2" },
        secondary: { main: "#dc004e" },
      },
    },
    arSA
  );

  return (
    // Order of providers can matter. CacheProvider for MUI RTL should wrap MuiThemeProvider.
    <CacheProvider value={cacheRtl}>
      <MuiThemeProvider theme={muiTheme}>
        {/* <ShadcnThemeProvider defaultTheme="system" storageKey="vite-ui-theme"> */}{" "}
        {/* Example shadcn theme */}
        <MuiCssBaseline /> {/* Apply MUI baseline styles */}
        <AuthProvider>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            dense
          >
            <ToastContainer
              position="top-left"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={true}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <RouterProvider router={router} />
          </SnackbarProvider>
        </AuthProvider>
        {/* </ShadcnThemeProvider> */}
      </MuiThemeProvider>
    </CacheProvider>
  );
}

export default App;
