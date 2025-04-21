// src/components/finances/StudentFeePaymentFormDialog.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, CircularProgress, Alert, InputAdornment
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar';
import dayjs from 'dayjs';
import { StudentFeePayment, StudentFeePaymentFormData } from '@/types/studentFeePayment';
import { useStudentFeePaymentStore } from '@/stores/studentFeePaymentStore';
import { useSnackbar } from 'notistack';

interface StudentFeePaymentFormDialogProps {
    open: boolean;
    onClose: () => void;
    studentAcademicYearId: number; // ID of the enrollment record
    initialData?: StudentFeePayment | null; // For editing
}

const StudentFeePaymentFormDialog: React.FC<StudentFeePaymentFormDialogProps> = ({
    open, onClose, studentAcademicYearId, initialData
}) => {
    const isEditMode = !!initialData;
    const { createPayment, updatePayment } = useStudentFeePaymentStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = React.useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StudentFeePaymentFormData>({
        defaultValues: {
            student_academic_year_id: studentAcademicYearId,
            amount: '', // Use empty string, handle as number on submit
            payment_date: dayjs().format('YYYY-MM-DD'),
            notes: '',
        }
    });

    // Reset form when opening or data changes
    useEffect(() => {
        if (open) {
            setFormError(null);
            reset({
                student_academic_year_id: studentAcademicYearId,
                amount: '', payment_date: dayjs().format('YYYY-MM-DD'), notes: '', // Create defaults
                ...(initialData ? { // Edit defaults
                     ...initialData,
                     amount: initialData.amount, // Keep original type for display if needed
                     payment_date: dayjs(initialData.payment_date).format('YYYY-MM-DD'),
                     notes: initialData.notes || '',
                 } : {})
            });
        }
    }, [initialData, open, reset, studentAcademicYearId]);

    const onSubmit = async (data: StudentFeePaymentFormData) => {
        setFormError(null);
        const submitData = {
             ...data,
             amount: Number(data.amount) // Convert amount to number for API
        };

        try {
            if (isEditMode && initialData) {
                await updatePayment(initialData.id, submitData);
                enqueueSnackbar('تم تحديث الدفعة بنجاح', { variant: 'success' });
            } else {
                await createPayment(submitData);
                enqueueSnackbar('تم إضافة الدفعة بنجاح', { variant: 'success' });
            }
            onClose();
        } catch (error: any) {
            console.error("Payment Form submission error:", error);
            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                 setFormError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
            } else {
                 setFormError(error.message || 'حدث خطأ غير متوقع.');
            }
        }
    };

    return (
        <Dialog  open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{isEditMode ? 'تعديل سجل دفعة' : 'إضافة دفعة جديدة'}</DialogTitle>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                        <Grid container spacing={2.5} sx={{ pt: 1 }}>
                            <Grid item xs={12}>
                                <Controller
                                    name="amount"
                                    control={control}
                                    rules={{
                                         required: 'المبلغ مطلوب',
                                         min: { value: 0.01, message: 'المبلغ يجب أن يكون أكبر من صفر' },
                                         pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'صيغة المبلغ غير صحيحة (e.g., 150.50)' }
                                    }}
                                    render={({ field }) => (
                                        <TextField {...field} label="المبلغ" type="number" fullWidth required
                                            error={!!errors.amount} helperText={errors.amount?.message}
                                            InputProps={{
                                                 inputProps: { step: "0.01", min: "0.01" },
                                                 endAdornment: <InputAdornment position="end">SDG</InputAdornment> // Example currency
                                             }}
                                        />
                                    )}
                                />
                            </Grid>
                             <Grid item xs={12}>
                                <Controller
                                    name="payment_date"
                                    control={control}
                                    rules={{ required: 'تاريخ الدفعة مطلوب' }}
                                    render={({ field }) => (
                                        <DatePicker label="تاريخ الدفعة *" value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') ?? null)} format="YYYY/MM/DD" slotProps={{ textField: { fullWidth: true, required: true, error: !!errors.payment_date, helperText: errors.payment_date?.message }}} />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="ملاحظات (اختياري)" fullWidth multiline rows={3} />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>إلغاء</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={22} /> : (isEditMode ? 'حفظ التعديلات' : 'إضافة دفعة')}
                        </Button>
                    </DialogActions>
                </form>
            </LocalizationProvider>
        </Dialog>
    );
};

export default StudentFeePaymentFormDialog;