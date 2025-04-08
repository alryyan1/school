// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Use alias for clarity
import {
    Box,
    Container, // Use Container for consistent padding/width
    Grid,
    Card,
    CardActionArea, // Make card clickable
    CardContent,
    Typography,
    Avatar, // Use Avatar for icons
    styled,
    useTheme, // Import useTheme
    CircularProgress,
    Paper // For stat cards
} from '@mui/material';
import { motion } from 'framer-motion'; // Import motion

// Icons (ensure all needed icons are imported)
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School'; // For Teachers
import AssignmentIcon from '@mui/icons-material/Assignment'; // For Courses/Subjects
import GradingIcon from '@mui/icons-material/Grading'; // For Grades
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // For Calendar
import SettingsIcon from '@mui/icons-material/Settings'; // For Settings
import BusinessIcon from '@mui/icons-material/Business'; // For Schools

// Import API client if you uncomment the stats fetching
// import axiosClient from '@/axios-client';

// Dashboard Stats Type
interface DashboardStats {
    studentCount?: number; // Updated key based on backend example
    teacherCount?: number; // Updated key based on backend example
    courseCount?: number; // Updated key based on backend example
    // Add other stats as needed
}

// Define the structure for each dashboard card item
interface DashboardItem {
    title: string;
    description: string;
    link: string;
    icon: React.ReactElement;
    color: string; // Background color for the icon avatar
}

// Styled component for the card (same as in SettingsDashboard)
const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[6],
    },
    direction: 'rtl', // Ensure RTL direction on card
}));

const Dashboard: React.FC = () => {
    const theme = useTheme();
    const [isLoadingStats, setIsLoadingStats] = useState(true); // Renamed state
    const [stats, setStats] = useState<DashboardStats>({});

    // --- Fetch Dashboard Stats ---
    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true); // Start loading
            try {
                 // --- UNCOMMENT AND USE YOUR ACTUAL API ENDPOINT ---
                 // const response = await axiosClient.get<{ studentCount: number, teacherCount: number, courseCount: number }>('/dashboard-stats');
                 // setStats(response.data);
                 // --- --- --- --- --- --- --- --- --- --- --- --- ---

                 // --- Mock Data (REMOVE WHEN API IS READY) ---
                 await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
                 setStats({ studentCount: 125, teacherCount: 23, courseCount: 18 });
                 // --- --- --- --- --- --- --- --- --- --- --- ---

            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                 // Optionally set default/error state for stats
                 setStats({});
            } finally {
                 setIsLoadingStats(false); // Finish loading
            }
        };

        fetchStats();
    }, []); // Empty dependency array means run once on mount

    // --- Define Dashboard Navigation Items ---
    const dashboardItems: DashboardItem[] = [
        {
            title: 'الطلاب',
            icon: <PeopleIcon />,
            link: '/students', // Main student dashboard/list
            description: 'إدارة سجلات الطلاب وبياناتهم.',
            color: theme.palette.primary.light,
        },
        {
            title: 'المعلمون',
            icon: <SchoolIcon />, // Using SchoolIcon for teachers
            link: '/teachers', // Main teacher dashboard/list
            description: 'إدارة ملفات المعلمين وجداولهم.',
            color: theme.palette.info.light,
        },
         {
             title: 'المدارس',
             icon: <BusinessIcon />, // Icon for Schools
             link: '/schools', // Main school list/management
             description: 'إدارة بيانات المدارس والفروع.',
             color: theme.palette.warning.light,
         },
         {
            title: 'تعين الطلاب',
            icon: <BusinessIcon />, // Icon for Schools
            link: '/enrollments', // Main school list/management
            description: 'تعيين الطلاب ',
            color: theme.palette.warning.light,
        },
        // {
        //     title: 'المقررات الدراسية',
        //     icon: <AssignmentIcon />,
        //     link: '/courses', // Adjust link as needed
        //     description: 'عرض وإدارة المقررات الدراسية.',
        //     color: theme.palette.success.light,
        // },
        // {
        //     title: 'الدرجات',
        //     icon: <GradingIcon />,
        //     link: '/grades', // Adjust link as needed
        //     description: 'إدخال وعرض درجات الطلاب.',
        //     color: theme.palette.error.light,
        // },
        // {
        //     title: 'التقويم',
        //     icon: <CalendarMonthIcon />,
        //     link: '/calendar', // Adjust link as needed
        //     description: 'عرض الفعاليات والأحداث المدرسية.',
        //     color: theme.palette.secondary.light,
        // },
        {
            title: 'الإعدادات',
            icon: <SettingsIcon />,
            link: '/settings', // Link to the settings dashboard
            description: 'تكوين إعدادات النظام المختلفة.',
            color: theme.palette.grey[400], // Neutral color for settings
        },
    ];

    // --- Animation Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    };

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)', // Adjust based on AppBar height
                py: 4, px: 2, direction: 'rtl',
                background: `linear-gradient(135deg, ${theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900]} 0%, ${theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800]} 100%)`,
            }}
        >
            <Container maxWidth="lg">
                {/* Animated Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.dark, textAlign: 'center', mb: 4 }}>
                        لوحة التحكم الرئيسية
                    </Typography>
                </motion.div>

                 {/* Statistics Row */}
                 <Grid container spacing={3} sx={{ mb: 4 }}>
                     {/* Stat Card 1: Students */}
                     <Grid item xs={12} sm={4}>
                         <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                             <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 48, height: 48 }}>
                                 <PeopleIcon sx={{ color: theme.palette.primary.contrastText }} />
                             </Avatar>
                             <Box>
                                 <Typography variant="body2" color="text.secondary">إجمالي الطلاب</Typography>
                                 {isLoadingStats ? <CircularProgress size={20} /> :
                                     <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.studentCount ?? '...'}</Typography>
                                 }
                             </Box>
                         </Paper>
                     </Grid>
                     {/* Stat Card 2: Teachers */}
                     <Grid item xs={12} sm={4}>
                         <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                             <Avatar sx={{ bgcolor: theme.palette.info.light, width: 48, height: 48 }}>
                                 <SchoolIcon sx={{ color: theme.palette.info.contrastText }}/>
                             </Avatar>
                             <Box>
                                 <Typography variant="body2" color="text.secondary">إجمالي المعلمين</Typography>
                                  {isLoadingStats ? <CircularProgress size={20} /> :
                                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.teacherCount ?? '...'}</Typography>
                                  }
                             </Box>
                         </Paper>
                     </Grid>
                      {/* Stat Card 3: Courses (Example) */}
                      <Grid item xs={12} sm={4}>
                         <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: theme.palette.success.light, width: 48, height: 48 }}>
                                  <AssignmentIcon sx={{ color: theme.palette.success.contrastText }}/>
                              </Avatar>
                              <Box>
                                  <Typography variant="body2" color="text.secondary">إجمالي المقررات</Typography>
                                   {isLoadingStats ? <CircularProgress size={20} /> :
                                       <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.courseCount ?? '...'}</Typography>
                                   }
                              </Box>
                         </Paper>
                     </Grid>
                 </Grid>

                {/* Animated Grid for Navigation Cards */}
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <Grid container spacing={4}>
                        {dashboardItems.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.link}>
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ height: '100%' }}
                                >
                                    <StyledCard elevation={3}>
                                        <CardActionArea component={RouterLink} to={item.link} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                            <Avatar sx={{ bgcolor: item.color, width: 56, height: 56, mb: 2, color: theme.palette.getContrastText(item.color) }}>
                                                {React.cloneElement(item.icon, { fontSize: 'medium' })}
                                            </Avatar>
                                            <CardContent sx={{ textAlign: 'center', pt: 0 }}>
                                                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.description}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </StyledCard>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
            </Container>
        </Box>
    );
};

export default Dashboard;