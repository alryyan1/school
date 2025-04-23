// src/components/finances/GenerateInstallmentsDialog.tsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
    CircularProgress, Alert, Typography
} from '@mui/material';
import { FeeInstallmentApi } from '@/api/feeInstallmentApi'; // Adjust path
import { useSnackbar } from 'notistack';

interface GenerateInstallmentsDialogProps {
    open: boolean;
    onClose: (refetch?: boolean) => void; // Callback to close and signal refetch
    studentAcademicYearId: number;
    // Optional: Pass default total amount if calculable elsewhere
    defaultTotalAmount?: number | string;
}

type GenerateFormData = {
    total_amount: string;
    number_of_installments: string;
};

const GenerateInstallmentsDialog: React.FC<GenerateInstallmentsDialogProps> = ({
    open, onClose, studentAcademicYearId, defaultTotalAmount
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GenerateFormData>({
        defaultValues: {
            total_amount: String(defaultTotalAmount ?? ''),
            number_of_installments: '4', // Default to 4 installments
        }
    });

    // Reset form when opening
    React.useEffect(() => {
        if (open) {
            setFormError(null);
            reset({
                total_amount: String(defaultTotalAmount ?? ''),
                number_of_installments: '4',
            });
        }
    }, [open, reset, defaultTotalAmount]);

    const onSubmit = async (data: GenerateFormData) => {
        setFormError(null);
        const total = Number(data.total_amount);
        const count = Number(data.number_of_installments);

        if (isNaN(total) || total <= 0 || isNaN(count) || count < 1 || count > 12) {
             setFormError("الرجاء إدخال مبلغ إجمالي صحيح وعدد أقساط بين 1 و 12.");
             return;
        }

        try {
            await FeeInstallmentApi.generateInstallments(studentAcademicYearId, total, count);
            enqueueSnackbar('تم إنشاء جدول الأقساط بنجاح.', { variant: 'success' });
            onClose(true); // Close and signal refetch
        } catch (error: any) {
            console.error("Generate Installments error:", error);
            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                 setFormError(`فشل الإنشاء: ${Object.values(backendErrors).flat().join('. ')}`);
            } else {
                 setFormError(error.response?.data?.message || error.message || 'حدث خطأ غير متوقع.');
            }
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="xs" fullWidth dir="rtl">
            <DialogTitle>إنشاء جدول أقساط تلقائي</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                        سيقوم النظام بتقسيم المبلغ الإجمالي على عدد الأقساط وتوزيع تواريخ الاستحقاق بشكل متساوٍ خلال فترة العام الدراسي.
                    </Typography>
                    {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                             <Controller name="total_amount" control={control} rules={{ required: 'المبلغ الإجمالي مطلوب', min: { value: 0.01, message: 'المبلغ يجب أن يكون أكبر من صفر' } }}
                                render={({ field }) => (
                                    <TextField {...field} label="المبلغ الإجمالي للعام *" type="number" fullWidth required autoFocus error={!!errors.total_amount} helperText={errors.total_amount?.message} InputProps={{ inputProps: { step: "any", min: "0.01" } }}/>
                                )} />
                        </Grid>
                        <Grid item xs={12}>
                              <Controller name="number_of_installments" control={control} rules={{ required: 'عدد الأقساط مطلوب', min: {value: 1, message: 'قسط واحد على الأقل'}, max: {value: 12, message: 'الحد الأقصى 12 قسطًا'} }}
                                render={({ field }) => (
                                    <TextField {...field} label="عدد الأقساط (1-12) *" type="number" fullWidth required error={!!errors.number_of_installments} helperText={errors.number_of_installments?.message} InputProps={{ inputProps: { min: 1, max: 12, step: 1 } }}/>
                                )} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => onClose()} color="inherit" disabled={isSubmitting}>إلغاء</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={22} /> : 'إنشاء الأقساط'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default GenerateInstallmentsDialog;