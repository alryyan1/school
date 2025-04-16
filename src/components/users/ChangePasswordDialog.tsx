// src/components/users/ChangePasswordDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
    CircularProgress, Alert, IconButton, InputAdornment, Typography
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { User, UserPasswordFormData } from '@/types/user'; // Adjust path
import { UserApi } from '@/api/userApi'; // Adjust path
import { useSnackbar } from 'notistack';

interface ChangePasswordDialogProps {
    open: boolean;
    onClose: () => void;
    user: User | null; // User whose password needs changing
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ open, onClose, user }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Local saving state

    const { control, handleSubmit, reset, formState: { errors } } = useForm<UserPasswordFormData>({
        defaultValues: { password: '', password_confirmation: '' }
    });

    // Reset form when dialog opens/closes or user changes
    useEffect(() => {
        if (open) {
            setFormError(null);
            reset({ password: '', password_confirmation: '' });
        }
    }, [open, reset]);

    const onSubmit = async (data: UserPasswordFormData) => {
        if (!user) return;
        setFormError(null);
        setIsSaving(true);

        try {
            // Call the specific API endpoint
            await UserApi.updatePassword(user.id, data);
            enqueueSnackbar('تم تغيير كلمة المرور بنجاح', { variant: 'success' });
            onClose(); // Close dialog on success
        } catch (error: any) {
             console.error("Change Password error:", error);
             const backendErrors = error.response?.data?.errors;
             if (backendErrors) {
                 // Often password validation errors are in the 'password' key
                 const pwdErrors = backendErrors.password ? backendErrors.password.join('. ') : '';
                 setFormError(`فشل تغيير كلمة المرور: ${pwdErrors || Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(error.message || 'حدث خطأ غير متوقع.');
             }
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null; // Don't render if no user provided

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>تغيير كلمة المرور للمستخدم: {user.name}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}
                    <Grid container spacing={2.5} sx={{ pt: 1 }}>
                         <Grid item xs={12}>
                             <Controller name="password" control={control} rules={{ required: 'كلمة المرور الجديدة مطلوبة', minLength: {value: 8, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'} }} render={({ field }) => (
                                 <TextField {...field} label="كلمة المرور الجديدة" type={showPassword ? 'text' : 'password'} fullWidth required error={!!errors.password} helperText={errors.password?.message}
                                     InputProps={{ endAdornment: ( <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>)}}
                                  />
                              )} />
                         </Grid>
                         <Grid item xs={12}>
                              <Controller name="password_confirmation" control={control} rules={{ required: 'تأكيد كلمة المرور مطلوب', validate: value => value === control._getWatch('password') || 'كلمتا المرور غير متطابقتين' }} render={({ field }) => (
                                  <TextField {...field} label="تأكيد كلمة المرور الجديدة" type="password" fullWidth required error={!!errors.password_confirmation} helperText={errors.password_confirmation?.message} />
                              )} />
                         </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={isSaving}>إلغاء</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isSaving}>
                        {isSaving ? <CircularProgress size={22} /> : 'تغيير كلمة المرور'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ChangePasswordDialog;