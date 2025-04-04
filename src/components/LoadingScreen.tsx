// src/components/LoadingScreen.tsx
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const LoadingScreen = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        // backgroundColor: theme.palette.background.default,
        gap: 2,
        direction: 'rtl'
      }}
    >
      <CircularProgress 
        size={60} 
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          animationDuration: '1000ms' // Slower animation
        }}
      />
      <Typography 
        variant="h6" 
        sx={{
          color: theme.palette.text.primary,
          fontWeight: 500,
          mt: 2
        }}
      >
        جاري التحميل...
      </Typography>
      <Typography 
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          maxWidth: '300px',
          textAlign: 'center'
        }}
      >
        يرجى الانتظار أثناء تحميل البيانات
      </Typography>
    </Box>
  );
};

export default LoadingScreen;