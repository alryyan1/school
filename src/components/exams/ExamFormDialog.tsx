// src/components/exams/ExamFormDialog.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar';
import dayjs from 'dayjs';
import { Exam, ExamFormData } from '@/types/exam';
import { useExamStore } from '@/stores/examStore';
import { useSchoolStore } from '@/stores/schoolStore';
import { useSnackbar } from 'notistack';

interface ExamFormDialogProps {
    open: boolean;
    onClose: () => void;
    initialData?: Exam | null; // For editing
}

const ExamFormDialog: React.FC<ExamFormDialogProps> = ({ open, onClose, initialData }) => {
    const isEditMode = !!initialData;
    const { createExam, updateExam } = useExamStore();
    const { schools, fetchSchools } = useSchoolStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = React.useState<string | null>(null);

    const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ExamFormData>({
        defaultValues: { name: '', school_id: '', start_date: dayjs().format('YYYY-MM-DD'), end_date: dayjs().add(7, 'day').format('YYYY-MM-DD'), description: '' }
    });

    // Fetch schools if needed
    useEffect(() => {
        if (open && schools.length === 0) {
            fetchSchools();
        }
    }, [open, schools.length, fetchSchools]);

    // Reset form
    useEffect(() => {
        if (open) {
            setFormError(null);
            reset({
                name: '', school_id: '', start_date: dayjs().format('YYYY-MM-DD'), end_date: dayjs().add(7, 'day').format('YYYY-MM-DD'), description: '',
                 ...(initialData ? {
                     ...initialData,
                     start_date: dayjs(initialData.start_date).format('YYYY-MM-DD'),
                     end_date: dayjs(initialData.end_date).format('YYYY-MM-DD'),
                     description: initialData.description || '', // Ensure empty string if null
                 } : {}),
            });
        }
    }, [initialData, open, reset]);

    const onSubmit = async (data: ExamFormData) => {
        setFormError(null);
        const submitData = { ...data, school_id: Number(data.school_id) };

        try {
            if (isEditMode && initialData) {
                await updateExam(initialData.id, submitData);
                enqueueSnackbar('تم تحديث دورة الامتحان بنجاح', { variant: 'success' });
            } else {
                await createExam(submitData);
                enqueueSnackbar('تم إضافة دورة الامتحان بنجاح', { variant: 'success' });
            }
            onClose();
        } catch (error: any) {
             console.error("Exam Form submission error:", error);
             const backendErrors = error.response?.data?.errors;
             if (backendErrors) {
                 setFormError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(error.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditMode ? 'تعديل دورة الامتحان' : 'إضافة دورة امتحان جديدة'}</DialogTitle>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                        <Grid container spacing={2.5} sx={{ pt: 1 }}>
                             <Grid item xs={12}>
                                <Controller name="school_id" control={control} rules={{ required: 'المدرسة مطلوبة' }}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.school_id}>
                                            <InputLabel id="exam-school-label">المدرسة *</InputLabel>
                                            <Select labelId="exam-school-label" label="المدرسة *" {...field} value={field.value || ''} disabled={isEditMode}>
                                                <MenuItem value="" disabled><em>اختر مدرسة...</em></MenuItem>
                                                {schools.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                                            </Select>
                                            {errors.school_id && <FormHelperText>{errors.school_id.message}</FormHelperText>}
                                        </FormControl>
                                    )} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="name" control={control} rules={{ required: 'اسم الدورة مطلوب' }}
                                    render={({ field }) => (
                                        <TextField {...field} label="اسم الدورة (مثال: امتحانات نصف الفصل 2024)" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                                    )} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller name="start_date" control={control} rules={{ required: 'تاريخ البداية مطلوب' }}
                                    render={({ field }) => (
                                        <DatePicker label="تاريخ البداية *" value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') ?? null)} format="YYYY/MM/DD" slotProps={{ textField: { fullWidth: true, required: true, error: !!errors.start_date, helperText: errors.start_date?.message }}} />
                                    )} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller name="end_date" control={control} rules={{
                                     required: 'تاريخ النهاية مطلوب',
                                     validate: value => dayjs(value).isAfter(dayjs(watch('start_date')), 'day') || dayjs(value).isSame(dayjs(watch('start_date')), 'day') || 'تاريخ النهاية يجب أن يكون بعد أو نفس تاريخ البداية'
                                 }}
                                    render={({ field }) => (
                                        <DatePicker label="تاريخ النهاية *" value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') ?? null)} format="YYYY/MM/DD" slotProps={{ textField: { fullWidth: true, required: true, error: !!errors.end_date, helperText: errors.end_date?.message }}} />
                                    )} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="description" control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="الوصف (اختياري)" fullWidth multiline rows={3} />
                                    )} />
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

export default ExamFormDialog;