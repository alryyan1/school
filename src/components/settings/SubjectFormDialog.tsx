// src/components/settings/SubjectFormDialog.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, CircularProgress, Alert
} from '@mui/material';
import { Subject, SubjectFormData } from '@/types/subject';
import { useSubjectStore } from '@/stores/subjectStore';
import { useSnackbar } from 'notistack';

interface SubjectFormDialogProps {
    open: boolean;
    onClose: () => void;
    initialData?: Subject | null;
}

const SubjectFormDialog: React.FC<SubjectFormDialogProps> = ({ open, onClose, initialData }) => {
    const isEditMode = !!initialData;
    const { createSubject, updateSubject } = useSubjectStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = React.useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SubjectFormData>({
        defaultValues: { name: '', code: '', description: '' }
    });

    useEffect(() => {
        if (open) {
            setFormError(null);
            reset({
                name: '', code: '', description: '', // Default values for create
                ...(initialData || {}) // Spread initialData if editing
            });
        }
    }, [initialData, open, reset]);

    const onSubmit = async (data: SubjectFormData) => {
        setFormError(null);
        try {
            if (isEditMode && initialData) {
                await updateSubject(initialData.id, data);
                enqueueSnackbar('تم تحديث المادة بنجاح', { variant: 'success' });
            } else {
                await createSubject(data);
                enqueueSnackbar('تم إضافة المادة بنجاح', { variant: 'success' });
            }
            onClose();
        } catch (error: any) {
            console.error("Subject Form submission error:", error);
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
            <DialogTitle>{isEditMode ? 'تعديل المادة الدراسية' : 'إضافة مادة دراسية جديدة'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <Grid container spacing={2.5} sx={{ pt: 1 }}>
                        <Grid item xs={12} sm={7}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'اسم المادة مطلوب' }}
                                render={({ field }) => (
                                    <TextField {...field} label="اسم المادة (مثال: الرياضيات)" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                             <Controller
                                 name="code"
                                 control={control}
                                 rules={{ required: 'رمز المادة مطلوب' }}
                                 render={({ field }) => (
                                     <TextField {...field} label="رمز المادة (مثال: MATH101)" fullWidth required error={!!errors.code} helperText={errors.code?.message} />
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
                        {/* Add fields for is_active, credit_hours, type if needed */}
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

export default SubjectFormDialog;