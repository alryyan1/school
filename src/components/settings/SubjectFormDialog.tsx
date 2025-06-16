// src/components/settings/SubjectFormDialog.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Subject, SubjectFormData } from '@/types/subject';
import { useSubjectStore } from '@/stores/subjectStore';
import { useSnackbar } from 'notistack';

interface SubjectFormDialogProps {
    open: boolean;
    onClose: () => void;
    initialData?: Subject | null;
}

const SubjectFormDialog: React.FC<SubjectFormDialogProps> = ({ open, onClose, initialData }) => {
    const isEditMode = !!initialData;
    const { createSubject, updateSubject } = useSubjectStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = React.useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SubjectFormData>({
        defaultValues: { name: '', code: '', description: '' }
    });

    useEffect(() => {
        if (open) {
            setFormError(null);
            reset({
                name: '', code: '', description: '', // Default values for create
                ...(initialData || {}) // Spread initialData if editing
            });
        }
    }, [initialData, open, reset]);

    const onSubmit = async (data: SubjectFormData) => {
        setFormError(null);
        try {
            if (isEditMode && initialData) {
                await updateSubject(initialData.id, data);
                enqueueSnackbar('تم تحديث المادة بنجاح', { variant: 'success' });
            } else {
                await createSubject(data);
                enqueueSnackbar('تم إضافة المادة بنجاح', { variant: 'success' });
            }
            onClose();
        } catch (error: unknown) {
            console.error("Subject Form submission error:", error);
            const backendErrors = (error as any).response?.data?.errors;
            if (backendErrors) {
                const errorMessages = Object.values(backendErrors).flat().join('. ');
                setFormError(`فشل الحفظ: ${errorMessages}`);
            } else {
                setFormError((error as any).message || 'حدث خطأ غير متوقع.');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'تعديل المادة الدراسية' : 'إضافة مادة دراسية جديدة'}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {formError && (
                        <Alert>
                            <AlertDescription>{formError}</AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-7">
                            <Label htmlFor="name">اسم المادة *</Label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'اسم المادة مطلوب' }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="name"
                                        placeholder="مثال: الرياضيات"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                )}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        
                        <div className="sm:col-span-5">
                            <Label htmlFor="code">رمز المادة *</Label>
                            <Controller
                                name="code"
                                control={control}
                                rules={{ required: 'رمز المادة مطلوب' }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="code"
                                        placeholder="مثال: MATH101"
                                        className={errors.code ? 'border-red-500' : ''}
                                    />
                                )}
                            />
                            {errors.code && (
                                <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
                            )}
                        </div>
                        
                        <div className="sm:col-span-12">
                            <Label htmlFor="description">الوصف (اختياري)</Label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        id="description"
                                        placeholder="وصف المادة..."
                                        rows={3}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                            {isEditMode ? 'حفظ التعديلات' : 'إضافة'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SubjectFormDialog;