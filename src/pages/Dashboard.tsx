// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Box,
  styled,
} from '@mui/material';
import { Link } from 'react-router-dom'; // or useNavigate if you prefer programmatic navigation
import PeopleIcon from '@mui/icons-material/People'; // الطلاب Students
import SchoolIcon from '@mui/icons-material/School'; // المعلمون Teachers
import AssignmentIcon from '@mui/icons-material/Assignment'; // المقررات الدراسية Courses
import GradingIcon from '@mui/icons-material/Grading'; // الدرجات Grades
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // التقويم Calendar
import SettingsIcon from '@mui/icons-material/Settings'; // الإعدادات Settings
import axiosClient from '../axios-client';

// Styled Components for better visual consistency
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s',
  textAlign: 'center', // Center text by default
  direction: 'rtl', // Set direction to rtl
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
}));

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosClient.get('/dashboard-stats'); // Replace with your actual API endpoint
        setStats(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardItems = [
    {
      title: 'الطلاب', // Students
      icon: <PeopleIcon />,
      link: '/students',
      description: 'إدارة سجلات الطلاب', // Manage student records
    },
    {
      title: 'المعلمون', // Teachers
      icon: <SchoolIcon />,
      link: '/teachers',
      description: 'إدارة ملفات تعريف المعلمين', // Manage teacher profiles
    },
    {
      title: 'المقررات الدراسية', // Courses
      icon: <AssignmentIcon />,
      link: '/courses',
      description: 'عرض وإدارة المقررات الدراسية', // View and manage courses
    },
    {
      title: 'الدرجات', // Grades
      icon: <GradingIcon />,
      link: '/grades',
      description: 'إدخال وعرض درجات الطلاب', // Enter and view student grades
    },
    {
      title: 'التقويم', // Calendar
      icon: <CalendarMonthIcon />,
      link: '/calendar',
      description: 'عرض الفعاليات المدرسية', // View school events
    },
    {
      title: 'الإعدادات', // Settings
      icon: <SettingsIcon />,
      link: '/settings',
      description: 'تكوين إعدادات النظام', // Configure system settings
    },
  ];

  return (
    <Box sx={{ padding: 3, textAlign: 'right', direction: 'rtl' }}> {/* Add padding around the whole dashboard */}
      <Typography variant="h4" gutterBottom>
        لوحة التحكم
      </Typography>

      {isLoading ? (
        <Typography>تحميل لوحة التحكم...</Typography>
      ) : (
        <Grid container spacing={3}>
          {dashboardItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Link to={item.link} style={{ textDecoration: 'none' }}>
                <StyledCard>
                  <StyledCardContent>
                    <Tooltip title={item.description} placement="top">
                      <StyledIconButton aria-label={item.title}>
                        {item.icon}
                      </StyledIconButton>
                    </Tooltip>
                    <Typography variant="h6" component="div">
                      {item.title}
                    </Typography>
                  </StyledCardContent>
                </StyledCard>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;