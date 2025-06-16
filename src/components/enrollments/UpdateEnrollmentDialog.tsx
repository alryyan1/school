// src/components/enrollments/UpdateEnrollmentDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from 'lucide-react';

import { StudentAcademicYear, StudentEnrollmentUpdateFormData, EnrollmentStatus } from '@/types/studentAcademicYear'; // Adjust path
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore'; // Adjust path
import { useClassroomStore } from '@/stores/classroomStore'; // Adjust path
import { useSnackbar } from 'notistack';

interface UpdateEnrollmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void; // For shadcn Dialog control
    onSuccess: () => void; // Callback to refetch list on success
    enrollmentData: StudentAcademicYear | null;
}

const statusOptions: { value: EnrollmentStatus, label: string }[] = [
    { value: 'active', label: 'نشط' },
    { value: 'transferred', label: 'منقول' },
    { value: 'graduated', label: 'متخرج' },
    { value: 'withdrawn', label: 'منسحب' },
];

const UpdateEnrollmentDialog: React.FC<UpdateEnrollmentDialogProps> = ({
    open, onOpenChange, onSuccess, enrollmentData
}) => {
    const { updateEnrollment } = useStudentEnrollmentStore();
    const { classrooms, fetchClassrooms: fetchGradeClassrooms, loading: loadingClassrooms } = useClassroomStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StudentEnrollmentUpdateFormData>({
        // Default values set in useEffect
    });

    // Fetch classrooms and Reset form
    useEffect(() => {
        if (open && enrollmentData) {
            setFormError(null);
            reset({
                classroom_id: enrollmentData.classroom_id || null,
                status: enrollmentData.status || 'active',
                fees: enrollmentData.fees || 0,
            });

            // Fetch classrooms specifically for the grade level and school of this enrollment
            if (enrollmentData.grade_level_id && enrollmentData.school_id && enrollmentData.academic_year_id) {
                 fetchGradeClassrooms({
                     grade_level_id: Number(enrollmentData.grade_level_id),
                     school_id: Number(enrollmentData.school_id),
                     active_academic_year_id: Number(enrollmentData.academic_year_id)
                 });
            }
        }
    }, [enrollmentData, open, reset, fetchGradeClassrooms]);

    const onSubmit = async (data: StudentEnrollmentUpdateFormData) => {
        if (!enrollmentData) return;
        setFormError(null);
        const submitData = {
            ...data,
            classroom_id: data.classroom_id ? Number(data.classroom_id) : null,
            fees: Number(data.fees) || 0,
        };

        try {
            await updateEnrollment(Number(enrollmentData.id), submitData);
            enqueueSnackbar('تم تحديث تسجيل الطالب بنجاح', { variant: 'success' });
            onSuccess();
        } catch (error: unknown) {
             console.error("Update Enrollment Form submission error:", error);
             const errorObj = error as { response?: { data?: { errors?: Record<string, string[]> } }; message?: string };
             const backendErrors = errorObj.response?.data?.errors;
             if (backendErrors) {
                 setFormError(`فشل التحديث: ${Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(errorObj.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

    if (!enrollmentData) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-sm" dir="rtl"> {/* Smaller dialog for update */}
                <DialogHeader>
                    <DialogTitle>تعديل تسجيل الطالب</DialogTitle>
                    <DialogDescription>
                         الطالب: {enrollmentData.student?.student_name ?? '...'}<br/>
                         العام: {enrollmentData.academic_year?.name ?? '...'} /
                         المرحلة: {enrollmentData.grade_level?.name ?? '...'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {formError && (
                            <Alert variant="destructive" className="mb-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Fees Field */}
                        <div className="space-y-2">
                            <Label htmlFor="fees_update">الرسوم *</Label>
                            <Controller name="fees" control={control} rules={{ required: 'الرسوم مطلوبة', min: { value: 0, message: 'الرسوم لا يمكن أن تكون سالبة' } }}
                                render={({ field }) => (
                                    <Input
                                        id="fees_update"
                                        type="number"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder="مثال: 5000"
                                        min="0"
                                        step="1"
                                        className={cn(errors.fees && "border-destructive")}
                                    />
                                )} />
                            {errors.fees && <p className="text-xs text-destructive mt-1">{errors.fees.message}</p>}
                        </div>

                        {/* Classroom Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="classroom_id_update">الفصل (اختياري)</Label>
                            <Controller name="classroom_id" control={control}
                                render={({ field }) => (
                                    <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(val ? Number(val) : null)} disabled={loadingClassrooms}>
                                        <SelectTrigger id="classroom_id_update" className={cn(errors.classroom_id && "border-destructive")}>
                                            <SelectValue placeholder={loadingClassrooms ? "جاري تحميل الفصول..." : "اختر فصلاً..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" "><em>(بدون فصل)</em></SelectItem>
                                            {classrooms.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                            {errors.classroom_id && <p className="text-xs text-destructive mt-1">{errors.classroom_id.message}</p>}
                        </div>

                        {/* Status Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="status_update">حالة التسجيل *</Label>
                            <Controller name="status" control={control} rules={{ required: 'الحالة مطلوبة' }}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange} required>
                                        <SelectTrigger id="status_update" className={cn(errors.status && "border-destructive")}>
                                            <SelectValue placeholder="اختر الحالة..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                            {errors.status && <p className="text-xs text-destructive mt-1">{errors.status.message}</p>}
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>إلغاء</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting || loadingClassrooms}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            حفظ التعديلات
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateEnrollmentDialog;