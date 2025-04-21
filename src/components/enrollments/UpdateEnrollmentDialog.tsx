// src/components/enrollments/UpdateEnrollmentDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, FormHelperText, Typography
} from '@mui/material';
import { StudentAcademicYear, StudentEnrollmentUpdateFormData, EnrollmentStatus } from '@/types/studentAcademicYear';
import { useClassroomStore } from '@/stores/classroomStore';
import { useSnackbar } from 'notistack';
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore';

interface UpdateEnrollmentDialogProps {
    open: boolean;
    onClose: () => void;
    enrollmentData: StudentAcademicYear | null; // Pass data for editing
}

const statusOptions: EnrollmentStatus[] = ['active', 'transferred', 'graduated', 'withdrawn'];

const UpdateEnrollmentDialog: React.FC<UpdateEnrollmentDialogProps> = ({ open, onClose, enrollmentData }) => {
    const { updateEnrollment } = useStudentEnrollmentStore();
     // Assuming classrooms for the relevant grade are already fetched by the main page
     const { classrooms, fetchClassrooms: fetchGradeClassrooms, loading: loadingClassrooms } = useClassroomStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StudentEnrollmentUpdateFormData>({
        defaultValues: { classroom_id: null, status: 'active' }
    });

   // Fetch classrooms and Reset form logic
useEffect(() => {
    if (open && enrollmentData) {
        setFormError(null);
        // Fetch classrooms for the specific grade/school of this enrollment
        if (enrollmentData.grade_level_id && enrollmentData.school_id) {
             fetchGradeClassrooms({
                 grade_level_id: enrollmentData.grade_level_id,
                 school_id: enrollmentData.school_id
             });
        }
        // Reset form with existing enrollment data
        reset({
            classroom_id: enrollmentData.classroom_id || null, // Use null if undefined/null
            status: enrollmentData.status,
        });
    }
}, [enrollmentData, open, reset, fetchGradeClassrooms]);


    const onSubmit = async (data: StudentEnrollmentUpdateFormData) => {
        if (!enrollmentData) return;
        setFormError(null);
        const submitData = {
            ...data,
            classroom_id: data.classroom_id ? Number(data.classroom_id) : null,
        };

        try {
            await updateEnrollment(enrollmentData.id  as number, submitData);
            enqueueSnackbar('تم تحديث تسجيل الطالب بنجاح', { variant: 'success' });
            onClose();
        } catch (error) {
             console.error("Update Enrollment Form submission error:", error);
             const backendErrors = error.response?.data?.errors;
             if (backendErrors) {
                 setFormError(`فشل التحديث: ${Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(error.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

    if (!enrollmentData) return null; // Don't render if no data

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth dir="rtl">
            <DialogTitle>
                تعديل تسجيل الطالب: {enrollmentData.student?.student_name ?? '...'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {/* Display context */}
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                         العام الدراسي: <strong>{enrollmentData.academic_year?.name ?? '...'}</strong>
                     </Typography>
                     <Typography variant="body2" color="text.secondary" gutterBottom>
                          المرحلة: <strong>{enrollmentData.grade_level?.name ?? '...'}</strong>
                     </Typography>
    
                     {formError && <Alert severity="error" sx={{ my: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}
    
                    {/* Form Fields */}
                    <Grid container spacing={2.5} sx={{ pt: 2 }}>
                         <Grid item xs={12}>
                             <Controller
                                name="classroom_id"
                                control={control}
                                render={({ field }) => (
                                     <FormControl fullWidth error={!!errors.classroom_id} disabled={loadingClassrooms}>
                                         <InputLabel id="upd-classroom-label">الفصل (اختياري)</InputLabel>
                                         <Select
                                            labelId="upd-classroom-label"
                                            label="الفصل (اختياري)"
                                            {...field}
                                            value={field.value || ''} // Handle null value
                                         >
                                             <MenuItem value=""><em>بدون فصل</em></MenuItem>
                                             {loadingClassrooms && <MenuItem disabled><em>جار تحميل الفصول...</em></MenuItem>}
                                             {classrooms.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                         </Select>
                                         {errors.classroom_id && <FormHelperText>{errors.classroom_id.message}</FormHelperText>}
                                     </FormControl>
                                )} />
                         </Grid>
                         <Grid item xs={12}>
                             <Controller
                                name="status"
                                control={control}
                                rules={{ required: 'الحالة مطلوبة' }}
                                render={({ field }) => (
                                     <FormControl fullWidth error={!!errors.status}>
                                         <InputLabel id="upd-status-label">الحالة *</InputLabel>
                                         <Select labelId="upd-status-label" label="الحالة *" {...field} >
                                            {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                         </Select>
                                         {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                                     </FormControl>
                                )} />
                         </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={isSubmitting}>إلغاء</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || loadingClassrooms}>
                        {isSubmitting ? <CircularProgress size={22} /> : 'حفظ التعديلات'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UpdateEnrollmentDialog;