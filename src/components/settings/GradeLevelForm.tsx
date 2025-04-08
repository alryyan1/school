// src/components/settings/GradeLevelForm.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, CircularProgress, Alert
} from '@mui/material';
import { GradeLevel, GradeLevelFormData } from '@/types/gradeLevel';
import { useGradeLevelStore } from '@/stores/gradeLevelStore';
import { useSnackbar } from 'notistack';

interface GradeLevelFormProps {
    open: boolean;
    onClose: () => void;
    initialData?: GradeLevel | null;
}

const GradeLevelForm: React.FC<GradeLevelFormProps> = ({ open, onClose, initialData }) => {
    const isEditMode = !!initialData;
    const { createGradeLevel, updateGradeLevel } = useGradeLevelStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = React.useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GradeLevelFormData>({
        defaultValues: { name: '', code: '', description: '' }
    });

    // Reset form when initialData changes or dialog opens/closes
    useEffect(() => {
        if (open) {
            setFormError(null);
            reset({
                name: '', code: '', description: '',
                ...(initialData || {})
            });
        }
    }, [initialData, open, reset]);

    const onSubmit = async (data: GradeLevelFormData) => {
        setFormError(null);
        try {
            if (isEditMode && initialData) {
                await updateGradeLevel(initialData.id, data);
                enqueueSnackbar('تم تحديث المرحلة بنجاح', { variant: 'success' });
            } else {
                await createGradeLevel(data);
                enqueueSnackbar('تم إضافة المرحلة بنجاح', { variant: 'success' });
            }
            onClose(); // Close dialog on success
        } catch (error: any) {
            console.error("GradeLevel Form submission error:", error);
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
            <DialogTitle>{isEditMode ? 'تعديل المرحلة الدراسية' : 'إضافة مرحلة دراسية جديدة'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <Grid container spacing={2.5} sx={{ pt: 1 }}>
                        <Grid item xs={12} sm={7}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'اسم المرحلة مطلوب' }}
                                render={({ field }) => (
                                    <TextField {...field} label="اسم المرحلة (مثال: الصف العاشر)" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                             <Controller
                                 name="code"
                                 control={control}
                                 rules={{ required: 'رمز المرحلة مطلوب' }}
                                 render={({ field }) => (
                                     <TextField {...field} label="رمز المرحلة (مثال: G10)" fullWidth required error={!!errors.code} helperText={errors.code?.message} />
                                 )}
                             />
                         </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="الوصف (اختياري)" fullWidth multiline rows={3} />
                                )}
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
        </Dialog>
    );
};

export default GradeLevelForm;