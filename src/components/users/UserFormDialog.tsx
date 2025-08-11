// src/components/users/UserFormDialog.tsx
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Skeleton } from '@/components/ui/skeleton';
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

import { User, UserFormData, UserRole, UserGender } from "@/types/user";
import { useRoleStore } from '@/stores/roleStore';
import { useUserStore } from "@/stores/userStore";
import { useSnackbar } from "notistack";

interface UserFormDialogProps {
    open: boolean;
    onClose: (refetch?: boolean) => void;
    initialData?: User | null;
}

const translateRole = (name: string) => {
  const map: Record<string, string> = {
    'admin': 'مسؤول',
    'teacher': 'معلم',
    'student': 'طالب',
    'parent': 'ولي أمر',
    'super-manager': 'مدير النظام',
    'general-manager': 'المدير العام',
    'accountant': 'محاسب',
    'school-principal': 'مدير مدرسة',
    'nurse': 'ممرضة',
    'transport-manager': 'مسؤول الترحيل',
  };
  return map[name] || name;
};
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
    const { spatieRoles, fetchSpatieRoles } = useRoleStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UserFormData>({
        mode: 'onBlur',
    });

    // Fetch roles and reset form when opening or data changes
    useEffect(() => {
        if (open) {
            if (spatieRoles.length === 0) fetchSpatieRoles();
            setFormError(null);
            const defaults: Partial<UserFormData> = {
                name: "",
                username: "",
                email: "",
                role: (initialData?.role as UserRole) || (spatieRoles[0]?.name as UserRole) || "student",
                phone: null,
                gender: null,
                password: "",
                password_confirmation: "",
            };
            if (isEditMode && initialData) {
                reset({
                    ...defaults,
                    ...initialData,
                    password: "",
                    password_confirmation: "",
                });
            } else {
                reset(defaults);
            }
        }
    }, [initialData, isEditMode, open, reset, spatieRoles, fetchSpatieRoles]);

    const onSubmit = async (data: UserFormData) => {
        setFormError(null);
        try {
            // Normalize payload
            const normalized: UserFormData = {
              ...data,
              name: String(data.name || '').trim(),
              username: String(data.username || '').trim(),
              email: String(data.email || '').trim(),
              phone: data.phone && String(data.phone).trim() !== '' ? String(data.phone).trim() : null,
              gender: (data.gender as unknown as string) === '' ? null : data.gender,
            };
            if (isEditMode && initialData) {
                // Omit password fields in update to avoid sending empty values
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password: _omitPw, password_confirmation: _omitPwC, ...updateData } = normalized;
                await updateUser(initialData.id, updateData);
                enqueueSnackbar("تم تحديث المستخدم بنجاح", { variant: "success" });
            } else {
                await createUser(normalized);
                enqueueSnackbar("تم إضافة المستخدم بنجاح", { variant: "success" });
            }
            onClose(true);
        } catch (error: unknown) {
            console.error("User Form submission error:", error);
            const backendErrors = (error as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors;
            if (backendErrors) {
                setFormError(
                    `فشل الحفظ: ${Object.values(backendErrors).flat().join(". ")}`
                );
            } else {
                setFormError((error as Error)?.message || "حدث خطأ غير متوقع.");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => onClose()} modal>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode
                            ? `تعديل المستخدم: ${initialData?.name}`
                            : "إضافة مستخدم جديد"}
                    </DialogTitle>
                    <DialogDescription>
                        أدخل تفاصيل المستخدم الجديد.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {formError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name_user_form">الاسم الكامل *</Label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: "الاسم مطلوب", minLength: { value: 2, message: 'الاسم قصير جداً' } }}
                                render={({ field }) => (
                                    <Input
                                        id="name_user_form"
                                        placeholder="أدخل الاسم الكامل"
                                        {...field}
                                        className={cn(errors.name && "border-destructive")}
                                        aria-invalid={!!errors.name}
                                    />
                                )}
                            />
                            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                        </div>

                        {/* Username and Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="username_user_form">اسم المستخدم *</Label>
                                <Controller
                                    name="username"
                                    control={control}
                                    rules={{ required: "اسم المستخدم مطلوب", pattern: { value: /^[a-zA-Z0-9._-]{3,}$/, message: 'اسم المستخدم غير صالح' } }}
                                    render={({ field }) => (
                                        <Input
                                            id="username_user_form"
                                            placeholder="اسم المستخدم للدخول"
                                            {...field}
                                            className={cn(errors.username && "border-destructive")}
                                            aria-invalid={!!errors.username}
                                        />
                                    )}
                                />
                                {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email_user_form">البريد الإلكتروني *</Label>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{ required: "البريد الإلكتروني مطلوب", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'البريد الإلكتروني غير صالح' } }}
                                    render={({ field }) => (
                                        <Input
                                            id="email_user_form"
                                            type="email"
                                            placeholder="example@email.com"
                                            {...field}
                                            className={cn(errors.email && "border-destructive")}
                                            aria-invalid={!!errors.email}
                                        />
                                    )}
                                />
                                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                            </div>
                        </div>

                        {/* Role and Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="role_user_form">الدور *</Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    rules={{ required: "الدور مطلوب" }}
                                    render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange} required>
                                            <SelectTrigger id="role_user_form" className={cn(errors.role && "border-destructive")}>
                                                <SelectValue placeholder="اختر الدور" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {spatieRoles.map((r) => (
                                                  <SelectItem key={r.id} value={r.name as UserRole}>
                                                    {translateRole(r.name)}
                                                  </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.role && <p className="text-xs text-destructive mt-1">{errors.role.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="phone_user_form">رقم الهاتف (اختياري)</Label>
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="phone_user_form"
                                            placeholder="رقم الهاتف"
                                            {...field}
                                            value={field.value || ''}
                                            className={cn(errors.phone && "border-destructive")}
                                            aria-invalid={!!errors.phone}
                                        />
                                    )}
                                />
                                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-1.5">
                            <Label htmlFor="gender_user_form">الجنس (اختياري)</Label>
                                <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || ""}
                                        onValueChange={(val) => field.onChange(val)}
                                    >
                                        <SelectTrigger id="gender_user_form" className={cn(errors.gender && "border-destructive")}>
                                            <SelectValue placeholder="اختر الجنس" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">
                                                <em>غير محدد</em>
                                            </SelectItem>
                                            {genders.map((gender) => (
                                                <SelectItem key={gender.value} value={gender.value}>
                                                    {gender.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender.message}</p>}
                        </div>

                        {/* Password Fields (ONLY for Create Mode) */}
                        {!isEditMode && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="password_user_form">كلمة المرور *</Label>
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
                                            <div className="relative">
                                                <Input
                                                    id="password_user_form"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="كلمة المرور"
                                                    {...field}
                                                    className={cn(errors.password && "border-destructive")}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    />
                                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="password_confirmation_user_form">تأكيد كلمة المرور *</Label>
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
                                            <Input
                                                id="password_confirmation_user_form"
                                                type="password"
                                                placeholder="تأكيد كلمة المرور"
                                                {...field}
                                                className={cn(errors.password_confirmation && "border-destructive")}
                                            />
                                        )}
                                    />
                                    {errors.password_confirmation && <p className="text-xs text-destructive mt-1">{errors.password_confirmation.message}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onClose()}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'حفظ التعديلات' : 'إضافة مستخدم'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UserFormDialog;
