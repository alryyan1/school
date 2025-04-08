// src/pages/schools/SchoolView.tsx
import React, { useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, CircularProgress, Alert, Paper, Avatar, Divider, Button, Container } from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon, Business as BusinessIcon } from '@mui/icons-material';
import { useSchoolStore } from '@/stores/schoolStore';
import dayjs from 'dayjs';

const displayData = (data: string | null | undefined, placeholder = 'غير محدد') => data || placeholder;

const SchoolView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentSchool, loading, error, getSchoolById, resetCurrentSchool } = useSchoolStore();

    useEffect(() => {
        const schoolId = parseInt(id ?? '', 10);
        if (!isNaN(schoolId)) getSchoolById(schoolId);
        return () => resetCurrentSchool();
    }, [id, getSchoolById, resetCurrentSchool]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    if (!currentSchool) return <Container sx={{ mt: 4 }}><Alert severity="warning">لم يتم العثور على المدرسة.</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">ملف المدرسة: {currentSchool.name}</Typography>
                    <Box>
                        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/schools/list')} sx={{ ml: 1 }}>العودة للقائمة</Button>
                        <Button variant="contained" startIcon={<EditIcon />} component={RouterLink} to={`/schools/${currentSchool.id}/edit`}>تعديل</Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Logo Section */}
                    <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                         <Avatar src={currentSchool.logo_url || undefined} variant="rounded" sx={{ width: 120, height: 120, mb: 2, mx: 'auto' }}><BusinessIcon fontSize="large" /></Avatar>
                         {/* Add is_active Chip if needed */}
                    </Grid>
                    {/* Details Section */}
                    <Grid item xs={12} md={9}>
                         <Typography variant="h6" gutterBottom>معلومات المدرسة</Typography>
                         <Grid container spacing={1.5} sx={{ mb: 2 }}>
                             <Grid item xs={12} sm={6}><Typography><strong>اسم المدرسة:</strong> {displayData(currentSchool.name)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography><strong>رمز المدرسة:</strong> {displayData(currentSchool.code)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography><strong>البريد الإلكتروني:</strong> {displayData(currentSchool.email)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography><strong>رقم الهاتف:</strong> {displayData(currentSchool.phone)}</Typography></Grid>
                             <Grid item xs={12}><Typography><strong>العنوان:</strong> {displayData(currentSchool.address)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography><strong>اسم المدير:</strong> {displayData(currentSchool.principal_name)}</Typography></Grid>
                             <Grid item xs={12} sm={6}><Typography><strong>تاريخ التأسيس:</strong> {displayData(currentSchool.establishment_date)}</Typography></Grid>
                         </Grid>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="body2" color="text.secondary">تاريخ الإنشاء: {displayData(currentSchool.created_at ? dayjs(currentSchool.created_at).format('YYYY/MM/DD hh:mm A') : null)}</Typography>
                          <Typography variant="body2" color="text.secondary">آخر تحديث: {displayData(currentSchool.updated_at ? dayjs(currentSchool.updated_at).format('YYYY/MM/DD hh:mm A') : null)}</Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default SchoolView;