// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { AuthProvider } from "./context/authcontext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { scan } from "react-scan";


if (import.meta.env.DEV) {
  // const { scan } = await import('react-scan');
  scan(); // pass options if needed
}
ReactDOM.createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      {/* <CssBaseline/> */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
        <App />
      </LocalizationProvider>
    </AuthProvider>

);
