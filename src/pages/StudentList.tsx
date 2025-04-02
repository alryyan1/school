// src/pages/StudentList.tsx
import React from 'react';
import { Typography, Box, styled } from '@mui/material';

const StyledContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    direction: 'rtl',
}));

const StudentList: React.FC = () => {
    return (
        <StyledContainer>
            <Typography variant="h5" component="h2" gutterBottom>
                قائمة الطلاب
            </Typography>
            {/* Add student list rendering logic here later */}
        </StyledContainer>
    );
};

export default StudentList;