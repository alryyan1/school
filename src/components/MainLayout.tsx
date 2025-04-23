// src/components/MainLayout.tsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
} from "@mui/material";

import { CacheProvider } from "@emotion/react";
import { cacheRtl } from "../constants";
import Navbar from "./Navbar";


const MainLayout = ({

  userRole,
}: {
  userRole: string | null;
}) => {


 


  return (
    <CacheProvider value={cacheRtl}>
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
    </CacheProvider>
  );
};

export default MainLayout;
