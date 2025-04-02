// src/components/MainLayout.js
import React from 'react';
import Navbar from './Navbar';
import { Box, Container } from '@mui/material';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container sx={{ mt: 3, mb: 3 }}> {/* Add some margin/padding */}
        {children}
      </Container>
    </Box>
  );
};

export default MainLayout;