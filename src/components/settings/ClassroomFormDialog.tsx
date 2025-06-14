// src/components/settings/ClassroomFormDialog.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog"; // shadcn Dialog
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"; // shadcn Select
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from 'lucide-react'; // Icons

import { Classroom, ClassroomFormData } from '@/types/classroom'; // Adjust path
import { useClassroomStore } from '@/stores/classroomStore';   // Adjust path
import { useUserStore } from '@/stores/userStore';             // For a broader user list if teachers aren't separate
import { useSnackbar } from 'notistack'; // Keep for general notifications

interface ClassroomFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void; // For shadcn Dialog
    onSuccess: () => void; // Callback to refetch list on success
    initialData?: Classroom | null;
    schoolId: number | null; // Required from parent (ClassroomList)
    gradeLevelId: number | null; // Required from parent (ClassroomList)
}

// Form data for this dialog (name, capacity, teacher_id)
type DialogFormData = Omit<ClassroomFormData, 'school_id' | 'grade_level_id'>;

const ClassroomFormDialog: React.FC<ClassroomFormDialogProps> = ({
    open, onOpenChange, onSuccess, initialData, schoolId, gradeLevelId
}) => {
    const isEditMode = !!initialData;
    const { createClassroom, updateClassroom } = useClassroomStore();
    // Assuming useUserStore fetches users with 'teacher' role or similar
    const { users: allTeachers, fetchUsers: fetchAllTeachers, loading: teachersLoading } = useUserStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DialogFormData>({
        defaultValues: { name: '', teacher_id: null, capacity: 30 }
    });

    // Fetch potential teachers (users with teacher role)
    useEffect(() => {
        if (open) {
            // Fetch users if not already loaded or if list is empty
            // Add filter for 'teacher' role if your API/store supports it
            if (allTeachers.length === 0) {
                 fetchAllTeachers(1, { role: 'teacher' }); // Example: Fetch teachers
            }
        }
    }, [open, allTeachers.length, fetchAllTeachers]);

    // Reset form based on mode and data
    useEffect(() => {
        if (open) {
            setFormSubmitError(null);
            if (isEditMode && initialData) {
                reset({
                    name: initialData.name || '',
                    teacher_id: initialData.teacher_id || null,
                    capacity: initialData.capacity || 30,
                });
            } else {
                reset({ name: '', teacher_id: null, capacity: 30 });
            }
        }
    }, [initialData, isEditMode, open, reset]);


    const onSubmit = async (data: DialogFormData) => {
        setFormSubmitError(null);
        let submitData: ClassroomFormData;

        if (isEditMode && initialData) {
            submitData = {
                ...data,
                school_id: initialData.school_id,
                grade_level_id: initialData.grade_level_id,
                teacher_id: data.teacher_id ? Number(data.teacher_id) : null,
                capacity: Number(data.capacity),
            };
        } else if (!isEditMode && schoolId && gradeLevelId) {
            submitData = {
                ...data,
                school_id: schoolId,
                grade_level_id: gradeLevelId,
                teacher_id: data.teacher_id ? Number(data.teacher_id) : null,
                capacity: Number(data.capacity),
            };
        } else {
            setFormSubmitError("بيانات المدرسة أو المرحلة الدراسية غير متوفرة.");
            return;
        }

        try {
            if (isEditMode && initialData) {
                 const updatePayload = {
                     name: submitData.name,
                     teacher_id: submitData.teacher_id,
                     capacity: submitData.capacity
                 }; // Backend might not need school/grade ID for update
                await updateClassroom(initialData.id, updatePayload);
                enqueueSnackbar('تم تحديث الفصل بنجاح', { variant: 'success' });
            } else {
                await createClassroom(submitData);
                enqueueSnackbar('تم إضافة الفصل بنجاح', { variant: 'success' });
            }
            onSuccess(); // Close dialog and trigger refetch
        } catch (error: unknown) {
            console.error("Classroom Form submission error:", error);
            const backendErrors = (error as { response?: { data?: { errors?: Record<string, string[]> } } }).response?.data?.errors;
            if (backendErrors) {
                setFormSubmitError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
            } else {
                setFormSubmitError((error as Error).message || 'حدث خطأ غير متوقع.');
            }
        }
    };
    
    const teacherOptions = useMemo(() =>
        allTeachers.filter(u => u.role === 'teacher' || u.role === 'admin') // Example roles
        .sort((a,b) => a.name.localeCompare(b.name)),
    [allTeachers]);


    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-[480px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? `تعديل الفصل: ${initialData?.name}` : 'إضافة فصل دراسي جديد'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'تعديل تفاصيل الفصل الدراسي المحدد.' : 'أدخل تفاصيل الفصل الدراسي الجديد.'}
                         {initialData && (
                            <p className="text-xs text-muted-foreground mt-1">
                                للمدرسة: {initialData.school?.name ?? '-'} / المرحلة: {initialData.grade_level?.name ?? '-'}
                            </p>
                        )}
                         {!initialData && schoolId && gradeLevelId && (
                             <p className="text-xs text-muted-foreground mt-1">
                                 (سيتم إضافة الفصل للمدرسة والمرحلة المحددتين)
                             </p>
                         )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {formSubmitError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>خطأ</AlertTitle>
                                <AlertDescription>{formSubmitError}</AlertDescription>
                            </Alert>
                        )}
                        <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                            <Label htmlFor="name" className="text-right col-span-1">اسم الفصل *</Label>
                            <div className="col-span-3">
                                <Controller name="name" control={control} rules={{ required: 'اسم الفصل مطلوب' }}
                                    render={({ field }) => <Input id="name" placeholder="مثال: شعبه أ" {...field} className={cn(errors.name && "border-destructive")} />} />
                                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                            <Label htmlFor="capacity" className="text-right col-span-1">السعة *</Label>
                            <div className="col-span-3">
                                <Controller name="capacity" control={control} rules={{ required: 'السعة مطلوبة', min: {value: 1, message:'السعة >= 1'} }}
                                    render={({ field }) => <Input id="capacity" type="number" {...field} className={cn(errors.capacity && "border-destructive")} />} />
                                {errors.capacity && <p className="text-xs text-destructive mt-1">{errors.capacity.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                            <Label htmlFor="teacher_id" className="text-right col-span-1">مدرس الفصل</Label>
                             <div className="col-span-3">
                                <Controller name="teacher_id" control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ? String(field.value) : ""}
                                            onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                                            disabled={teachersLoading}
                                        >
                                            <SelectTrigger className={cn(errors.teacher_id && "border-destructive")}>
                                                <SelectValue placeholder={teachersLoading ? "جاري تحميل المدرسين..." : "اختر مدرس الفصل (اختياري)"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                 <SelectItem value=" "><em>(بدون مدرس)</em></SelectItem>
                                                 {teacherOptions.map(teacher => (
                                                     <SelectItem key={teacher.id} value={String(teacher.id)}>{teacher.name}</SelectItem>
                                                 ))}
                                            </SelectContent>
                                        </Select>
                                    )} />
                                {errors.teacher_id && <p className="text-xs text-destructive mt-1">{errors.teacher_id.message}</p>}
                             </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>إلغاء</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting || teachersLoading}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'حفظ التعديلات' : 'إضافة فصل'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ClassroomFormDialog;