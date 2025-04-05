// src/pages/students/StudentDashboard.tsx
import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    Grid,
    Stack, // Using Stack for easier spacing of buttons/items
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/PersonAddAlt1'; // Icon for adding student
import ListIcon from '@mui/icons-material/FormatListBulleted'; // Icon for listing students
import AssessmentIcon from '@mui/icons-material/Assessment'; // Example icon for stats
import { useStudentStore } from '@/stores/studentStore';

// You might fetch some data here later using useStudentStore
// import { useStudentStore } from '@/stores/studentStore';

const StudentDashboard: React.FC = () => {
    // Example: Placeholder for future stats fetching
    const { students,fetchStudents,loading } = useStudentStore();
    const totalStudents = students.length;

    useEffect(()=>{
        fetchStudents()
    },[])

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}> {/* Ensure RTL direction */}
            {/* Header Section */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4 // Margin bottom for spacing
                }}
            >
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    إدارة شؤون الطلاب
                </Typography>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} gap={2}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />} // Icon appears before text in RTL too
                        component={RouterLink}
                        to="/students/create"
                        sx={{ py: 1.5, px: 3 }} // Custom padding
                    >
                        إضافة طالب جديد
                    </Button>
                     <Button
                        variant="outlined"
                        startIcon={<ListIcon />}
                        component={RouterLink}
                        to="/students/list"
                        sx={{ py: 1.5, px: 3 }}
                    >
                        عرض قائمة الطلاب
                    </Button>
                </Stack>
            </Box>

            {/* Main Content Area (Example: Placeholder for Stats or Widgets) */}
            <Grid container spacing={3}>
                {/* Example Stat Card 1 */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                        <AssessmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }}/>
                        <Typography variant="h6">إجمالي الطلاب</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {/* {totalStudents || 0} Placeholder for actual count */}
                            {loading ? <CircularProgress/> :totalStudents} {/* Example Number */}
                        </Typography>
                    </Paper>
                </Grid>

                 {/* Example Stat Card 2 */}
                 {/* <Grid item xs={12} sm={6} md={4}>
                     <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                         <AddIcon color="secondary" sx={{ fontSize: 40, mb: 1 }}/>
                         <Typography variant="h6">تسجيلات جديدة (آخر شهر)</Typography>
                         <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                             12 {/* Example Number */}
                         {/* </Typography> */}
                     {/* </Paper> */}
         

                 {/* Add more Grid items for other stats or quick access links */}

                 {/* Optional: You could embed a simplified list view here */}
                 {/* <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" mb={2}>أحدث الطلاب المسجلين</Typography>
                        {/* Embed <StudentList SimpleView={true} /> or similar component }
                        <Typography color="text.secondary"> (قائمة الطلاب المصغرة هنا...) </Typography>
                    </Paper>
                 </Grid> */}

            </Grid>

            {/* You can add more sections or components below */}

        </Container>
    );
};

export default StudentDashboard;