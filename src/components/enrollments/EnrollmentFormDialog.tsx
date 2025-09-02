// src/components/enrollments/EnrollmentFormDialog.tsx
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, ChevronsUpDown, Check } from 'lucide-react';

import { EnrollmentFormData, EnrollmentStatus, EnrollmentType } from '@/types/enrollment';
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore';
import { useClassroomStore } from '@/stores/classroomStore';
import { AcademicYear } from '@/types/academicYear';
import { GradeLevel } from '@/types/gradeLevel';
import { useSnackbar } from 'notistack';

interface EnrollmentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void; // For shadcn Dialog control
    onSuccess: () => void; // Callback to refetch list on success
    selectedAcademicYear: AcademicYear | null;
    selectedGradeLevel: GradeLevel | null;
}

const statusOptions: { value: EnrollmentStatus, label: string }[] = [
    { value: 'active', label: 'نشط' },
    { value: 'transferred', label: 'منقول' },
    { value: 'graduated', label: 'متخرج' },
    { value: 'withdrawn', label: 'منسحب' },
];

const EnrollmentFormDialog: React.FC<EnrollmentFormDialogProps> = ({
    open, onOpenChange, onSuccess, selectedAcademicYear, selectedGradeLevel
}) => {
    const { enrollStudent, fetchEnrollableStudents, enrollableStudents, loadingEnrollable } = useStudentEnrollmentStore();
    const { classrooms, fetchClassrooms: fetchGradeClassrooms, loading: loadingClassrooms } = useClassroomStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);
    const [studentComboboxOpen, setStudentComboboxOpen] = useState(false);


    const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<EnrollmentFormData>({
        // Default values set in useEffect
    });

    // Fetch data and Reset form
    useEffect(() => {
        if (open) {
            setFormError(null);
            const defaults: Partial<StudentEnrollmentFormData> = {
                student_id: '', // Reset student selection
                academic_year_id: selectedAcademicYear?.id || 0, // Must have value
                grade_level_id: selectedGradeLevel?.id || 0,   // Must have value
                school_id: selectedAcademicYear?.school_id || 0, // Must have value
                classroom_id: null,
                status: 'active',
                // Fees will be automatically set by backend based on school's annual_fees
                discount: 0, // Default discount
                enrollment_type: 'regular',
            };
            reset(defaults);

            if (selectedAcademicYear?.id && selectedAcademicYear?.school_id) {
                fetchEnrollableStudents(selectedAcademicYear.id, selectedAcademicYear.school_id);
            }
            if (selectedGradeLevel?.id && selectedAcademicYear?.school_id && selectedAcademicYear?.id) {
                fetchGradeClassrooms({
                    grade_level_id: selectedGradeLevel.id,
                    school_id: selectedAcademicYear.school_id,
                    active_academic_year_id: selectedAcademicYear.id
                });
            }
        } else {
            // Clear lists when dialog closes to avoid stale data on reopen
             useStudentEnrollmentStore.getState().clearEnrollableStudents();
             // useClassroomStore.getState().clearClassrooms(); // If classrooms store has a clear action
        }
    }, [
        open, selectedAcademicYear, selectedGradeLevel, reset,
        fetchEnrollableStudents, fetchGradeClassrooms
    ]);


    const onSubmit = async (data: StudentEnrollmentFormData) => {
        setFormError(null);
        const submitData = {
            ...data,
            student_id: Number(data.student_id),
            academic_year_id: Number(data.academic_year_id),
            grade_level_id: Number(data.grade_level_id),
            school_id: Number(data.school_id),
            classroom_id: data.classroom_id ? Number(data.classroom_id) : null,
            // Fees will be automatically set by backend based on school's annual_fees
            discount: Number(data.discount) || 0,
            enrollment_type: data.enrollment_type || 'regular',
        };

        if (!submitData.student_id || !submitData.academic_year_id || !submitData.grade_level_id || !submitData.school_id) {
             setFormError("بيانات التسجيل الأساسية غير مكتملة."); return;
        }

        try {
            await enrollStudent(submitData);
            enqueueSnackbar('تم تسجيل الطالب بنجاح في هذا العام/المرحلة', { variant: 'success' });
            onSuccess();
        } catch (error: unknown) {
             console.error("Enrollment Form submission error:", error);
             const errorObj = error as { response?: { data?: { errors?: Record<string, string[]> } }; message?: string };
             const backendErrors = errorObj.response?.data?.errors;
             if (backendErrors) {
                 setFormError(`فشل التسجيل: ${Object.values(backendErrors).flat().join('. ')}`);
             } else {
                 setFormError(errorObj.message || 'حدث خطأ غير متوقع.');
             }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-lg" dir="rtl"> {/* Larger dialog */}
                <DialogHeader>
                    <DialogTitle>تسجيل طالب جديد</DialogTitle>
                    <DialogDescription>
                        تسجيل طالب في المرحلة: {selectedGradeLevel?.name ?? '...'} للعام الدراسي: {selectedAcademicYear?.name ?? '...'}
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
                        {/* Student Selection using Command (Autocomplete pattern) */}
                        <div className="space-y-2">
                            <Label htmlFor="student_id">الطالب *</Label>
                            <Controller name="student_id" control={control} rules={{ required: 'الرجاء اختيار الطالب' }}
                                render={({ field }) => (
                                    <Popover open={studentComboboxOpen} onOpenChange={setStudentComboboxOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={studentComboboxOpen}
                                                className={cn("w-full justify-between", errors.student_id && "border-destructive")}
                                                disabled={loadingEnrollable}
                                            >
                                                {field.value
                                                    ? enrollableStudents.find(s => s.id === Number(field.value))?.student_name
                                                    : (loadingEnrollable ? "جاري تحميل الطلاب..." : "اختر طالب...")}
                                                <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[200px] overflow-y-auto">
                                            <div className="p-2">
                                                <input
                                                    placeholder="بحث عن طالب بالاسم أو الرقم الوطني..."
                                                    className="w-full p-2 border rounded"
                                                />
                                                <div className="mt-2">
                                                    {enrollableStudents.length === 0 ? (
                                                        <div className="p-2 text-center text-muted-foreground">لم يتم العثور على طلاب متاحين.</div>
                                                    ) : (
                                                        enrollableStudents.map((studentInfo) => (
                                                            <div
                                                                key={studentInfo.id}
                                                                className="flex items-center p-2 hover:bg-muted cursor-pointer"
                                                                onClick={() => {
                                                                    setValue("student_id", studentInfo.id, { shouldValidate: true });
                                                                    setStudentComboboxOpen(false);
                                                                }}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", Number(field.value) === studentInfo.id ? "opacity-100" : "opacity-0")} />
                                                                {studentInfo.student_name} ({studentInfo.goverment_id || 'لا يوجد رقم وطني'})
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )} />
                            {errors.student_id && <p className="text-xs text-destructive mt-1">{errors.student_id.message}</p>}
                        </div>



                        {/* Discount Field */}
                        <div className="space-y-2">
                            <Label htmlFor="discount">الخصم *</Label>
                            <Controller name="discount" control={control} rules={{ required: 'الخصم مطلوب', min: { value: 0, message: 'الخصم لا يمكن أن يكون سالباً' } }}
                                render={({ field }) => (
                                    <Input
                                        id="discount"
                                        type="number"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder="مثال: 500"
                                        min="0"
                                        step="1"
                                        className={cn(errors.discount && "border-destructive")}
                                    />
                                )} />
                            {errors.discount && <p className="text-xs text-destructive mt-1">{errors.discount.message}</p>}
                        </div>

                        {/* Classroom Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="classroom_id">الفصل (اختياري)</Label>
                            <Controller name="classroom_id" control={control}
                                render={({ field }) => (
                                    <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(val ? Number(val) : null)} disabled={loadingClassrooms}>
                                        <SelectTrigger id="classroom_id" className={cn(errors.classroom_id && "border-destructive")}>
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
                            <Label htmlFor="status">حالة التسجيل *</Label>
                            <Controller name="status" control={control} rules={{ required: 'الحالة مطلوبة' }}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange} required>
                                        <SelectTrigger id="status" className={cn(errors.status && "border-destructive")}>
                                            <SelectValue placeholder="اختر الحالة..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                            {errors.status && <p className="text-xs text-destructive mt-1">{errors.status.message}</p>}
                        </div>

                        {/* Enrollment Type Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="enrollment_type">نوع التسجيل *</Label>
                            <Controller name="enrollment_type" control={control} rules={{ required: 'نوع التسجيل مطلوب' }}
                                render={({ field }) => (
                                    <Select value={field.value || 'regular'} onValueChange={field.onChange} required>
                                        <SelectTrigger id="enrollment_type" className={cn(errors.enrollment_type && "border-destructive")}>
                                            <SelectValue placeholder="اختر النوع..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="regular">عادي</SelectItem>
                                            <SelectItem value="scholarship">منحة</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            {errors.enrollment_type && <p className="text-xs text-destructive mt-1">{errors.enrollment_type.message as string}</p>}
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>إلغاء</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting || loadingEnrollable || loadingClassrooms}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            تسجيل الطالب
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EnrollmentFormDialog;