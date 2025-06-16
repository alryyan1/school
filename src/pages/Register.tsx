// src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import axios from 'axios';
import axiosClient from '@/axios-client';
import { useAuth } from '@/context/authcontext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    username:'',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'agreeToTerms' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar('كلمة المرور غير متطابقة', { variant: 'error' });
      return;
    }
    console.log(formData,'formData')

    if (!formData.agreeToTerms) {
      enqueueSnackbar('يجب الموافقة على الشروط والأحكام', { variant: 'warning' });
      return;
    }

    try {
      // Replace with your actual registration API call
      const response = await axiosClient.post('/register', {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,

      });

      enqueueSnackbar('تم إنشاء الحساب بنجاح', { variant: 'success' });
      navigate('/auth/login');
    } catch (error) {
      let errorMessage = 'فشل في التسجيل';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #f5f7fa 0%, #e4f0fd 100%)'
          : theme.palette.background.default,
        p: 2,
        direction: 'rtl'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 700 }}>
          إنشاء حساب جديد
        </Typography>
        
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 4 }}>
          أدخل معلوماتك الشخصية لإنشاء حساب
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Full Name Field */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="الاسم الكامل"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              autoFocus
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="اسم الدخول"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              autoFocus
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </FormControl>

          {/* Email Field */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="البريد الإلكتروني"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </FormControl>

          {/* Password Field */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 },
                endAdornment: (
                  <InputAdornment position="start">
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

          {/* Confirm Password Field */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              label="تأكيد كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </FormControl>

          {/* Terms Agreement */}
          <FormControlLabel
            control={
              <Checkbox
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                أوافق على{' '}
                <Link to="/terms" style={{ color: theme.palette.primary.main }}>
                  الشروط والأحكام
                </Link>
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          {/* Submit Button */}
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
              <CircularProgress size={24} color="inherit" />
            ) : (
              'تسجيل الحساب'
            )}
          </Button>

          {/* Login Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              لديك حساب بالفعل؟
              <Link to="/auth/login" style={{ fontWeight: 600, textDecoration: 'none' }}>
                تسجيل الدخول
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;