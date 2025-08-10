// src/components/finances/StudentFeePaymentFormDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,FormHelperText,
    CircularProgress, Alert, InputAdornment, Typography, // Added Typography
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar'; // Ensure Arabic locale is imported for date picker
import dayjs from 'dayjs';
import { StudentFeePayment, StudentFeePaymentFormData ,paymentMethod} from '@/types/studentFeePayment'; // Adjust path
import { FeeInstallment } from '@/types/feeInstallment'; // Import for context display
import { useStudentFeePaymentStore } from '@/stores/studentFeePaymentStore'; // Adjust path
import { useSnackbar } from 'notistack';

interface StudentFeePaymentFormDialogProps {
    open: boolean;
    onClose: (refetchList?: boolean) => void; // Callback accepts optional boolean
    feeInstallmentId: number;              // ID of the parent installment
    installmentDetails?: Pick<FeeInstallment, 'amount_due' | 'amount_paid'>; // Pass current due/paid for validation
    initialData?: StudentFeePayment | null;   // For editing a payment
}
//define options for the dropdown menu
const paymentMethodOptions : {
    value: paymentMethod; // Use the type defined in studentFeePayment.ts
    label: string;
}[] = [
    { value: 'cash', label: 'نقدي' },
    { value: 'bank', label: 'تحويل بنكي' },
    
];


// Exclude fee_installment_id from the form data type itself
type DialogFormData = Omit<StudentFeePaymentFormData, 'fee_installment_id'>;

const StudentFeePaymentFormDialog: React.FC<StudentFeePaymentFormDialogProps> = ({
    open, onClose, feeInstallmentId, installmentDetails, initialData
}) => {
    const isEditMode = !!initialData;
    const { createPayment, updatePayment } = useStudentFeePaymentStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<DialogFormData>({
        defaultValues: {
            amount: '', // Use string for controlled number input
            payment_date: dayjs().format('YYYY-MM-DD'),
            payment_method: 'cash', // Default to cash
            notes: '',
        }
    });

    // Calculate remaining amount for validation
    const amountDue = parseFloat(installmentDetails?.amount_due as string || 'Infinity');
    const amountPaid = parseFloat(installmentDetails?.amount_paid as string || '0');
    // Adjust remaining amount calculation based on edit mode
    const currentPaymentAmount = isEditMode ? parseFloat(initialData?.amount as string || '0') : 0;
    const maxAllowedPayment = isEditMode ? (amountDue - amountPaid + currentPaymentAmount) : (amountDue - amountPaid);


    // Reset form when opening or data changes
    useEffect(() => {
        if (open) {
            setFormError(null);
            reset({
                amount: '', payment_date: dayjs().format('YYYY-MM-DD'), notes: '', // Create defaults
                ...(initialData ? { // Edit defaults
                     amount: String(initialData.amount ?? ''), // Use string for input value
                     payment_date: dayjs(initialData.payment_date).format('YYYY-MM-DD'),
                     notes: initialData.notes || '',
                     payment_method: initialData.payment_method,
                 } : {}),
            });
        }
    }, [initialData, open, reset]);

    const onSubmit = async (data: DialogFormData) => {
        setFormError(null);
        const paymentAmount = Number(data.amount);

        // Additional client-side check (backend also validates)
         if (paymentAmount > maxAllowedPayment) {
             setFormError(`المبلغ يتجاوز المتبقي للقسط (${maxAllowedPayment.toFixed(2)}).`);
             return;
         }

        // Add fee_installment_id to the payload for create/update
        const submitData = {
            ...data,
            amount: paymentAmount, // Send as number
            fee_installment_id: feeInstallmentId,
            payment_method: data.payment_method, // Include payment method
        };

        try {
            if (isEditMode && initialData) {
                 // Only send fields allowed for update by API
                 const updatePayload = {
                     amount: submitData.amount,
                     payment_date: submitData.payment_date,
                     notes: submitData.notes,
                     payment_method:submitData.payment_method, // Include payment method
                 };
                await updatePayment(initialData.id, updatePayload);
                enqueueSnackbar('تم تحديث الدفعة بنجاح', { variant: 'success' });
            } else {
                // Send full data for create
                await createPayment(submitData as StudentFeePaymentFormData); // Cast as full type for create
                enqueueSnackbar('تم إضافة الدفعة بنجاح', { variant: 'success' });
            }
            onClose(true); // <-- Signal parent to refetch installment list
        } catch (error: any) {
             console.error("Payment Form submission error:", error);
             const backendErrors = error.response?.data?.errors;
             if (backendErrors) {
                 setFormError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(error.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

    return (
        // Using 'xs' maxWidth, suitable for simpler forms
        <Dialog open={open} onClose={() => onClose(false)} maxWidth="xs" fullWidth dir="rtl">
            <DialogTitle>{isEditMode ? 'تعديل سجل دفعة' : 'إضافة دفعة جديدة'}</DialogTitle>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                         {/* Display installment ID for context */}
                         <Typography variant="caption" color="text.secondary" gutterBottom>
                             (للقسط رقم: {feeInstallmentId})
                         </Typography>

                         {/* Display remaining amount */}
                         <Typography variant="body2" color="text.primary" gutterBottom sx={{mb: 1}}>
                             المبلغ المتبقي من القسط: <strong >{maxAllowedPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> ل.س
                         </Typography>


                        {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}
                        <Grid container spacing={2.5} sx={{ pt: 1 }}>
                            {/* Amount Field */}
                            <Grid item xs={12}>
                                <Controller
                                    name="amount"
                                    control={control}
                                 
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="المبلغ المدفوع"
                                            type="number"
                                            fullWidth
                                            required
                                            autoFocus // Focus on amount field first
                                          
                                        />
                                    )}
                                />
                            </Grid>
                            {/* Payment Date Field */}
                             <Grid item xs={12}>
                                <Controller
                                    name="payment_date"
                                    control={control}
                                    rules={{ required: 'تاريخ الدفعة مطلوب' }}
                                    render={({ field }) => (
                                        <DatePicker
                                            label="تاريخ الدفعة *"
                                            value={field.value ? dayjs(field.value) : null}
                                            onChange={(newValue) => field.onChange(newValue ? newValue.format('YYYY-MM-DD') : null)}
                                            format="YYYY/MM/DD" // Display format
                                            slotProps={{ textField: {
                                                fullWidth: true,
                                                required: true,
                                                error: !!errors.payment_date,
                                                helperText: errors.payment_date?.message
                                            }}}
                                        />
                                    )}
                                />
                            </Grid>
                              {/* --- Payment Method Field --- */}
                              <Grid item xs={12}>
                                <Controller
                                    name="payment_method"
                                    control={control}
                                    rules={{ required: 'طريقة الدفع مطلوبة' }}
                                    render={({ field }) => (
                                        <FormControl fullWidth required error={!!errors.payment_method}>
                                            <InputLabel id="payment-method-label">طريقة الدفع *</InputLabel>
                                            <Select
                                                labelId="payment-method-label"
                                                label="طريقة الدفع *"
                                                {...field} // Spread field props (value, onChange, etc.)
                                            >
                                                {paymentMethodOptions.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.payment_method && <FormHelperText>{errors.payment_method.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                             </Grid>
                            {/* Notes Field */}
                            <Grid item xs={12}>
                                <Controller
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value ?? ''} // Ensure controlled component
                                            label="ملاحظات (اختياري)"
                                            fullWidth
                                            multiline
                                            rows={3}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        {/* Pass false to onClose for Cancel */}
                        <Button onClick={() => onClose(false)} color="inherit" disabled={isSubmitting}>إلغاء</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={22} /> : (isEditMode ? 'حفظ التعديلات' : 'إضافة دفعة')}
                        </Button>
                    </DialogActions>
                </form>
            </LocalizationProvider>
        </Dialog>
    );
};

export default StudentFeePaymentFormDialog;