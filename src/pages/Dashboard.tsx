// src/pages/Dashboard.tsx
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
import { Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradingIcon from '@mui/icons-material/Grading';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import Navbar from '@/components/Navbar';

interface DashboardStats {
  students?: number;
  teachers?: number;
  courses?: number;
  // Add other stats as needed
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s',
  textAlign: 'center',
  direction: 'rtl',
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
  const [stats, setStats] = useState<DashboardStats>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Replace with your actual API endpoint
        // const response = await axiosClient.get('/dashboard-stats');
        // setStats(response.data);
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
      title: 'الطلاب',
      icon: <PeopleIcon fontSize="large" />,
      link: '/students',
      description: 'إدارة سجلات الطلاب',
    },
    {
      title: 'المعلمون',
      icon: <SchoolIcon fontSize="large" />,
      link: '/teachers',
      description: 'إدارة ملفات تعريف المعلمين',
    },
    {
      title: 'المقررات الدراسية',
      icon: <AssignmentIcon fontSize="large" />,
      link: '/courses',
      description: 'عرض وإدارة المقررات الدراسية',
    },
    {
      title: 'الدرجات',
      icon: <GradingIcon fontSize="large" />,
      link: '/grades',
      description: 'إدخال وعرض درجات الطلاب',
    },
    {
      title: 'التقويم',
      icon: <CalendarMonthIcon fontSize="large" />,
      link: '/calendar',
      description: 'عرض الفعاليات المدرسية',
    },
    {
      title: 'الإعدادات',
      icon: <SettingsIcon fontSize="large" />,
      link: '/settings',
      description: 'تكوين إعدادات النظام',
    },
  ];

  return (
    <>
      
      <Box sx={{ padding: 3, textAlign: 'right', direction: 'rtl' }}>
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
    </>
  );
};

export default Dashboard;