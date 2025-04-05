// src/pages/teachers/TeacherView.tsx
import React, { useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
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
    Container
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon, Person as PersonIcon } from '@mui/icons-material';
import { useTeacherStore } from '@/stores/teacherStore';
import dayjs from 'dayjs';
import { imagesUrl } from '@/constants';

// Helper function to display data or a placeholder
const displayData = (data: string | null | undefined, placeholder = 'غير محدد') => {
    return data || placeholder;
};

const TeacherView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        currentTeacher,
        loading,
        error,
        getTeacherById,
        resetCurrentTeacher
    } = useTeacherStore();

    useEffect(() => {
        const teacherId = parseInt(id ?? '', 10);
        if (!isNaN(teacherId)) {
            getTeacherById(teacherId);
        } else {
            console.error("Invalid Teacher ID provided in URL");
            // Optionally navigate away or show specific error
        }
        return () => resetCurrentTeacher(); // Cleanup
    }, [id, getTeacherById, resetCurrentTeacher]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }
    if (!currentTeacher) {
        return <Container sx={{ mt: 4 }}><Alert severity="warning">لم يتم العثور على المدرس.</Alert></Container>;
    }

    const teacherName = currentTeacher.data.name || "مدرس";

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        ملف المدرس: {currentTeacher.data.name}
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/teachers/list')}
                            sx={{ ml: 1 }}
                        >
                            العودة للقائمة
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            component={RouterLink}
                            to={`/teachers/${currentTeacher.data.id}/edit`}
                        >
                            تعديل
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Image Section */}
                    <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                         <Avatar
                            src={`${imagesUrl}${currentTeacher.data.photo_path }`|| undefined}
                            alt={teacherName}
                            sx={{ width: 150, height: 150, mb: 2, mx: 'auto' }} // Center avatar
                         >
                             {teacherName.charAt(0) || <PersonIcon fontSize="large" />}
                         </Avatar>
                         <Chip
                             label={currentTeacher.data.is_active ? 'الحساب نشط' : 'الحساب غير نشط'}
                             color={currentTeacher.data.is_active ? 'success' : 'default'}
                             size="small"
                          />
                    </Grid>

                    {/* Details Section */}
                    <Grid item xs={12} md={9}>
                         <Typography variant="h6" gutterBottom>المعلومات الأساسية</Typography>
                         <Grid container spacing={1.5} sx={{ mb: 2 }}>
                             <Grid item xs={12} sm={6}><Typography><strong>الاسم الكامل:</strong> {displayData(currentTeacher.data.name)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography><strong>الرقم الوطني:</strong> {displayData(currentTeacher.data.national_id)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography><strong>البريد الإلكتروني:</strong> {displayData(currentTeacher.data.email)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography><strong>رقم الهاتف:</strong> {displayData(currentTeacher.data.phone)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography><strong>الجنس:</strong> {displayData(currentTeacher.data.gender)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography><strong>تاريخ الميلاد:</strong> {dayjs(currentTeacher.data.birth_date).format('YYYY/MM/DD')}</Typography></Grid>
                         </Grid>
                         <Divider sx={{ my: 2 }} />

                         <Typography variant="h6" gutterBottom>المعلومات الوظيفية</Typography>
                         <Grid container spacing={1.5} sx={{ mb: 2 }}>
                              <Grid item xs={12} sm={6}><Typography><strong>المؤهل العلمي:</strong> {displayData(currentTeacher.data.qualification)}</Typography></Grid>
                              <Grid item xs={12} sm={6}><Typography><strong>تاريخ التعيين:</strong> {dayjs(currentTeacher.data.hire_date).format('YYYY/MM/DD')}</Typography></Grid>
                              <Grid item xs={12}><Typography><strong>العنوان:</strong> {displayData(currentTeacher.data.address)}</Typography></Grid>
                         </Grid>
                          <Divider sx={{ my: 2 }} />

                          <Typography variant="body2" color="text.secondary">
                              تاريخ الإنشاء: {displayData(currentTeacher.data.created_at ? dayjs(currentTeacher.data.created_at).format('YYYY/MM/DD hh:mm A') : null)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                               آخر تحديث: {displayData(currentTeacher.data.updated_at ? dayjs(currentTeacher.data.updated_at).format('YYYY/MM/DD hh:mm A') : null)}
                          </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default TeacherView;