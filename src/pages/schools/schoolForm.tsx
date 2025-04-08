// src/components/schools/SchoolForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Grid, TextField, Typography, CircularProgress, Alert, Paper, Avatar, Container } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar';
import dayjs from 'dayjs';
import { useSchoolStore } from '@/stores/schoolStore';
import { SchoolFormData, School } from '@/types/school';
import { useSnackbar } from 'notistack';
import BusinessIcon from '@mui/icons-material/Business'; // Placeholder

const initialSchoolState: SchoolFormData = { /* ... initial values based on type ... */
    name: '', code: '', address: '', phone: '', email: '', principal_name: null, establishment_date: null, logo_path: null, logo: null,
};

const SchoolForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const schoolId = id ? parseInt(id, 10) : undefined;
    const isEditMode = !!schoolId;

    const { createSchool, updateSchool, getSchoolById, currentSchool, loading: storeLoading, error: storeError, resetCurrentSchool } = useSchoolStore();
    const methods = useForm<SchoolFormData>({ defaultValues: initialSchoolState });
    const { control, register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = methods;

    const [isFetchingData, setIsFetchingData] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const logoFile = watch('logo');

    // Effect for Logo Preview
    useEffect(() => {
         if (logoFile && logoFile instanceof File) {
             const reader = new FileReader();
             reader.onloadend = () => setLogoPreview(reader.result as string);
             reader.readAsDataURL(logoFile);
         } else if (!logoFile && currentSchool?.logo_url && isEditMode) {
             setLogoPreview(currentSchool.logo_url);
         } else if (!logoFile) {
             setLogoPreview(null);
         }
     }, [logoFile, currentSchool, isEditMode]);

    // Effect to Fetch Data in Edit Mode
     useEffect(() => {
         if (isEditMode && schoolId) {
             const fetchData = async () => {
                 setIsFetchingData(true);
                 resetCurrentSchool();
                 await getSchoolById(schoolId);
                 setIsFetchingData(false);
             };
             fetchData();
         } else {
             reset(initialSchoolState);
             setLogoPreview(null);
         }
         return () => resetCurrentSchool();
     }, [schoolId, isEditMode, getSchoolById, reset, resetCurrentSchool]);

    // Effect to Populate Form in Edit Mode
     useEffect(() => {
         if (isEditMode && currentSchool && currentSchool.id === schoolId) {
             reset({
                 ...currentSchool,
                 establishment_date: currentSchool.establishment_date ? dayjs(currentSchool.establishment_date).format('YYYY-MM-DD') : null,
                 logo: null, // Clear file input
             });
             setLogoPreview(currentSchool.logo_url);
         }
     }, [currentSchool, isEditMode, reset, schoolId]);

    // Handle Form Submission
    const onSubmit = async (data: SchoolFormData) => {
        try {
            let result: School | null = null;
            const { logo_path, ...submitData } = data; // Exclude logo_path

            if (isEditMode && schoolId) {
                result = await updateSchool(schoolId, submitData);
                if(result) enqueueSnackbar('تم تحديث بيانات المدرسة بنجاح', { variant: 'success' });
            } else {
                result = await createSchool(submitData);
                 if(result) enqueueSnackbar('تم إضافة المدرسة بنجاح', { variant: 'success' });
            }
            if (result) {
                 navigate(`/schools/${result.id}`); // Navigate to view page
            }
        } catch (error) {
             console.error('School form submission error:', error);
             // Store likely handles snackbar for specific API errors
        }
    };
  
     // --- Loading / Error States ---
     if (isFetchingData || (isEditMode && storeLoading && !currentSchool)) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /><Typography sx={{ ml: 2 }}>جار تحميل بيانات المدرسة...</Typography></Box>;
     if (isEditMode && storeError && !isFetchingData) return <Alert severity="error" sx={{ m: 3 }}>خطأ: {storeError}</Alert>;
     if (isEditMode && !storeLoading && !currentSchool && !isFetchingData) return <Alert severity="warning" sx={{ m: 3 }}>لم يتم العثور على المدرسة بالمعرف: {schoolId}.</Alert>;


    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
                {isEditMode ? `تعديل بيانات المدرسة: ${currentSchool?.name || ''}` : 'إضافة مدرسة جديدة'}
            </Typography>
            <Paper sx={{ p: { xs: 2, sm: 4 }, mt: 2 }}>
                <FormProvider {...methods}>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <Grid container spacing={3}>
                                {/* Logo Preview and Upload */}
                                <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Avatar src={logoPreview || undefined} variant="rounded" sx={{ width: 100, height: 100, mb: 2 }}>
                                        {!logoPreview && <BusinessIcon fontSize="large"/>}
                                    </Avatar>
                                    <Button variant="outlined" component="label">
                                        {isEditMode && currentSchool?.logo_url ? 'تغيير الشعار' : 'تحميل شعار'}
                                        <input type="file" hidden accept="image/*" onChange={(e) => setValue('logo', e.target.files?.[0] ?? null)}/>
                                    </Button>
                                     {errors.logo && <Typography color="error" variant="caption">{errors.logo.message}</Typography>}
                                </Grid>

                                {/* Text Fields */}
                                <Grid item xs={12} sm={6}><TextField {...register('name', { required: 'اسم المدرسة مطلوب' })} label="اسم المدرسة" fullWidth required error={!!errors.name} helperText={errors.name?.message} /></Grid>
                                <Grid item xs={12} sm={6}><TextField {...register('code', { required: 'رمز المدرسة مطلوب' })} label="رمز المدرسة" fullWidth required error={!!errors.code} helperText={errors.code?.message} /></Grid>
                                <Grid item xs={12} sm={6}><TextField {...register('email', { required: 'البريد الإلكتروني مطلوب', pattern: { value: /^\S+@\S+$/i, message: 'صيغة بريد غير صحيحة' }})} label="البريد الإلكتروني" type="email" fullWidth required error={!!errors.email} helperText={errors.email?.message} /></Grid>
                                <Grid item xs={12} sm={6}><TextField {...register('phone', { required: 'رقم الهاتف مطلوب' })} label="رقم الهاتف" fullWidth required error={!!errors.phone} helperText={errors.phone?.message} /></Grid>
                                <Grid item xs={12}><TextField {...register('address', { required: 'العنوان مطلوب' })} label="العنوان" fullWidth required error={!!errors.address} helperText={errors.address?.message} /></Grid>
                                <Grid item xs={12} sm={6}><TextField {...register('principal_name')} label="اسم المدير" fullWidth /></Grid>
                                <Grid item xs={12} sm={6}>
                                    <Controller name="establishment_date" control={control} render={({ field }) => (
                                        <DatePicker label="تاريخ التأسيس" value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') ?? null)} format="YYYY/MM/DD" slotProps={{ textField: { fullWidth: true, error: !!errors.establishment_date, helperText: errors.establishment_date?.message }}} />
                                    )}/>
                                </Grid>
                                {/* Add is_active Switch if needed later */}

                                {/* Submit Button */}
                                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || storeLoading} size="large">
                                        {isSubmitting || storeLoading ? <CircularProgress size={24}/> : (isEditMode ? 'حفظ التعديلات' : 'إضافة مدرسة')}
                                    </Button>
                                    {/* Cancel Button */}
                                     <Button variant="outlined" onClick={() => navigate(isEditMode ? `/schools/${schoolId}` : '/schools/list')} sx={{ ml: 2 }} disabled={isSubmitting || storeLoading}>إلغاء</Button>
                                </Grid>
                            </Grid>
                        </form>
                    </LocalizationProvider>
                </FormProvider>
            </Paper>
        </Container>
    );
};
export default SchoolForm;