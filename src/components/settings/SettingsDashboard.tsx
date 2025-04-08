// src/pages/settings/SettingsDashboard.tsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    useTheme,
    Card,
    CardActionArea,
    CardContent,
    Avatar,
    styled
} from '@mui/material';
import { motion } from 'framer-motion';

// Import relevant icons
import SchoolIcon from '@mui/icons-material/School'; // For Schools
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // For Academic Years
import StairsIcon from '@mui/icons-material/Stairs'; // For Grade Levels
import ClassIcon from '@mui/icons-material/Class'; // For Subjects (example)
import GroupIcon from '@mui/icons-material/Group'; // For Users (example)
import SettingsIcon from '@mui/icons-material/Settings'; // General Settings (example)
import { Book } from '@mui/icons-material';

// Define the structure for each settings card item
interface SettingsItem {
    title: string;
    description: string;
    link: string;
    icon: React.ReactElement;
    color: string; // Background color for the icon avatar
}

// Styled component for the card to ensure consistent height
const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%', // Make cards in the same row have the same height
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[6],
    },
}));

const SettingsDashboard: React.FC = () => {
    const theme = useTheme();

    // Define your settings sections here
    const settingsItems: SettingsItem[] = [
        {
            title: 'إدارة المدارس',
            description: 'إضافة وتعديل بيانات المدارس المسجلة.',
            link: '/schools/list',
            icon: <SchoolIcon />,
            color: theme.palette.primary.light,
        },
        {
            title: 'الأعوام الدراسية',
            description: 'إدارة الأعوام الدراسية وتحديد العام الحالي.',
            link: '/settings/academic-years',
            icon: <CalendarMonthIcon />,
            color: theme.palette.secondary.light,
        },
        {
            title: 'المراحل الدراسية',
            description: 'إدارة المراحل والصفوف الدراسية (مثل الصف العاشر).',
            link: '/settings/grade-levels',
            icon: <StairsIcon />,
            color: theme.palette.success.light,
        },
        {
            title: 'المقررات التعليميه',
            description: 'إدارة المواد التعليميه   (مثل  اللغه العربيه و الانجليزيه).',
            link: '/settings/subjects',
            icon: <Book />,
            color: theme.palette.success.light,
        },
        {
            title: 'المنهج الدراسي السنوي',
            description: '  إدارة المواد التعليميه   (مثل  اللغه العربيه و الانجليزيه) علي حسب السنه.',
            link: '/settings/curriculum',
            icon: <Book />,
            color: theme.palette.success.light,
        },
        // Add more settings cards as needed
        // {
        //     title: 'المواد الدراسية',
        //     description: 'إدارة المواد الدراسية ورموزها.',
        //     link: '/settings/subjects', // Example path
        //     icon: <ClassIcon />,
        //     color: theme.palette.info.light,
        // },
        // {
        //     title: 'إدارة المستخدمين',
        //     description: 'إدارة حسابات المستخدمين والصلاحيات.',
        //     link: '/users/list', // Example path
        //     icon: <GroupIcon />,
        //     color: theme.palette.warning.light,
        // },
        // {
        //     title: 'إعدادات عامة',
        //     description: 'تكوين الإعدادات العامة للنظام.',
        //     link: '/settings/general', // Example path
        //     icon: <SettingsIcon />,
        //     color: theme.palette.grey[300],
        // },
    ];

    // Animation Variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Stagger animation of children
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring', // Optional: spring animation
                stiffness: 100,
            },
        },
    };

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)', // Adjust 64px based on your AppBar height
                py: 4, // Vertical padding
                px: 2, // Horizontal padding
                direction: 'rtl',
                background: `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[200]} 100%)`, // Subtle gradient background
                // Example using a pattern:
                // backgroundImage: 'url("/path/to/your/subtle-pattern.svg")',
                // backgroundRepeat: 'repeat',
            }}
        >
            <Container maxWidth="lg">
                {/* Page Title */}
                <motion.div
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: theme.palette.primary.dark, textAlign: 'center', mb: 5 }}
                    >
                        الإعدادات العامة للنظام
                    </Typography>
                </motion.div>

                {/* Animated Grid for Settings Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Grid container spacing={4}>
                        {settingsItems.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.link}>
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.03 }} // Scale up on hover
                                    whileTap={{ scale: 0.98 }}   // Scale down on tap/click
                                    style={{ height: '100%' }} // Ensure motion div takes full height for card styling
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

export default SettingsDashboard;