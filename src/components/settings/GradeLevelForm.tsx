// src/components/settings/GradeLevelForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from 'lucide-react';

import { GradeLevel, GradeLevelFormData } from '@/types/gradeLevel'; // Adjust path
import { useGradeLevelStore } from '@/stores/gradeLevelStore';   // Adjust path
import { useSnackbar } from 'notistack';

interface GradeLevelFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void; // For shadcn Dialog control
    onSuccess: () => void; // Callback to refetch list
    initialData?: GradeLevel | null;
}

const GradeLevelForm: React.FC<GradeLevelFormProps> = ({
    open, onOpenChange, onSuccess, initialData
}) => {
    const isEditMode = !!initialData;
    const { createGradeLevel, updateGradeLevel } = useGradeLevelStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GradeLevelFormData>({
        defaultValues: { name: '', code: '', description: '' }
    });

    // Reset form when opening or initialData changes
    useEffect(() => {
        if (open) {
            setFormSubmitError(null);
            reset({
                name: '', code: '', description: '', // Create defaults
                ...(initialData ? { // Edit defaults
                    name: initialData.name || '',
                    code: initialData.code || '',
                    description: initialData.description || '',
                } : {}),
            });
        }
    }, [initialData, open, reset]);

    const onSubmit = async (data: GradeLevelFormData) => {
        setFormSubmitError(null);
        try {
            if (isEditMode && initialData) {
                await updateGradeLevel(initialData.id, data);
                enqueueSnackbar('تم تحديث المرحلة الدراسية بنجاح', { variant: 'success' });
            } else {
                await createGradeLevel(data);
                enqueueSnackbar('تم إضافة المرحلة الدراسية بنجاح', { variant: 'success' });
            }
            onSuccess(); // Close dialog and trigger refetch
        } catch (error: any) {
            console.error("GradeLevel Form submission error:", error);
            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                setFormSubmitError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
            } else {
                setFormSubmitError(error.message || 'حدث خطأ غير متوقع.');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? `تعديل المرحلة: ${initialData?.name}` : 'إضافة مرحلة دراسية جديدة'}</DialogTitle>
                    <DialogDescription>أدخل تفاصيل المرحلة الدراسية (الصف).</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {formSubmitError && (
                            <Alert variant="destructive" className="mb-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{formSubmitError}</AlertDescription>
                            </Alert>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                            <div className="sm:col-span-7 space-y-1.5">
                                <Label htmlFor="name_gl_form">اسم المرحلة *</Label>
                                <Controller name="name" control={control} rules={{ required: 'اسم المرحلة مطلوب' }}
                                    render={({ field }) => <Input id="name_gl_form" placeholder="مثال: الصف العاشر" {...field} className={cn(errors.name && "border-destructive")} />} />
                                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                            </div>
                            <div className="sm:col-span-5 space-y-1.5">
                                <Label htmlFor="code_gl_form">الرمز *</Label>
                                <Controller name="code" control={control} rules={{ required: 'رمز المرحلة مطلوب' }}
                                    render={({ field }) => <Input id="code_gl_form" placeholder="مثال: G10" {...field} className={cn(errors.code && "border-destructive")} />} />
                                {errors.code && <p className="text-xs text-destructive mt-1">{errors.code.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="description_gl_form">الوصف (اختياري)</Label>
                            <Controller name="description" control={control}
                                render={({ field }) => <Textarea id="description_gl_form" placeholder="أي تفاصيل إضافية عن المرحلة..." {...field} value={field.value ?? ''} className="min-h-[80px]" />} />
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>إلغاء</Button></DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'حفظ التعديلات' : 'إضافة مرحلة'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default GradeLevelForm;