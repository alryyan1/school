// src/components/transport/TransportRouteFormDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
    CircularProgress, Alert, FormControlLabel, Switch, Autocomplete, Box // Added Autocomplete, Box
} from '@mui/material';
import { TransportRoute, TransportRouteFormData } from '@/types/transportRoute'; // Adjust path
import { useTransportRouteStore } from '@/stores/transportRouteStore';       // Adjust path
import { useUserStore } from '@/stores/userStore';             // Adjust path (assuming User store exists)
import { User } from '@/types/user';                           // Adjust path
import { useSnackbar } from 'notistack';

interface TransportRouteFormDialogProps {
    open: boolean;
    onClose: (refetch?: boolean) => void;
    initialData?: TransportRoute | null;
    schoolId: number | ''; // Required school context
}

const TransportRouteFormDialog: React.FC<TransportRouteFormDialogProps> = ({
    open, onClose, initialData, schoolId
}) => {
    const isEditMode = !!initialData;
    const { createRoute, updateRoute } = useTransportRouteStore();
    const { users: allUsers, fetchUsers: fetchAllUsers } = useUserStore(); // Get users for driver dropdown
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TransportRouteFormData>({
        defaultValues: {
            school_id: schoolId || 0, name: '', description: '', driver_id: null, fee_amount: '', is_active: true
        }
    });

    // --- Effects ---
    // Fetch users (drivers) when dialog opens
    useEffect(() => {
        if (open) {
            // Ideally, fetch only users with 'driver' role if possible via API filter
            fetchAllUsers(1, { role: 'driver', /* Add other filters if needed */ }); // Fetch first page of drivers
        }
    }, [open, fetchAllUsers]);


    // Reset form
    useEffect(() => {
        if (open && schoolId) { // Ensure schoolId is present
            setFormError(null);
            reset({
                school_id: schoolId, name: '', description: '', driver_id: null, fee_amount: '', is_active: true, // Create defaults
                ...(initialData ? { // Edit defaults
                    ...initialData,
                    fee_amount: initialData.fee_amount ?? '', // Handle null fee
                    description: initialData.description ?? '',
                    driver_id: initialData.driver_id || null, // Ensure null if needed
                 } : {}),
            });
        }
    }, [initialData, open, reset, schoolId]);


    // --- Submission ---
    const onSubmit = async (data: TransportRouteFormData) => {
        if (!schoolId) {
            setFormError("معرف المدرسة غير متوفر.");
            return;
        }
        setFormError(null);
        const submitData = {
            ...data,
            school_id: Number(schoolId),
            driver_id: data.driver_id ? Number(data.driver_id) : null,
            fee_amount: data.fee_amount ? parseFloat(data.fee_amount as string) : null, // Convert to number or null
        };

        try {
            if (isEditMode && initialData) {
                await updateRoute(initialData.id, submitData);
                enqueueSnackbar('تم تحديث المسار بنجاح', { variant: 'success' });
            } else {
                await createRoute(submitData);
                enqueueSnackbar('تم إضافة المسار بنجاح', { variant: 'success' });
            }
            onClose(true); // Close and trigger refetch
        } catch (error: any) {
             console.error("Route Form submission error:", error);
             const backendErrors = error.response?.data?.errors;
             if (backendErrors) {
                 setFormError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(error.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

    // Filter users to show only potential drivers (adjust role check as needed)
    const driverOptions = React.useMemo(() => allUsers.filter(u => u.role === 'driver' || u.role === 'admin'), [allUsers]); // Example: allow admin or driver

    // --- Render ---
    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth dir="rtl">
            <DialogTitle>{isEditMode ? `تعديل المسار: ${initialData?.name}` : 'إضافة مسار نقل جديد'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={()=>setFormError(null)}>{formError}</Alert>}
                    <Grid container spacing={2.5} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <Controller name="name" control={control} rules={{ required: 'اسم المسار مطلوب' }}
                                render={({ field }) => (
                                    <TextField {...field} label="اسم المسار (مثال: مسار الشمال أ)" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                                )} />
                        </Grid>
                        <Grid item xs={12}>
                             <Controller name="driver_id" control={control}
                                 render={({ field }) => (
                                     <Autocomplete
                                         options={driverOptions}
                                         getOptionLabel={(option) => `${option.name} (${option.username})`}
                                         value={driverOptions.find(d => d.id === field.value) || null}
                                         onChange={(event, newValue) => field.onChange(newValue ? newValue.id : null)}
                                         renderInput={(params) => <TextField {...params} label="السائق المسؤول (اختياري)" error={!!errors.driver_id} helperText={errors.driver_id?.message} />}
                                         isOptionEqualToValue={(option, value) => option.id === value.id}
                                         noOptionsText="لا يوجد سائقون متاحون"
                                     />
                                 )} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                             <Controller name="fee_amount" control={control} rules={{ min: {value: 0, message:'المبلغ لا يمكن أن يكون سالباً'} }}
                                render={({ field }) => (
                                    <TextField {...field} value={field.value ?? ''} label="رسوم النقل (اختياري)" type="number" fullWidth error={!!errors.fee_amount} helperText={errors.fee_amount?.message} InputProps={{ inputProps: { step: "any", min: "0" } }} />
                                )} />
                        </Grid>
                         <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                             <FormControlLabel
                                 control={
                                     <Controller name="is_active" control={control}
                                         render={({ field }) => <Switch {...field} checked={field.value} />}
                                     />
                                 }
                                 label="المسار نشط"
                             />
                         </Grid>
                         <Grid item xs={12}>
                             <Controller name="description" control={control}
                                render={({ field }) => (
                                    <TextField {...field} value={field.value ?? ''} label="الوصف (اختياري)" fullWidth multiline rows={3} />
                                )} />
                         </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => onClose()} color="inherit" disabled={isSubmitting}>إلغاء</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={22} /> : (isEditMode ? 'حفظ التعديلات' : 'إضافة مسار')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TransportRouteFormDialog;