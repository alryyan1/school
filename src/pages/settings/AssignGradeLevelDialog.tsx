// src/components/settings/AssignGradeLevelDialog.tsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
    CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import { GradeLevel } from '@/types/gradeLevel'; // Adjust path
import { SchoolApi } from '@/api/schoolApi';       // Adjust path
import { useSnackbar } from 'notistack';

interface AssignGradeLevelDialogProps {
    open: boolean;
    onClose: (refetch?: boolean) => void;
    schoolId: number;
    availableGrades: GradeLevel[]; // Grades NOT currently assigned to this school
}

// Form data structure for this dialog
type AssignFormData = {
    grade_level_id: number | '';
    basic_fees: string; // Use string for input, convert later
};

const AssignGradeLevelDialog: React.FC<AssignGradeLevelDialogProps> = ({
    open, onClose, schoolId, availableGrades
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AssignFormData>({
        defaultValues: { grade_level_id: '', basic_fees: '0' }
    });

    // Reset form when dialog opens
    React.useEffect(() => {
        if (open) {
            setFormError(null);
            reset({ grade_level_id:'',basic_fees:'0'});
        }
    }, [open, reset]);

    const onSubmit = async (data: AssignFormData) => {
        setFormError(null);
     

        try {
            await SchoolApi.attachGradeLevels(schoolId,data.grade_level_id as number,Number(data.basic_fees));
            enqueueSnackbar('تم تعيين المرحلة بنجاح', { variant: 'success' });
            onClose(true); // Close and refetch
        } catch (error) {
            console.error("Assign GradeLevel Error:", error);
            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                 // Backend might send errors specific to assignments.*.grade_level_id
                 const assignErrors = backendErrors.assignments ? Object.values(backendErrors.assignments[0]).flat().join('. ') : '';
                 setFormError(`فشل الحفظ: ${assignErrors || Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(error.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="xs" fullWidth dir="rtl">
            <DialogTitle>تعيين مرحلة دراسية للمدرسة</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                             <Controller name="grade_level_id" control={control} rules={{ required: 'المرحلة مطلوبة' }}
                                 render={({ field }) => (
                                     <FormControl fullWidth required error={!!errors.grade_level_id}>
                                         <InputLabel id="assign-grade-label">المرحلة الدراسية *</InputLabel>
                                         <Select labelId="assign-grade-label" label="المرحلة الدراسية *" {...field} value={field.value || ''}>
                                             <MenuItem value="" disabled><em>اختر مرحلة...</em></MenuItem>
                                              {availableGrades.length === 0 && <MenuItem disabled><em>(لا مراحل أخرى متاحة)</em></MenuItem>}
                                             {availableGrades.map(g => <MenuItem key={g.id} value={g.id}>{g.name} ({g.code})</MenuItem>)}
                                         </Select>
                                         {errors.grade_level_id && <FormHelperText>{errors.grade_level_id.message}</FormHelperText>}
                                     </FormControl>
                                 )} />
                        </Grid>
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
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || availableGrades.length === 0}>
                        {isSubmitting ? <CircularProgress size={22} /> : 'تعيين وحفظ'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AssignGradeLevelDialog;