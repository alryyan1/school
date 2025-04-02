// src/pages/NotFound.tsx
import React from 'react';
import { Typography, Box, Button, styled } from '@mui/material';
import { Link } from 'react-router-dom';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh', // Take up the full viewport height
    textAlign: 'center',
    padding: theme.spacing(3),
    direction: 'rtl', // Set direction to rtl
}));

const NotFound: React.FC = () => {
    return (
        <StyledContainer>
            <Typography variant="h4" component="h1" gutterBottom>
                404 - الصفحة غير موجودة
            </Typography>
            <Typography variant="body1" paragraph>
                عذرًا، لم يتم العثور على الصفحة التي تبحث عنها.
            </Typography>
            <Button variant="contained" color="primary" component={Link} to="/">
                العودة إلى الصفحة الرئيسية
            </Button>
        </StyledContainer>
    );
};

export default NotFound;