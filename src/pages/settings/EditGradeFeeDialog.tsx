// src/components/settings/EditGradeFeeDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from 'lucide-react';

import { GradeLevel, UpdateGradeFeeFormData } from '@/types/gradeLevel'; // Adjust path
import { SchoolApi } from '@/api/schoolApi';       // Adjust path
import { useSnackbar } from 'notistack';

interface EditGradeFeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void; // For shadcn Dialog control
    onSuccess: () => void; // Callback to refetch list on success
    schoolId: number | null;
    gradeLevel: GradeLevel | null; // Contains current pivot data in assignment_details
}

const EditGradeFeeDialog: React.FC<EditGradeFeeDialogProps> = ({
    open, onOpenChange, onSuccess, schoolId, gradeLevel
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateGradeFeeFormData>({
        defaultValues: { basic_fees: '0' } // Use string for input
    });

    // Reset form when dialog opens or data changes
    useEffect(() => {
        if (open && gradeLevel) {
            setFormError(null);
            reset({
                basic_fees: String(gradeLevel.assignment_details?.basic_fees ?? '0') // Pre-fill with current fee
            });
        }
    }, [gradeLevel, open, reset]);

    const onSubmit = async (data: UpdateGradeFeeFormData) => {
        if (!schoolId || !gradeLevel) {
            setFormError("بيانات المدرسة أو المرحلة غير متوفرة.");
            return;
        }
        setFormError(null);
        const fees = Number(data.basic_fees) || 0; // Convert to number, default 0

        try {
            await SchoolApi.updateGradeLevelFee(schoolId, gradeLevel.id, fees);
            enqueueSnackbar('تم تحديث الرسوم الأساسية بنجاح', { variant: 'success' });
            onSuccess(); // Close and refetch
        } catch (error: unknown) {
            console.error("Update Grade Fee Error:", error);
            const errorObj = error as { response?: { data?: { errors?: Record<string, string[]> } }; message?: string };
            const backendErrors = errorObj.response?.data?.errors;
             if (backendErrors) {
                 setFormError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(errorObj.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

    if (!gradeLevel) return null; // Don't render if no gradeLevel provided

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-xs" dir="rtl"> {/* Smaller dialog */}
                <DialogHeader>
                    <DialogTitle>تعديل الرسوم الأساسية</DialogTitle>
                    <DialogDescription>
                        للمرحلة: {gradeLevel.name} ({gradeLevel.code})
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {formError && (
                            <Alert variant="destructive" className="mb-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>خطأ</AlertTitle>
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="basic_fees_edit">الرسوم الأساسية *</Label>
                            <Controller
                                name="basic_fees"
                                control={control}
                                rules={{
                                    required: 'الرسوم الأساسية مطلوبة',
                                    min: { value: 0, message: 'الرسوم لا يمكن أن تكون سالبة' }
                                }}
                                render={({ field }) => (
                                    <Input
                                        id="basic_fees_edit"
                                        type="number"
                                        {...field}
                                        value={field.value ?? ""} // Ensure controlled input for numbers
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder="مثال: 5000"
                                        min="0"
                                        step="1" // Or "any" or "0.01" if decimals are needed
                                        className={cn(errors.basic_fees && "border-destructive")}
                                    />
                                )}
                            />
                            {errors.basic_fees && <p className="text-xs text-destructive mt-1">{errors.basic_fees.message}</p>}
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>إلغاء</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            حفظ التعديل
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditGradeFeeDialog;