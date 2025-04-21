// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { AuthProvider } from "./context/authcontext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { scan } from "react-scan";
scan({
  enabled: true,
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      {/* <CssBaseline/> */}
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
        <App />
      </LocalizationProvider>
    </AuthProvider>
  </React.StrictMode>
);
