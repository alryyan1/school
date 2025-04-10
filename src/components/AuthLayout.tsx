// src/components/AuthLayout.tsx
import { Box, Container, CssBaseline, ThemeProvider, Typography, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import { arSA } from '@mui/material/locale';
import { CacheProvider } from '@emotion/react';
import { cacheRtl } from '../constants';

const AuthLayout = () => {
  const theme = useTheme();

  // Create RTL theme override for auth pages
  const rtlTheme = createTheme(
    {
      direction: 'rtl',
      palette: {
        background: {
          default: '#f5f5f5',
        },
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
            },
          },
        },
      },
    },
    arSA
  );

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={rtlTheme}>
        <Box
          sx={{
            display: 'flex',
            minHeight: '100vh',
            backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #e4f0fd 100%)',
            backgroundAttachment: 'fixed',
          }}
        >
          <CssBaseline />
          
          {/* Left-side decorative area */}
          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(to bottom, #1976d2, #115293)',
              p: 4,
            }}
          >
            <Box sx={{ maxWidth: 500, textAlign: 'center', color: 'white' }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                نظام إدارة الطلاب
              </Typography>
              <Typography variant="h6">
                نظام متكامل لإدارة بيانات الطلاب والمتابعة الأكاديمية
              </Typography>
            </Box>
          </Box>

          {/* Right-side form area */}
          <Container
            maxWidth="sm"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              py: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* <img 
                src="/logo.png" 
                alt="Logo" 
                style={{ 
                  width: 80, 
                  height: 80, 
                  marginBottom: theme.spacing(3) 
                }} 
              /> */}
              <Outlet /> {/* This renders the child routes (login/signup) */}
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                © {new Date().getFullYear()} نظام إدارة المدارس - جميع الحقوق محفوظة
              </Typography>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default AuthLayout;