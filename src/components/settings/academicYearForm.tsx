// src/components/settings/AcademicYearForm.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, FormControlLabel, Switch, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar';
import dayjs from 'dayjs';
import { AcademicYear, AcademicYearFormData } from '@/types/academicYear';
import { useAcademicYearStore } from '@/stores/academicYearStore';
import { useSchoolStore } from '@/stores/schoolStore'; // To get schools for dropdown
import { useSnackbar } from 'notistack';

interface AcademicYearFormProps {
    open: boolean;
    onClose: () => void;
    initialData?: AcademicYear | null; // Pass data for editing
}

const AcademicYearForm: React.FC<AcademicYearFormProps> = ({ open, onClose, initialData }) => {
    const isEditMode = !!initialData;
    const { createAcademicYear, updateAcademicYear } = useAcademicYearStore();
    const { schools, fetchSchools: fetchSchoolList } = useSchoolStore(); // Fetch schools for dropdown
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = React.useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AcademicYearFormData>({
        defaultValues: {
            name: '',
            start_date: dayjs().format('YYYY-MM-DD'),
            end_date: dayjs().add(9, 'month').format('YYYY-MM-DD'),
            is_current: false,
            school_id: '', // Important: Initialize as empty string or number type if control expects it
             ...(initialData ? {
                 ...initialData,
                  start_date: dayjs(initialData.start_date).format('YYYY-MM-DD'),
                  end_date: dayjs(initialData.end_date).format('YYYY-MM-DD'),
             } : {}),
        },
    });

    // Fetch schools when the dialog opens if not already loaded
     useEffect(() => {
         if (open && schools.length === 0) {
             fetchSchoolList();
         }
     }, [open, schools.length, fetchSchoolList]);

    // Reset form when initialData changes or dialog opens/closes
    useEffect(() => {
        if (open) {
            setFormError(null); // Clear errors on open
            reset({
                 name: '', start_date: dayjs().format('YYYY-MM-DD'), end_date: dayjs().add(9, 'month').format('YYYY-MM-DD'), is_current: false, school_id: '',
                 ...(initialData ? {
                     ...initialData,
                      start_date: dayjs(initialData.start_date).format('YYYY-MM-DD'),
                      end_date: dayjs(initialData.end_date).format('YYYY-MM-DD'),
                 } : {}),
            });
        }
    }, [initialData, open, reset]);

    const onSubmit = async (data: AcademicYearFormData) => {
         setFormError(null);
         // Ensure school_id is a number if needed by backend/validation
         const submitData = { ...data, school_id: Number(data.school_id) };

         try {
             if (isEditMode && initialData) {
                 await updateAcademicYear(initialData.id, submitData);
                 enqueueSnackbar('تم تحديث العام الدراسي بنجاح', { variant: 'success' });
             } else {
                 await createAcademicYear(submitData);
                 enqueueSnackbar('تم إضافة العام الدراسي بنجاح', { variant: 'success' });
             }
             onClose(); // Close dialog on success
         } catch (error: any) {
              console.error("Form submission error:", error);
              // Extract backend validation errors if possible
              const backendErrors = error.response?.data?.errors;
              if (backendErrors) {
                  const errorMessages = Object.values(backendErrors).flat().join('. ');
                  setFormError(`فشل الحفظ: ${errorMessages}`);
              } else {
                  setFormError(error.message || 'حدث خطأ غير متوقع.');
              }
         }
     };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditMode ? 'تعديل العام الدراسي' : 'إضافة عام دراسي جديد'}</DialogTitle>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                        <Grid container spacing={2.5} sx={{ pt: 1 }}> {/* Padding top */}
                             <Grid item xs={12}>
                                 <Controller
                                     name="school_id"
                                     control={control}
                                     rules={{ required: 'المدرسة مطلوبة' }}
                                     render={({ field }) => (
                                         <FormControl fullWidth error={!!errors.school_id}>
                                             <InputLabel id="school-select-label">المدرسة *</InputLabel>
                                             <Select
                                                 labelId="school-select-label"
                                                 label="المدرسة *"
                                                 {...field}
                                                 value={field.value || ''} // Handle potential number/string type issues
                                                 disabled={isEditMode} // Usually don't change school on edit
                                             >
                                                 <MenuItem value="" disabled><em>اختر مدرسة...</em></MenuItem>
                                                 {schools.map((school) => (
                                                     <MenuItem key={school.id} value={school.id}>{school.name}</MenuItem>
                                                 ))}
                                             </Select>
                                             {errors.school_id && <FormHelperText>{errors.school_id.message}</FormHelperText>}
                                         </FormControl>
                                     )}
                                 />
                             </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{ required: 'اسم العام الدراسي مطلوب' }}
                                    render={({ field }) => (
                                        <TextField {...field} label="اسم العام الدراسي (مثال: 2024-2025)" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="start_date"
                                    control={control}
                                    rules={{ required: 'تاريخ البداية مطلوب' }}
                                    render={({ field }) => (
                                        <DatePicker label="تاريخ البداية *" value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') ?? null)} format="YYYY/MM/DD" slotProps={{ textField: { fullWidth: true, required: true, error: !!errors.start_date, helperText: errors.start_date?.message }}} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="end_date"
                                    control={control}
                                    rules={{
                                         required: 'تاريخ النهاية مطلوب',
                                         validate: value => dayjs(value).isAfter(dayjs(control._getWatch('start_date'))) || 'تاريخ النهاية يجب أن يكون بعد البداية'
                                     }}
                                    render={({ field }) => (
                                        <DatePicker label="تاريخ النهاية *" value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') ?? null)} format="YYYY/MM/DD" slotProps={{ textField: { fullWidth: true, required: true, error: !!errors.end_date, helperText: errors.end_date?.message }}} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Controller
                                            name="is_current"
                                            control={control}
                                            render={({ field }) => <Switch {...field} checked={field.value} />}
                                        />
                                    }
                                    label="تعيين كـ عام دراسي حالي؟ (سيتم إلغاء تعيين الأعوام الأخرى لنفس المدرسة)"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>إلغاء</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={22} /> : (isEditMode ? 'حفظ التعديلات' : 'إضافة')}
                        </Button>
                    </DialogActions>
                </form>
            </LocalizationProvider>
        </Dialog>
    );
};

export default AcademicYearForm;