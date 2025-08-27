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
  Paper
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/context/authcontext';
import alfanarLogo from '@/assets/alfanar.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation()
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
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
    } catch (error: unknown) {
      let errorMessage = 'فشل تسجيل الدخول';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        switch (axiosError.response.status) {
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
        p: 3,
        width: '100%',
        maxWidth: 400,
        borderRadius: 2,
        maxHeight: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Logo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <img 
          src={alfanarLogo} 
          alt="Alfanar Logo" 
          style={{ 
            maxWidth: '150px', 
            height: 'auto',
            borderRadius: '8px'
          }} 
        />
      </Box>
      
      <Typography variant="h5" component="h1" align="center" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
        نظام اداره الطلاب
      </Typography>
      
      <Typography variant="h6" component="h2" align="center" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        تسجيل الدخول
      </Typography>
      
      <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
        يرجى إدخال بيانات الدخول الخاصة بك
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="اسم المستخدم "
            type="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            autoFocus
            variant="outlined"
            size="small"
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
            size="small"
            InputProps={{
              sx: { borderRadius: 1 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="medium"
          disabled={isLoading}
          sx={{
            py: 1,
            borderRadius: 1,
            fontSize: '0.9rem'
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'تسجيل الدخول'
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default Login;