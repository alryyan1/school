// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link,useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  useTheme
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/context/authcontext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation()
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const navigate = useNavigate();

    // Determine where to redirect after login
    // Check if state and state.from exist, otherwise default to '/dashboard'
    const from = location.state?.from?.pathname || "/dashboard";
    console.log(from,'from')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      enqueueSnackbar('يرجى إدخال اسم المستخدم  وكلمة المرور', { variant: 'warning' });
      return;
    }

    try {
      await login(username, password, rememberMe);
       // Navigate to the 'from' path instead of hardcoding '/dashboard'
       navigate(from, { replace: true });
        // <--- Navigate to original or dashboard
    } catch (error: any) {
      let errorMessage = 'فشل تسجيل الدخول';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = ' اسم المستخدم أو كلمة المرور غير صحيحة';
            break;
          case 403:
            errorMessage = 'حسابك غير مفعل، يرجى التواصل مع المسؤول';
            break;
          case 429:
            errorMessage = 'محاولات تسجيل دخول كثيرة، يرجى الانتظار';
            break;
        }
      }
      
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 5000
      });
    }
  };

  return (

      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 450,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 700 }}>
          تسجيل الدخول
        </Typography>
        
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 4 }}>
          يرجى إدخال بيانات الدخول الخاصة بك
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="اسم المستخدم "
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="تذكرني"
            />

            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                نسيت كلمة المرور؟
              </Typography>
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderRadius: 1,
              fontSize: '1rem'
            }}
          >
            {isLoading ? (
              <CircularProgress size={4} color="inherit" />
            ) : (
              'تسجيل الدخول'
            )}
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              ليس لديك حساب؟{' '}
              <Link to="/auth/register" style={{ fontWeight: 600, textDecoration: 'none' }}>
                إنشاء حساب جديد
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    
  );
};

export default Login;