// src/components/settings/AcademicYearForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"; // shadcn Dialog
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"; // shadcn Select
import { Switch } from "@/components/ui/switch"; // shadcn Switch
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from 'lucide-react'; // Icons
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
dayjs.locale('ar');

import { AcademicYear, AcademicYearFormData } from '@/types/academicYear'; // Adjust path
import { useAcademicYearStore } from '@/stores/academicYearStore';       // Adjust path
import { useSchoolStore } from '@/stores/schoolStore';                 // Adjust path
import { useSettingsStore } from '@/stores/settingsStore';           // For default school if needed
import { useSnackbar } from 'notistack';

interface AcademicYearFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void; // For shadcn Dialog control
    onSuccess: () => void; // Callback to refetch list on success
    initialData?: AcademicYear | null;
}

const AcademicYearForm: React.FC<AcademicYearFormProps> = ({
    open, onOpenChange, onSuccess, initialData
}) => {
    const isEditMode = !!initialData;
    const { createAcademicYear, updateAcademicYear } = useAcademicYearStore();
    const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
    const { activeSchoolId: defaultActiveSchoolIdFromSettings } = useSettingsStore.getState();
    const { enqueueSnackbar } = useSnackbar();
    const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

    const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<AcademicYearFormData>({
        // Default values set in useEffect
    });

    // Fetch schools for dropdown
    useEffect(() => {
        if (open && schools.length === 0) {
            fetchSchools();
        }
    }, [open, schools.length, fetchSchools]);

    // Reset form when opening or initialData changes
    useEffect(() => {
        if (open) {
            setFormSubmitError(null);
            const defaultSchool = initialData?.school_id
                ? String(initialData.school_id)
                : defaultActiveSchoolIdFromSettings ? String(defaultActiveSchoolIdFromSettings) : "";

            reset({
                name: '',
                school_id: defaultSchool ? Number(defaultSchool) : 0, // Convert to number for form data
                start_date: dayjs().startOf('year').format('YYYY-MM-DD'), // e.g., Jan 1st
                end_date: dayjs().endOf('year').format('YYYY-MM-DD'),     // e.g., Dec 31st
                is_current: false,
                enrollment_fee: 0,
                ...(initialData ? {
                    ...initialData,
                    school_id: initialData.school_id, // Keep as number
                    start_date: dayjs(initialData.start_date).format('YYYY-MM-DD'),
                    end_date: dayjs(initialData.end_date).format('YYYY-MM-DD'),
                    enrollment_fee: initialData.enrollment_fee ?? 0,
                } : {}),
            });
        }
    }, [initialData, open, reset, defaultActiveSchoolIdFromSettings]);


    const onSubmit = async (data: AcademicYearFormData) => {
        setFormSubmitError(null);
        const submitData = {
            ...data,
            school_id: Number(data.school_id), // Convert to number for API
            enrollment_fee: Number((data as any).enrollment_fee ?? 0) || 0,
            // is_current is already boolean from Switch
        };

        if (!submitData.school_id) {
            setFormSubmitError("الرجاء اختيار المدرسة.");
            return;
        }

        try {
            if (isEditMode && initialData) {
                await updateAcademicYear(initialData.id, submitData);
                enqueueSnackbar('تم تحديث العام الدراسي بنجاح', { variant: 'success' });
            } else {
                await createAcademicYear(submitData);
                enqueueSnackbar('تم إضافة العام الدراسي بنجاح', { variant: 'success' });
            }
            onSuccess(); // Close dialog and trigger refetch
        } catch (error: unknown) {
            console.error("Academic Year Form submission error:", error);
            const backendErrors = (error as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors;
            if (backendErrors) {
                setFormSubmitError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
            } else {
                setFormSubmitError((error as Error)?.message || 'حدث خطأ غير متوقع.');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? `تعديل العام الدراسي: ${initialData?.name}` : 'إضافة عام دراسي جديد'}</DialogTitle>
                    <DialogDescription>أدخل تفاصيل العام الدراسي.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {formSubmitError && (
                            <Alert variant="destructive" className="mb-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{formSubmitError}</AlertDescription>
                            </Alert>
                        )}
                        {/* School Selection */}
                        <div className="space-y-1.5">
                            <Label htmlFor="school_id_ay_form">المدرسة *</Label>
                            <Controller name="school_id" control={control} rules={{ required: 'المدرسة مطلوبة' }}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? String(field.value) : ""}
                                        onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
                                        disabled={isEditMode || schoolsLoading} // Disable school change in edit mode
                                        required
                                    >
                                        <SelectTrigger id="school_id_ay_form" className={cn(errors.school_id && "border-destructive")}>
                                            <SelectValue placeholder={schoolsLoading ? "جاري تحميل المدارس..." : "اختر مدرسة..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" " disabled><em>اختر مدرسة...</em></SelectItem>
                                            {schools.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                            {errors.school_id && <p className="text-xs text-destructive mt-1">{errors.school_id.message}</p>}
                        </div>

                        {/* Academic Year Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name_ay_form">اسم العام الدراسي *</Label>
                            <Controller name="name" control={control} rules={{ required: 'اسم العام الدراسي مطلوب' }}
                                render={({ field }) => <Input id="name_ay_form" placeholder="مثال: 2024-2025" {...field} className={cn(errors.name && "border-destructive")} />} />
                            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                        </div>

                        {/* Start Date & End Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="start_date_ay_form">تاريخ البداية *</Label>
                                <Controller name="start_date" control={control} rules={{ required: 'تاريخ البداية مطلوب' }}
                                    render={({ field }) => (
                                        <Input 
                                            id="start_date_ay_form" 
                                            type="date" 
                                            {...field} 
                                            className={cn(errors.start_date && "border-destructive")}
                                        />
                                    )} />
                                {errors.start_date && <p className="text-xs text-destructive mt-1">{errors.start_date.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="end_date_ay_form">تاريخ النهاية *</Label>
                                <Controller name="end_date" control={control} rules={{ required: 'تاريخ النهاية مطلوب', validate: value => dayjs(value).isAfter(dayjs(watch('start_date'))) || 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' }}
                                    render={({ field }) => (
                                        <Input 
                                            id="end_date_ay_form" 
                                            type="date" 
                                            {...field} 
                                            className={cn(errors.end_date && "border-destructive")}
                                            min={watch('start_date') ? dayjs(watch('start_date')).add(1, 'day').format('YYYY-MM-DD') : undefined}
                                        />
                                    )} />
                                {errors.end_date && <p className="text-xs text-destructive mt-1">{errors.end_date.message}</p>}
                            </div>
                        </div>

                        {/* Is Current Switch */}
                        <div className="flex items-center space-x-2 space-x-reverse pt-2">
                             <Controller name="is_current" control={control}
                                 render={({ field }) => <Switch id="is_current_ay_form" checked={field.value} onCheckedChange={field.onChange} />} />
                             <Label htmlFor="is_current_ay_form" className="cursor-pointer text-sm font-medium">
                                 تعيين كـ عام دراسي حالي؟
                                 <p className="text-xs text-muted-foreground">(سيتم إلغاء تعيين الأعوام الأخرى لنفس المدرسة)</p>
                             </Label>
                        </div>

                        {/* Enrollment Fee */}
                        <div className="space-y-1.5">
                            <Label htmlFor="enrollment_fee_ay_form">رسوم التسجيل</Label>
                            <Controller
                                name="enrollment_fee"
                                control={control}
                                rules={{ min: { value: 0, message: 'لا يمكن أن تكون الرسوم سالبة' } }}
                                render={({ field }) => (
                                    <Input
                                        id="enrollment_fee_ay_form"
                                        type="number"
                                        {...field}
                                        value={(field.value ?? 0) as number}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder="مثال: 1000"
                                        min={0}
                                        className={cn(errors.enrollment_fee && 'border-destructive')}
                                    />
                                )}
                            />
                            {errors.enrollment_fee && (
                                <p className="text-xs text-destructive mt-1">{(errors as any).enrollment_fee.message}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={isSubmitting || schoolsLoading}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'حفظ التعديلات' : 'إضافة عام دراسي'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AcademicYearForm;