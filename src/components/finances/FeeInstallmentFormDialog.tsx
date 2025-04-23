// src/components/finances/FeeInstallmentFormDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
    CircularProgress, Alert
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar';
import dayjs from 'dayjs';
import { FeeInstallment, FeeInstallmentFormData } from '@/types/feeInstallment'; // Adjust path
import { useFeeInstallmentStore } from '@/stores/feeInstallmentStore';       // Adjust path
import { useSnackbar } from 'notistack';

interface FeeInstallmentFormDialogProps {
    open: boolean;
    onClose: (refetch?: boolean) => void; // Callback to close and signal refetch
    studentAcademicYearId: number;       // ID of the parent enrollment
    initialData?: FeeInstallment | null; // For editing
}

// Exclude fields managed automatically or in other contexts
type DialogFormData = Omit<FeeInstallmentFormData, 'student_academic_year_id'>;

const FeeInstallmentFormDialog: React.FC<FeeInstallmentFormDialogProps> = ({
    open, onClose, studentAcademicYearId, initialData
}) => {
    const isEditMode = !!initialData;
    const { createInstallment, updateInstallment } = useFeeInstallmentStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DialogFormData>({
        defaultValues: {
            title: '',
            amount_due: '', // Use string for input
            due_date: dayjs().format('YYYY-MM-DD'),
            notes: '',
        }
    });

    // Reset form when opening or data changes
    useEffect(() => {
        if (open) {
            setFormError(null);
            if (isEditMode && initialData) {
                reset({
                    title: initialData.title || '',
                    amount_due: String(initialData.amount_due ?? ''), // Convert to string for input
                    due_date: dayjs(initialData.due_date).format('YYYY-MM-DD'),
                    notes: initialData.notes || '',
                });
            } else {
                // Defaults for create mode
                reset({
                    title: '',
                    amount_due: '',
                    due_date: dayjs().add(1,'month').format('YYYY-MM-DD'), // Default due next month
                    notes: '',
                });
            }
        }
    }, [initialData, isEditMode, open, reset]);

    const onSubmit = async (data: DialogFormData) => {
        setFormError(null);
        const submitData: Partial<FeeInstallmentFormData> = {
            ...data,
            amount_due: Number(data.amount_due), // Convert back to number
            // Include the parent ID for create/update context
            student_academic_year_id: studentAcademicYearId,
        };

        // Ensure dates are valid before submitting
         if (!dayjs(submitData.due_date).isValid()) {
            setFormError("تاريخ الاستحقاق غير صحيح.");
            return;
        }


        try {
            if (isEditMode && initialData) {
                // Don't send studentAcademicYearId on update if not changing
                const { student_academic_year_id, ...updatePayload } = submitData;
                await updateInstallment(initialData.id, updatePayload);
                enqueueSnackbar('تم تحديث القسط بنجاح', { variant: 'success' });
            } else {
                 // Ensure all required fields are present for creation
                if(!submitData.title || !submitData.amount_due || !submitData.due_date || !submitData.student_academic_year_id) {
                     setFormError("الرجاء ملء جميع الحقول المطلوبة.");
                     return;
                 }
                await createInstallment(submitData as FeeInstallmentFormData); // Cast needed as we added student_id
                enqueueSnackbar('تم إضافة القسط بنجاح', { variant: 'success' });
            }
            onClose(true); // Close dialog and signal refetch on success
        } catch (error: any) {
             console.error("Installment Form submission error:", error);
             const backendErrors = error.response?.data?.errors;
             if (backendErrors) {
                 setFormError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(error.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="xs" fullWidth dir="rtl">
            <DialogTitle>{isEditMode ? 'تعديل القسط' : 'إضافة قسط جديد'}</DialogTitle>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}
                        <Grid container spacing={2.5} sx={{ pt: 1 }}>
                             <Grid item xs={12}>
                                <Controller name="title" control={control} rules={{ required: 'عنوان القسط مطلوب' }}
                                    render={({ field }) => (
                                        <TextField {...field} label="عنوان القسط (مثال: القسط الأول)" fullWidth required error={!!errors.title} helperText={errors.title?.message} />
                                    )} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller name="amount_due" control={control} 
                                    render={({ field }) => (
                                        <TextField {...field} label="المبلغ المستحق *" type="number" fullWidth required error={!!errors.amount_due} helperText={errors.amount_due?.message}  />
                                    )} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller name="due_date" control={control} rules={{ required: 'تاريخ الاستحقاق مطلوب' }}
                                    render={({ field }) => (
                                        <DatePicker label="تاريخ الاستحقاق *" value={field.value ? dayjs(field.value) : null} onChange={(d) => field.onChange(d?.format('YYYY-MM-DD') ?? null)} format="YYYY/MM/DD" slotProps={{ textField: { fullWidth: true, required: true, error: !!errors.due_date, helperText: errors.due_date?.message }}} />
                                    )} />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller name="notes" control={control}
                                    render={({ field }) => (
                                        <TextField {...field} value={field.value ?? ''} label="ملاحظات (اختياري)" fullWidth multiline rows={3} />
                                    )} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => onClose()} color="inherit" disabled={isSubmitting}>إلغاء</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={22} /> : (isEditMode ? 'حفظ التعديلات' : 'إضافة قسط')}
                        </Button>
                    </DialogActions>
                </form>
            </LocalizationProvider>
        </Dialog>
    );
};

export default FeeInstallmentFormDialog;