// src/pages/students/StudentView.tsx
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Avatar,
    Divider,
    Chip,
    Button,
    Card,
    CardMedia,
    useTheme,
    Container
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person'; // Placeholder icon
import { useStudentStore } from '@/stores/studentStore';
import { imagesUrl } from '@/constants'; // Import the base URL for images
import { Gender, EducationLevel } from '@/types/student'; // Import enums if needed for display logic

// Helper function to display data or a placeholder
const displayData = (data: string | null | undefined, placeholder = 'لا يوجد') => {
    return data || placeholder;
};

const StudentView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const {
        currentStudent,
        loading,
        error,
        getStudentById,
        resetCurrentStudent
    } = useStudentStore();

    useEffect(() => {
        const studentId = parseInt(id ?? '', 10);
        if (!isNaN(studentId)) {
            getStudentById(studentId);
        } else {
            // Handle invalid ID in URL if necessary
            console.error("Invalid Student ID provided in URL");
        }

        // Cleanup function to reset current student when component unmounts
        return () => {
            resetCurrentStudent();
        };
    }, [id, getStudentById, resetCurrentStudent]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    }

    if (!currentStudent) {
        return <Alert severity="warning" sx={{ m: 3 }}>لم يتم العثور على الطالب.</Alert>;
    }

    // Construct image URL or use null if no image
    const imageUrl = currentStudent.image ? `${imagesUrl}/${currentStudent.image}` : null;
    const studentName = currentStudent.student_name || "الطالب"; // Fallback name for Avatar

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        ملف الطالب: {currentStudent.student_name}
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            component={Link}
                            to="/students/list" // Or '/students' depending on your preference
                            sx={{ ml: 1 }}
                        >
                            العودة للقائمة
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            component={Link}
                            to={`/students/${currentStudent.id}/edit`}
                        >
                            تعديل
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Image Section */}
                    <Grid item xs={12} md={3}>
                        {imageUrl ? (
                            <Card>
                                <CardMedia
                                    component="img"
                                    image={imageUrl}
                                    alt={studentName}
                                    sx={{
                                        width: '100%',
                                        maxHeight: 350,
                                        objectFit: 'cover', // Or 'contain' based on preference
                                        borderRadius: 1,
                                    }}
                                    onError={(e) => {
                                        // Optional: Handle broken image links
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        // You could show the avatar fallback here too
                                    }}
                                />
                            </Card>
                        ) : (
                            <Avatar
                                sx={{
                                    width: 150,
                                    height: 150,
                                    fontSize: '4rem',
                                    bgcolor: theme.palette.primary.light, // Example background color
                                    mb: 2
                                }}
                            >
                                {/* Display first letter of name or a generic icon */}
                                {studentName.charAt(0) || <PersonIcon fontSize="inherit" />}
                            </Avatar>
                        )}
                    </Grid>

                    {/* Details Section */}
                    <Grid item xs={12} md={9}>
                        {/* Basic Info */}
                        <Typography variant="h6" gutterBottom>المعلومات الأساسية</Typography>
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الاسم الكامل:</strong> {displayData(currentStudent.student_name)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>تاريخ الميلاد:</strong> {displayData(currentStudent.date_of_birth)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الجنس:</strong> <Chip label={displayData(currentStudent.gender)} size="small" color={currentStudent.gender === Gender.Male ? 'info' : 'secondary'} /></Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>المرحلة المرغوبة:</strong> <Chip label={displayData(currentStudent.wished_level)} size="small" color="default" /></Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الرقم الوطني:</strong> {displayData(currentStudent.goverment_id)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>البريد الإلكتروني:</strong> {displayData(currentStudent.email)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>المدرسة السابقة:</strong> {displayData(currentStudent.referred_school)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>نسبة النجاح السابقة:</strong> {displayData(currentStudent.success_percentage)}%</Typography></Grid>
                             <Grid item xs={12}><Typography variant="body1"><strong>الحالة الصحية:</strong> {displayData(currentStudent.medical_condition)}</Typography></Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />

                        {/* Father Info */}
                        <Typography variant="h6" gutterBottom>معلومات الأب</Typography>
                         <Grid container spacing={1} sx={{ mb: 2 }}>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>اسم الأب:</strong> {displayData(currentStudent.father_name)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الوظيفة:</strong> {displayData(currentStudent.father_job)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الهاتف:</strong> {displayData(currentStudent.father_phone)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>واتساب:</strong> {displayData(currentStudent.father_whatsapp)}</Typography></Grid>
                             <Grid item xs={12}><Typography variant="body1"><strong>العنوان:</strong> {displayData(currentStudent.father_address)}</Typography></Grid>
                         </Grid>
                         <Divider sx={{ my: 2 }} />

                        {/* Mother Info */}
                        <Typography variant="h6" gutterBottom>معلومات الأم</Typography>
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>اسم الأم:</strong> {displayData(currentStudent.mother_name)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الوظيفة:</strong> {displayData(currentStudent.mother_job)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الهاتف:</strong> {displayData(currentStudent.mother_phone)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>واتساب:</strong> {displayData(currentStudent.mother_whatsapp)}</Typography></Grid>
                             <Grid item xs={12}><Typography variant="body1"><strong>العنوان:</strong> {displayData(currentStudent.mother_address)}</Typography></Grid>
                         </Grid>
                         <Divider sx={{ my: 2 }} />

                        {/* Other Parent/Guardian Info */}
                        <Typography variant="h6" gutterBottom>معلومات ولي الأمر الآخر (إن وجد)</Typography>
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الاسم:</strong> {displayData(currentStudent.other_parent)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>صلة القرابة:</strong> {displayData(currentStudent.relation_of_other_parent)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الوظيفة:</strong> {displayData(currentStudent.relation_job)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الهاتف:</strong> {displayData(currentStudent.relation_phone)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>واتساب:</strong> {displayData(currentStudent.relation_whatsapp)}</Typography></Grid>
                         </Grid>
                        <Divider sx={{ my: 2 }} />

                         {/* Closest Person Info */}
                        <Typography variant="h6" gutterBottom>معلومات أقرب شخص للطالب</Typography>
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الاسم:</strong> {displayData(currentStudent.closest_name)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الهاتف:</strong> {displayData(currentStudent.closest_phone)}</Typography></Grid>
                        </Grid>
                         <Divider sx={{ my: 2 }} />

                        {/* Approval Status */}
                        <Typography variant="h6" gutterBottom>حالة القبول</Typography>
                        <Grid container spacing={1}>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>الحالة:</strong> <Chip label={currentStudent.approved ? 'مقبول' : 'قيد المراجعة'} size="small" color={currentStudent.approved ? 'success' : 'warning'} /></Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>تاريخ القبول:</strong> {displayData(currentStudent.approve_date)}</Typography></Grid>
                             {/* You might want to fetch the user name based on approved_by_user ID */}
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>تم القبول بواسطة (ID):</strong> {displayData(currentStudent.approved_by_user?.toString())}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography variant="body1"><strong>تم إرسال رسالة القبول:</strong> <Chip label={currentStudent.message_sent ? 'نعم' : 'لا'} size="small" color={currentStudent.message_sent ? 'success' : 'default'} /></Typography></Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default StudentView;