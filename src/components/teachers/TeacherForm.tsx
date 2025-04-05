// src/components/teachers/TeacherForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    FormControlLabel,
    Switch,
    Avatar, // For image preview
    Container
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar'; // Import Arabic locale for Dayjs
import dayjs from 'dayjs';
import { useTeacherStore } from '@/stores/teacherStore';
import { TeacherFormData,  TeacherResponse } from '@/types/teacher';
import { useSnackbar } from 'notistack';
import { Gender } from '@/types/student';
import { imagesUrl } from '@/constants';

// Helper for file input styling if needed
// const Input = styled('input')({ display: 'none' });

const initialTeacherState: TeacherFormData = {
    national_id: '',
    name: '',
    email: '',
    
    phone: null,
    gender: Gender.Male, // Default value
    birth_date: null, // Default value
    qualification: '',
    hire_date: dayjs().format('YYYY-MM-DD'), // Default to today
    address: null,
    photo: null, // For file object
    is_active: true,
};

const TeacherForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const teacherId = id ? parseInt(id, 10) : undefined;
    const isEditMode = !!teacherId;

    const {
        createTeacher,
        updateTeacher,
        getTeacherById,
        currentTeacher,
        loading: storeLoading,
        error: storeError,
        resetCurrentTeacher
    } = useTeacherStore();

    const methods = useForm<TeacherFormData>({
        defaultValues: initialTeacherState,
    });
    const { control, register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = methods;

    const [isFetchingData, setIsFetchingData] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Watch photo field changes for preview
    const photoFile = watch('photo');
    useEffect(() => {
        if (photoFile && photoFile instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(photoFile);
        } else if (!photoFile && currentTeacher?.data?.photo_url && isEditMode) {
            console.log('photo_url',`${imagesUrl}${currentTeacher.data.photo_path}`)
            // If file removed in edit mode, show original photo
             setImagePreview(`${imagesUrl}${currentTeacher.data.photo_path}`);
        } else if (!photoFile) {
            setImagePreview(null); // Clear preview if no file
        }
    }, [photoFile, currentTeacher, isEditMode]);


    // --- Fetch data in Edit Mode ---
    useEffect(() => {
        if (isEditMode && teacherId) {
            const fetchData = async () => {
                setIsFetchingData(true);
                resetCurrentTeacher(); // Clear previous state
                await getTeacherById(teacherId);
                setIsFetchingData(false);
            };
            fetchData();
        } else {
             reset(initialTeacherState); // Reset for create mode
             setImagePreview(null);
        }
        return () => resetCurrentTeacher(); // Cleanup
    }, [teacherId, isEditMode, getTeacherById, reset, resetCurrentTeacher]);

    // --- Populate form when data arrives in Edit Mode ---
    useEffect(() => {
        if (isEditMode && currentTeacher && currentTeacher.data.id === teacherId) {
            // Reset form with fetched data, ensuring dates are handled
            reset({
                address:currentTeacher.data.address,
                name:currentTeacher.data.name,
                national_id:currentTeacher.data.national_id,
                gender:currentTeacher.data.gender,
                email:currentTeacher.data.email,
                phone:currentTeacher.data.phone,
                qualification:currentTeacher.data.qualification,
                
                birth_date: currentTeacher.data.birth_date ? dayjs(currentTeacher.data.birth_date).format('YYYY-MM-DD') : null,
                hire_date: currentTeacher.data.hire_date ? dayjs(currentTeacher.data.hire_date).format('YYYY-MM-DD') : '',
                photo: null, // Reset photo file input
            });
            setImagePreview(`${imagesUrl}${currentTeacher.data.photo_path}`);
        }
    }, [currentTeacher, isEditMode, reset, teacherId]);

    // --- Handle Form Submission ---
    const onSubmit = async (data: TeacherFormData) => {
        try {
             let result: TeacherResponse | null = null;
            if (isEditMode && teacherId) {
                // Don't send photo_path, backend handles photo file
                const {  ...updateData } = data;
                result = await updateTeacher(teacherId, updateData);
                 if(result) enqueueSnackbar('تم تحديث بيانات المدرس بنجاح', { variant: 'success' });
            } else {
                // Don't send photo_path
                const {  ...createData } = data;
                result = await createTeacher(createData);
                 if(result) enqueueSnackbar('تم إضافة المدرس بنجاح', { variant: 'success' });
            }
             if (result) {
                  navigate(`/teachers/${result.data.id}`); // Navigate to view on success
             } else {
                  // Error snackbar likely shown by store
                  console.error("Form submission failed, result is null");
             }
        } catch (error) {
            // Error handled by store, snackbar likely shown there
            console.error('Form submission error:', error);
        }
    };

    // --- Loading / Error States ---
    if (isFetchingData || (isEditMode && storeLoading && !currentTeacher)) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /><Typography sx={{ ml: 2 }}>جار تحميل بيانات المدرس...</Typography></Box>;
    }
    if (isEditMode && storeError && !isFetchingData) { // Show storeError only after initial fetch attempt
        return <Alert severity="error" sx={{ m: 3 }}>خطأ: {storeError}</Alert>;
    }
     if (isEditMode && !storeLoading && !currentTeacher && !isFetchingData) {
        return <Alert severity="warning" sx={{ m: 3 }}>لم يتم العثور على المدرس بالمعرف: {teacherId}.</Alert>;
     }

console.log(imagePreview,'imagePreview')
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
             <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
                 {isEditMode ? `تعديل بيانات المدرس: ${currentTeacher.data?.name || ''}` : 'إضافة مدرس جديد'}
             </Typography>
             <Paper sx={{ p: { xs: 2, sm: 4 }, mt: 2 }}>
                 <FormProvider {...methods}>
                     <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                         <form onSubmit={handleSubmit(onSubmit)} noValidate>
                             <Grid container spacing={3}>
                                 {/* Image Preview and Upload */}
                                 <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <Avatar
                                          src={imagePreview || undefined}
                                          sx={{ width: 120, height: 120, mb: 2 }}
                                      >
                                          {/* Fallback if no image */}
                                          {!imagePreview && <Typography variant="h4">?</Typography>}
                                      </Avatar>
                                      <Button variant="outlined" component="label">
                                          {isEditMode && currentTeacher.data?.photo_url ? 'تغيير الصورة' : 'تحميل صورة'}
                                          <input
                                              type="file"
                                              hidden
                                              accept="image/*"
                                              onChange={(e) => {
                                                   setValue('photo', e.target.files ? e.target.files[0] : null, { shouldValidate: true });
                                               }}
                                          />
                                      </Button>
                                      {errors.photo && <Typography color="error" variant="caption">{errors.photo.message}</Typography>}
                                 </Grid>

                                 {/* Form Fields */}
                                 <Grid item xs={12} sm={6}>
                                      <TextField
                                          {...register('national_id', { required: 'الرقم الوطني مطلوب' })}
                                          label="الرقم الوطني"
                                          fullWidth
                                          required
                                          error={!!errors.national_id}
                                          helperText={errors.national_id?.message}
                                      />
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                      <TextField
                                          {...register('name', { required: 'اسم المدرس مطلوب' })}
                                          label="اسم المدرس الكامل"
                                          fullWidth
                                          required
                                          error={!!errors.name}
                                          helperText={errors.name?.message}
                                      />
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                      <TextField
                                          {...register('email', {
                                              required: 'البريد الإلكتروني مطلوب',
                                              pattern: { value: /^\S+@\S+$/i, message: 'صيغة البريد الإلكتروني غير صحيحة' }
                                          })}
                                          label="البريد الإلكتروني"
                                          type="email"
                                          fullWidth
                                          required
                                          error={!!errors.email}
                                          helperText={errors.email?.message}
                                      />
                                 </Grid>
                                  <Grid item xs={12} sm={6}>
                                     <TextField
                                         {...register('phone')}
                                         label="رقم الهاتف"
                                         fullWidth
                                         error={!!errors.phone}
                                         helperText={errors.phone?.message}
                                     />
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                     <FormControl fullWidth error={!!errors.gender}>
                                         <InputLabel id="gender-label">الجنس *</InputLabel>
                                         <Controller
                                             name="gender"
                                             control={control}
                                             rules={{ required: 'الجنس مطلوب' }}
                                             render={({ field }) => (
                                                 <Select labelId="gender-label" label="الجنس *" {...field}>
                                                     <MenuItem value="ذكر">ذكر</MenuItem>
                                                     <MenuItem value="انثي">انثي</MenuItem>
                                                 </Select>
                                             )}
                                         />
                                         {errors.gender && <Typography color="error" variant="caption">{errors.gender.message}</Typography>}
                                     </FormControl>
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                     <Controller
                                         name="birth_date"
                                         control={control}
                                         render={({ field }) => (
                                             <DatePicker
                                                 label="تاريخ الميلاد"
                                                 value={field.value ? dayjs(field.value) : null}
                                                 onChange={(newValue) => field.onChange(newValue ? newValue.format('YYYY-MM-DD') : null)}
                                                 format="YYYY/MM/DD" // Display format
                                                  slotProps={{
                                                      textField: {
                                                          fullWidth: true,
                                                          error: !!errors.birth_date,
                                                          helperText: errors.birth_date?.message,
                                                      },
                                                  }}
                                             />
                                         )}
                                     />
                                 </Grid>
                                  <Grid item xs={12} sm={6}>
                                     <TextField
                                         {...register('qualification', { required: 'المؤهل العلمي مطلوب' })}
                                         label="المؤهل العلمي"
                                         fullWidth
                                         required
                                         error={!!errors.qualification}
                                         helperText={errors.qualification?.message}
                                     />
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                     <Controller
                                         name="hire_date"
                                         control={control}
                                         rules={{ required: 'تاريخ التعيين مطلوب' }}
                                         render={({ field }) => (
                                             <DatePicker
                                                 label="تاريخ التعيين *"
                                                 value={field.value ? dayjs(field.value) : null}
                                                 onChange={(newValue) => field.onChange(newValue ? newValue.format('YYYY-MM-DD') : null)}
                                                  format="YYYY/MM/DD" // Display format
                                                  slotProps={{
                                                      textField: {
                                                          fullWidth: true,
                                                          required: true,
                                                          error: !!errors.hire_date,
                                                          helperText: errors.hire_date?.message,
                                                      },
                                                  }}
                                             />
                                         )}
                                     />
                                 </Grid>
                                  <Grid item xs={12}>
                                     <TextField
                                         {...register('address')}
                                         label="العنوان"
                                         fullWidth
                                         multiline
                                         rows={3}
                                         error={!!errors.address}
                                         helperText={errors.address?.message}
                                     />
                                 </Grid>
                                 <Grid item xs={12}>
                                     <FormControlLabel
                                         control={
                                             <Controller
                                                 name="is_active"
                                                 control={control}
                                                 render={({ field }) => (
                                                     <Switch {...field} checked={field.value} />
                                                 )}
                                             />
                                         }
                                         label="الحساب نشط"
                                     />
                                 </Grid>

                                 {/* Submit Button */}
                                 <Grid  item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                                     <Button
                                         type="submit"
                                         variant="contained"
                                         color="primary"
                                         disabled={isSubmitting || storeLoading}
                                         size="large"
                                         sx={{ minWidth: 150 }}
                                     >
                                         {isSubmitting || storeLoading ? <CircularProgress size={24} /> : (isEditMode ? 'حفظ التعديلات' : 'إضافة مدرس')}
                                     </Button>
                                     <Button
                                          variant="outlined"
                                          color="secondary"
                                          onClick={() => navigate(isEditMode ? `/teachers/${teacherId}` : '/teachers/list')}
                                          sx={{ minWidth: 150, ml: 2 }}
                                          disabled={isSubmitting || storeLoading}
                                     >
                                         إلغاء
                                     </Button>
                                 </Grid>
                             </Grid>
                         </form>
                      </LocalizationProvider>
                 </FormProvider>
             </Paper>
         </Container>
     );
 };

 export default TeacherForm;