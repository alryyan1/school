// src/pages/settings/GeneralSettingsPage.tsx
import React, { useEffect, useMemo } from 'react';
import {
    Box, Container, Typography, Paper, Grid, FormControl,
    InputLabel, Select, MenuItem, SelectChangeEvent, Alert, Button
} from '@mui/material';
import { useSettingsStore } from '@/stores/settingsStore';    // Adjust path
import { useSchoolStore } from '@/stores/schoolStore';       // Adjust path
import { useAcademicYearStore } from '@/stores/academicYearStore'; // Adjust path
import { useSnackbar } from 'notistack';

const GeneralSettingsPage: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();

    // --- Get settings state and actions ---
    const {
        activeSchoolId,
        activeAcademicYearId,
        setActiveSchoolId,
        setActiveAcademicYearId
    } = useSettingsStore();

    // --- Get data for dropdowns ---
    const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
    const { academicYears, fetchAcademicYears } = useAcademicYearStore();

    // --- Fetch data on mount ---
    useEffect(() => {
        fetchSchools();
        fetchAcademicYears(); // Fetch all years initially
    }, [fetchSchools, fetchAcademicYears]);

    // --- Memoized list of academic years for the selected school ---
    const filteredAcademicYears = useMemo(() => {
        if (!activeSchoolId) return [];
        return academicYears.filter(ay => ay.school_id === activeSchoolId);
    }, [academicYears, activeSchoolId]);

    // --- Handlers ---
    const handleSchoolChange = (event: SelectChangeEvent<number | string>) => { // Allow string for '' value
        const newSchoolId = event.target.value === '' ? null : Number(event.target.value);
        setActiveSchoolId(newSchoolId);

        // Check if the currently selected year is valid for the new school
        const currentYearIsValid = filteredAcademicYears.some(ay => ay.id === activeAcademicYearId);
        if (newSchoolId !== null && activeAcademicYearId !== null && !currentYearIsValid) {
            // If the current year doesn't belong to the new school, reset it
            setActiveAcademicYearId(null);
        }
         if (newSchoolId !== null) {
            enqueueSnackbar('تم تحديد المدرسة النشطة.', { variant: 'info', autoHideDuration: 1500 });
        } else {
             enqueueSnackbar('تم إلغاء تحديد المدرسة النشطة.', { variant: 'info', autoHideDuration: 1500 });
        }
    };

    const handleYearChange = (event: SelectChangeEvent<number | string>) => {
        const newYearId = event.target.value === '' ? null : Number(event.target.value);
        setActiveAcademicYearId(newYearId);
         if (newYearId !== null) {
             enqueueSnackbar('تم تحديد العام الدراسي النشط.', { variant: 'info', autoHideDuration: 1500 });
         } else {
             enqueueSnackbar('تم إلغاء تحديد العام الدراسي النشط.', { variant: 'info', autoHideDuration: 1500 });
         }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }} dir="rtl">
            <Typography variant="h4" component="h1" gutterBottom>
                الإعدادات العامة
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                قم بتحديد المدرسة والعام الدراسي الافتراضي لتسهيل التنقل والعمليات في الأقسام الأخرى.
            </Typography>

            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
                <Grid container spacing={3}>
                    {/* Active School Selection */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel id="active-school-label">المدرسة النشطة الافتراضية</InputLabel>
                            <Select
                                labelId="active-school-label"
                                label="المدرسة النشطة الافتراضية *"
                                value={activeSchoolId ?? ''} // Use '' for empty selection
                                onChange={handleSchoolChange}
                                disabled={schoolsLoading}
                            >
                                <MenuItem value=""><em>-- لا يوجد تحديد افتراضي --</em></MenuItem>
                                {schoolsLoading ? <MenuItem disabled><em>جاري التحميل...</em></MenuItem> :
                                 schools.map(school => <MenuItem key={school.id} value={school.id}>{school.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Active Academic Year Selection */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth disabled={!activeSchoolId} required>
                            <InputLabel id="active-year-label">العام الدراسي النشط الافتراضي</InputLabel>
                            <Select
                                labelId="active-year-label"
                                label="العام الدراسي النشط الافتراضي *"
                                value={activeAcademicYearId ?? ''} // Use '' for empty selection
                                onChange={handleYearChange}
                            >
                                <MenuItem value=""><em>-- لا يوجد تحديد افتراضي --</em></MenuItem>
                                {!activeSchoolId && <MenuItem disabled><em>اختر مدرسة أولاً</em></MenuItem>}
                                {activeSchoolId && filteredAcademicYears.length === 0 && <MenuItem disabled><em>لا توجد أعوام لهذه المدرسة</em></MenuItem>}
                                {activeSchoolId && filteredAcademicYears.map(year => (
                                    <MenuItem key={year.id} value={year.id}>{year.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                         <Alert severity="info" variant="outlined" sx={{ mt: 2}}>
                             سيتم استخدام هذه الإعدادات الافتراضية لتحديد المدرسة والعام الدراسي مسبقاً في صفحات مثل إدارة التسجيل وإدارة المناهج. يمكنك دائماً تغيير التحديد في تلك الصفحات بشكل مؤقت.
                         </Alert>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default GeneralSettingsPage;