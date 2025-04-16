// src/pages/Unauthorized.tsx
import { Button, Container, Typography, Box, useTheme } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/authcontext';

const Unauthorized = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {logout} = useAuth()
  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        py: 8,
        direction: 'rtl'
      }}
    >
      <Box
        sx={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: theme.palette.error.light,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4
        }}
      >
        <Typography
          variant="h1"
          sx={{
            color: theme.palette.error.contrastText,
            fontSize: '3rem',
            fontWeight: 700
          }}
        >
          403
        </Typography>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        لا تمتلك صلاحية الوصول
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
        عذراً، ليس لديك الأذونات اللازمة للوصول إلى هذه الصفحة. يرجى التواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ px: 4, py: 1.5 }}
        >
          العودة للصفحة السابقة
        </Button>

        <Button
          variant="outlined"
          component={Link}
          to="/dashboard"
          startIcon={<Home />}
          sx={{ px: 4, py: 1.5 }}
        >
          الصفحة الرئيسية
        </Button>
      </Box>

      <Box sx={{ mt: 6, color: theme.palette.text.secondary }}>
        <Typography variant="body2">
          إذا استمرت المشكلة، يرجى{' '}
          <Link
            to="/contact"
            style={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            التواصل مع الدعم الفني
          </Link>
        </Typography>
        <Button onClick={()=>{
          // alert('s')
          logout()
        }}>تسجيل خروج</Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;