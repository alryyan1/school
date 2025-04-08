// src/components/settings/ClassroomFormDialog.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, FormHelperText, Autocomplete
} from '@mui/material';
import { Classroom, ClassroomFormData } from '@/types/classroom';
import { useClassroomStore } from '@/stores/classroomStore';
import { useSchoolStore } from '@/stores/schoolStore';
import { useGradeLevelStore } from '@/stores/gradeLevelStore';
import { useTeacherStore } from '@/stores/teacherStore';
import { useSnackbar } from 'notistack';

interface ClassroomFormDialogProps {
    open: boolean;
    onClose: () => void;
    initialData?: Classroom | null;
}

const ClassroomFormDialog: React.FC<ClassroomFormDialogProps> = ({ open, onClose, initialData }) => {
    const isEditMode = !!initialData;
    const { createClassroom, updateClassroom } = useClassroomStore();
    const { schools, fetchSchools } = useSchoolStore();
    const { gradeLevels, fetchGradeLevels } = useGradeLevelStore();
    const { teachers, fetchTeachers: fetchAllTeachers } = useTeacherStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = React.useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClassroomFormData>({
        defaultValues: { name: '', grade_level_id: '', teacher_id: null, capacity: 30, school_id: '' }
    });

    // Fetch dropdown data when dialog opens
    useEffect(() => {
        if (open) {
            if(schools.length === 0) fetchSchools();
            if(gradeLevels.length === 0) fetchGradeLevels();
            if(teachers.length === 0) fetchAllTeachers(); // Fetch all teachers
        }
    }, [open, fetchSchools, fetchGradeLevels, fetchAllTeachers, schools.length, gradeLevels.length, teachers.length]);


    // Reset form effect
    useEffect(() => {
        if (open) {
            setFormError(null);
            reset({
                name: '', grade_level_id: '', teacher_id: null, capacity: 30, school_id: '',
                ...(initialData ? { // Pre-fill IDs for edit
                    ...initialData,
                    teacher_id: initialData.teacher_id || null // Ensure null if not set
                 } : {}),
            });
        }
    }, [initialData, open, reset]);

    const onSubmit = async (data: ClassroomFormData) => {
        setFormError(null);
        // Ensure IDs are numbers
        const submitData = {
            ...data,
            school_id: Number(data.school_id),
            grade_level_id: Number(data.grade_level_id),
            teacher_id: data.teacher_id ? Number(data.teacher_id) : null, // Handle null teacher
            capacity: Number(data.capacity)
        };

        try {
            let result: Classroom | null = null;
            if (isEditMode && initialData) {
                result = await updateClassroom(initialData.id, submitData);
                enqueueSnackbar('تم تحديث الفصل بنجاح', { variant: 'success' });
            } else {
                result = await createClassroom(submitData);
                enqueueSnackbar('تم إضافة الفصل بنجاح', { variant: 'success' });
            }
            if (result) {
                // Optionally refetch list based on result.school_id/grade_level_id in parent?
                onClose();
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditMode ? 'تعديل الفصل الدراسي' : 'إضافة فصل دراسي جديد'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <Grid container spacing={2.5} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <Controller name="school_id" control={control} rules={{ required: 'المدرسة مطلوبة' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.school_id}>
                                        <InputLabel id="school-select-label">المدرسة *</InputLabel>
                                        <Select labelId="school-select-label" label="المدرسة *" {...field} value={field.value || ''} disabled={isEditMode}>
                                            <MenuItem value="" disabled><em>اختر مدرسة...</em></MenuItem>
                                            {schools.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                                        </Select>
                                        {errors.school_id && <FormHelperText>{errors.school_id.message}</FormHelperText>}
                                    </FormControl>
                                )} />
                        </Grid>
                        <Grid item xs={12}>
                             <Controller name="grade_level_id" control={control} rules={{ required: 'المرحلة الدراسية مطلوبة' }}
                                 render={({ field }) => (
                                     <FormControl fullWidth error={!!errors.grade_level_id}>
                                         <InputLabel id="gl-select-label">المرحلة الدراسية (الصف) *</InputLabel>
                                         <Select labelId="gl-select-label" label="المرحلة الدراسية (الصف) *" {...field} value={field.value || ''}>
                                             <MenuItem value="" disabled><em>اختر مرحلة...</em></MenuItem>
                                             {gradeLevels.map(gl => <MenuItem key={gl.id} value={gl.id}>{gl.name} ({gl.code})</MenuItem>)}
                                         </Select>
                                         {errors.grade_level_id && <FormHelperText>{errors.grade_level_id.message}</FormHelperText>}
                                     </FormControl>
                                 )} />
                         </Grid>
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
                         <Grid item xs={12}>
                             <Controller name="teacher_id" control={control}
                                 render={({ field }) => (
                                     <Autocomplete
                                         options={teachers}
                                         getOptionLabel={(option) => option.name}
                                         // Important: find the object based on ID for value prop
                                         value={teachers.find(t => t.id === field.value) || null}
                                         onChange={(event, newValue) => {
                                             field.onChange(newValue ? newValue.id : null); // Update form state with ID or null
                                         }}
                                         renderInput={(params) => <TextField {...params} label="مدرس الفصل (اختياري)" helperText="المدرس المسؤول عن الفصل" />}
                                         isOptionEqualToValue={(option, value) => option.id === value.id}
                                         noOptionsText="لا يوجد مدرسون"
                                         // Allow clearing the selection
                                         clearOnBlur
                                         handleHomeEndKeys
                                     />
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
        </Dialog>
    );
};

export default ClassroomFormDialog;