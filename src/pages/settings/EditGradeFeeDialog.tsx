// src/components/settings/EditGradeFeeDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
    CircularProgress, Alert, Typography
} from '@mui/material';
import { GradeLevel, UpdateGradeFeeFormData } from '@/types/gradeLevel'; // Adjust path
import { SchoolApi } from '@/api/schoolApi';       // Adjust path
import { useSnackbar } from 'notistack';

interface EditGradeFeeDialogProps {
    open: boolean;
    onClose: (refetch?: boolean) => void;
    schoolId: number;
    gradeLevel: GradeLevel | null; // Contains current pivot data in assignment_details
}

const EditGradeFeeDialog: React.FC<EditGradeFeeDialogProps> = ({
    open, onClose, schoolId, gradeLevel
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateGradeFeeFormData>({
        defaultValues: { basic_fees: '' }
    });

    // Reset form when dialog opens or data changes
    useEffect(() => {
        if (open && gradeLevel) {
            setFormError(null);
            reset({
                basic_fees: gradeLevel.assignment_details?.basic_fees ?? '0' // Pre-fill with current fee
            });
        }
    }, [gradeLevel, open, reset]);

    const onSubmit = async (data: UpdateGradeFeeFormData) => {
        if (!gradeLevel) return; // Should not happen if dialog is open
        setFormError(null);
        const fees = Number(data.basic_fees) || 0;

        try {
            await SchoolApi.updateGradeLevelFee(schoolId, gradeLevel.id, fees);
            enqueueSnackbar('تم تحديث الرسوم بنجاح', { variant: 'success' });
            onClose(true); // Close and refetch
        } catch (error: any) {
            console.error("Update Fee Error:", error);
            const backendErrors = error.response?.data?.errors;
             if (backendErrors) {
                 setFormError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(error.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

     if (!gradeLevel) return null; // Don't render without data

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="xs" fullWidth dir="rtl">
            <DialogTitle>تعديل الرسوم الأساسية</DialogTitle>
             <Typography variant="body2" color="text.secondary" sx={{ px: 3, mb: -1 }}>
                 للمرحلة: <strong>{gradeLevel.name} ({gradeLevel.code})</strong>
             </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={12}>
                            <Controller name="basic_fees" control={control} rules={{ required: 'الرسوم الأساسية مطلوبة', min: {value: 0, message: 'الرسوم لا يمكن أن تكون سالبة'} }}
                                render={({ field }) => (
                                    <TextField {...field} label="الرسوم الأساسية *" type="number" fullWidth required error={!!errors.basic_fees} helperText={errors.basic_fees?.message} InputProps={{ inputProps: { min: 0, step: "1" } }}/>
                                )} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => onClose()} color="inherit" disabled={isSubmitting}>إلغاء</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={22} /> : 'حفظ التعديل'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditGradeFeeDialog;