// src/components/users/UserFormDialog.tsx
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { User, UserFormData, UserRole, UserGender } from "@/types/user"; // Adjust path
import { useUserStore } from "@/stores/userStore"; // Adjust path
import { useSnackbar } from "notistack";

interface UserFormDialogProps {
  open: boolean;
  onClose: (refetch?: boolean) => void; // Allow triggering refetch
  initialData?: User | null; // For editing
}

const roles: UserRole[] = ["admin", "teacher", "student", "parent"];
// Combine possible gender values for dropdown
const genders: { value: UserGender; label: string }[] = [
  { value: "ذكر", label: "ذكر" },
  { value: "انثي", label: "أنثى" },
];

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onClose,
  initialData,
}) => {
  const isEditMode = !!initialData;
  const { createUser, updateUser } = useUserStore();
  const { enqueueSnackbar } = useSnackbar();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    // Default values set in useEffect
  });

  // Reset form when opening or data changes
  useEffect(() => {
    if (open) {
      setFormError(null);
      const defaults: Partial<UserFormData> = {
        name: "",
        username: "",
        email: "",
        role: "student",
        phone: null,
        gender: null,
        password: "",
        password_confirmation: "", // Clear passwords for create
      };
      if (isEditMode && initialData) {
        reset({
          ...defaults,
          ...initialData,
          password: "",
          password_confirmation: "",
        }); // Load data, clear password fields for edit
      } else {
        reset(defaults); // Reset to create defaults
      }
    }
  }, [initialData, isEditMode, open, reset]);

  const onSubmit = async (data: UserFormData) => {
    setFormError(null);
    try {
      if (isEditMode && initialData) {
        // Exclude password fields for update API call
        const { password, password_confirmation, ...updateData } = data;
        await updateUser(initialData.id, updateData);
        enqueueSnackbar("تم تحديث المستخدم بنجاح", { variant: "success" });
      } else {
        // Include password for create API call
        await createUser(data);
        enqueueSnackbar("تم إضافة المستخدم بنجاح", { variant: "success" });
      }
      onClose(true); // Close dialog and trigger refetch on success
    } catch (error: any) {
      console.error("User Form submission error:", error);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setFormError(
          `فشل الحفظ: ${Object.values(backendErrors).flat().join(". ")}`
        );
      } else {
        setFormError(error.message || "حدث خطأ غير متوقع.");
      }
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode
          ? `تعديل المستخدم: ${initialData?.name}`
          : "إضافة مستخدم جديد"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {formError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setFormError(null)}
            >
              {formError}
            </Alert>
          )}
          <Grid container spacing={2.5} sx={{ pt: 1 }}>
            {/* Fields: Name, Username, Email */}
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: "الاسم مطلوب" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="الاسم الكامل"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="username"
                control={control}
                rules={{ required: "اسم المستخدم مطلوب" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="اسم المستخدم (للدخول)"
                    fullWidth
                    required
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{ required: "البريد الإلكتروني مطلوب" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="email"
                    label="البريد الإلكتروني"
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            {/* Fields: Role, Phone, Gender */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="role"
                control={control}
                rules={{ required: "الدور مطلوب" }}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.role}>
                    <InputLabel id="role-label">الدور *</InputLabel>
                    <Select labelId="role-label" label="الدور *" {...field}>
                      {roles.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role && (
                      <FormHelperText>{errors.role.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="رقم الهاتف (اختياري)"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel id="gender-label">الجنس (اختياري)</InputLabel>
                    <Select
                      labelId="gender-label"
                      label="الجنس (اختياري)"
                      {...field}
                      value={field.value ?? ""}
                    >
                      <MenuItem value="">
                        <em>غير محدد</em>
                      </MenuItem>
                      {genders.map((g) => (
                        <MenuItem key={g.value} value={g.value}>
                          {g.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.gender && (
                      <FormHelperText>{errors.gender.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Password Fields (ONLY for Create Mode) */}
            {!isEditMode && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "كلمة المرور مطلوبة",
                      minLength: {
                        value: 8,
                        message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="كلمة المرور"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        required
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="password_confirmation"
                    control={control}
                    rules={{
                      required: "تأكيد كلمة المرور مطلوب",
                      validate: (value) =>
                        value === control._getWatch("password") ||
                        "كلمتا المرور غير متطابقتين",
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="تأكيد كلمة المرور"
                        type="password"
                        fullWidth
                        required
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => onClose()}
            color="inherit"
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={22} />
            ) : isEditMode ? (
              "حفظ التعديلات"
            ) : (
              "إضافة مستخدم"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserFormDialog;
