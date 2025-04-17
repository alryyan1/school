// src/components/settings/ClassroomFormDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
    CircularProgress, Alert, Autocomplete, Box, // Removed FormControl, InputLabel, Select, MenuItem, FormHelperText
    Typography
} from '@mui/material';
import { Classroom, ClassroomFormData } from '@/types/classroom';         // Adjust path
import { useClassroomStore } from '@/stores/classroomStore';           // Adjust path
import { useTeacherStore } from '@/stores/teacherStore';             // Adjust path
import { User } from '@/types/user';                               // Adjust path
import { useSnackbar } from 'notistack';
import { useUserStore } from '@/stores/userStore';

interface ClassroomFormDialogProps {
    open: boolean;
    onClose: (refetch?: boolean) => void;
    initialData?: Classroom | null;
    // Context passed from parent for Create mode
    schoolId: number | null;
    gradeLevelId: number | null;
}

// Type for the form data handled by react-hook-form
// Excludes school_id and grade_level_id as they are not form fields anymore
type DialogFormData = Omit<ClassroomFormData, 'school_id' | 'grade_level_id'>;

const ClassroomFormDialog: React.FC<ClassroomFormDialogProps> = ({
    open, onClose, initialData, schoolId, gradeLevelId
}) => {
    const isEditMode = !!initialData;
    const { createClassroom, updateClassroom } = useClassroomStore();
    const { users: allUsers, fetchUsers: fetchAllUsers } = useUserStore(); // Assuming useUserStore exists
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DialogFormData>({
        // Default values set in useEffect
        defaultValues: {
             name: '', teacher_id: null, capacity: 30,
        }
    });

    // Fetch teachers when dialog opens
    useEffect(() => {
        if (open) {
            // Fetch only relevant users (e.g., teachers or admins) if possible
            fetchAllUsers(1, { role: 'teacher', /* maybe filter by schoolId if applicable */ });
        }
    }, [open, fetchAllUsers]);

    // Reset form effect
    useEffect(() => {
        if (open) {
            setFormError(null);
            if (isEditMode && initialData) {
                // Set defaults from existing classroom data for Edit mode
                reset({
                    name: initialData.name || '',
                    teacher_id: initialData.teacher_id || null,
                    capacity: initialData.capacity || 30,
                    // school_id and grade_level_id are part of initialData, not separate form fields
                });
            } else {
                // Set defaults for Create mode (school/grade come from props)
                reset({
                    name: '',
                    teacher_id: null,
                    capacity: 30,
                });
            }
        }
    }, [initialData, open, reset, isEditMode]);

    // Form Submit Handler
    const onSubmit = async (data: DialogFormData) => {
        setFormError(null);
        // Construct the full payload including IDs from context/initialData
        let submitData: ClassroomFormData;

        if (isEditMode && initialData) {
            // For update, use existing school/grade IDs, merge form data
            submitData = {
                 ...initialData, // Include original IDs
                 ...data,        // Include form data (name, capacity, teacher_id)
                 teacher_id: data.teacher_id ? Number(data.teacher_id) : null,
                 capacity: Number(data.capacity),
            };
        } else if (!isEditMode && schoolId && gradeLevelId) {
            // For create, use IDs from props, merge form data
             submitData = {
                 ...data,
                 school_id: schoolId,
                 grade_level_id: gradeLevelId,
                 teacher_id: data.teacher_id ? Number(data.teacher_id) : null,
                 capacity: Number(data.capacity),
            };
        } else {
             setFormError("بيانات المدرسة أو المرحلة الدراسية غير متوفرة."); // Should not happen if button logic is correct
             return;
        }


        try {
            let result: Classroom | null = null;
            if (isEditMode && initialData) {
                // Update doesn't need school/grade IDs in payload if API uses route model binding
                 const { school_id, grade_level_id, ...updatePayload } = submitData;
                result = await updateClassroom(initialData.id, updatePayload);
                enqueueSnackbar('تم تحديث الفصل بنجاح', { variant: 'success' });
            } else {
                result = await createClassroom(submitData);
                enqueueSnackbar('تم إضافة الفصل بنجاح', { variant: 'success' });
            }
            if (result) {
                onClose(true); // Close and refetch list
            }
        } catch (error: any) {
             console.error("Classroom Form submission error:", error);
             const backendErrors = error.response?.data?.errors;
             if (backendErrors) {
                 setFormError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(error.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

    // --- Filter relevant teachers (e.g., belonging to the specific school if applicable) ---
    // This depends on whether your Teacher model/data includes school association.
    // For now, we use all fetched users (assuming they are potential teachers).
    const teacherOptions = React.useMemo(() => allUsers.filter(u => u.role === 'teacher' || u.role === 'admin'), [allUsers]);


    // --- Render ---
    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="xs" fullWidth dir="rtl"> {/* Maybe 'sm' width */}
            <DialogTitle>{isEditMode ? 'تعديل الفصل الدراسي' : 'إضافة فصل دراسي جديد'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {/* Display School/Grade Context (Optional but helpful) */}
                    {isEditMode && initialData && (
                         <Typography variant="body2" color="text.secondary" gutterBottom>
                              المدرسة: {initialData.school?.name ?? schoolId ?? '-'} /
                              المرحلة: {initialData.grade_level?.name ?? gradeLevelId ?? '-'}
                         </Typography>
                    )}
                     {!isEditMode && (
                         <Typography variant="body2" color="text.secondary" gutterBottom>
                              (للمدرسة والمرحلة المحددتين في الصفحة السابقة)
                         </Typography>
                    )}

                    {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={()=>setFormError(null)}>{formError}</Alert>}
                    <Grid container spacing={2.5} sx={{ pt: 1 }}>

                        {/* Name and Capacity */}
                        <Grid item xs={12} sm={8}>
                            <Controller name="name" control={control} rules={{ required: 'اسم الفصل مطلوب' }}
                                render={({ field }) => (
                                    <TextField {...field} label="اسم الفصل (مثال: شعبه أ)" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                                )} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Controller name="capacity" control={control} rules={{ required: 'السعة مطلوبة', min: {value: 1, message: 'السعة يجب أن تكون 1 على الأقل'} }}
                                render={({ field }) => (
                                    <TextField {...field} label="السعة" type="number" fullWidth required error={!!errors.capacity} helperText={errors.capacity?.message} InputProps={{ inputProps: { min: 1 } }}/>
                                )} />
                        </Grid>

                         {/* Homeroom Teacher */}
                        <Grid item xs={12}>
                            <Controller name="teacher_id" control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        options={teacherOptions}
                                        getOptionLabel={(option) => `${option.name} (${option.username})`}
                                        value={teacherOptions.find(t => t.id === field.value) || null}
                                        onChange={(event, newValue) => field.onChange(newValue ? newValue.id : null)}
                                        renderInput={(params) => <TextField {...params} label="مدرس الفصل (اختياري)" helperText="المدرس المسؤول عن الفصل" error={!!errors.teacher_id} />}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        noOptionsText="لا يوجد مدرسون متاحون"
                                        clearOnBlur handleHomeEndKeys
                                    />
                                )} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => onClose()} color="inherit" disabled={isSubmitting}>إلغاء</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={22} /> : (isEditMode ? 'حفظ التعديلات' : 'إضافة فصل')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ClassroomFormDialog;