// src/components/exams/QuickAddScheduleDialog.tsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // For default time/marks
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, Link } from 'lucide-react';
import { Exam } from '@/types/exam'; // Parent exam period
import { GradeLevel } from '@/types/gradeLevel';
import { SchoolApi } from '@/api/schoolApi'; // To fetch school-specific grades
import { ExamScheduleApi } from '@/api/examScheduleApi'; // For quick add API
import { useSnackbar } from 'notistack';
import { useSettingsStore } from '@/stores/settingsStore';

interface QuickAddScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void; // To refetch schedules list
    exam: Exam | null; // The parent exam period
}

type QuickAddFormData = {
    grade_level_id: string; // ID of the grade level to add all subjects for
    // Optional default values for the schedules
    default_start_time?: string;
    default_end_time?: string;
    default_max_marks?: string;
    default_pass_marks?: string;
};

const QuickAddScheduleDialog: React.FC<QuickAddScheduleDialogProps> = ({ open, onOpenChange, onSuccess, exam }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
    const [availableGradeLevels, setAvailableGradeLevels] = useState<GradeLevel[]>([]);
    const [loadingSchoolGrades, setLoadingSchoolGrades] = useState(false);
    // --- Get active academic year from settings ---
    const { activeAcademicYearId } = useSettingsStore.getState();
    const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<QuickAddFormData>({
        defaultValues: {
            grade_level_id: '',
            default_start_time: '09:00',
            default_end_time: '11:00',
            default_max_marks: '100',
            default_pass_marks: '50'
        }
    });

    const selectedGradeId = watch('grade_level_id');

    // Fetch school-specific grade levels when dialog opens
    useEffect(() => {
        if (open && exam?.school_id) {
            setFormSubmitError(null);
            reset({ // Reset to defaults
                 grade_level_id: '', default_start_time: '09:00', default_end_time: '11:00',
                 default_max_marks: '100', default_pass_marks: '50'
            });
            const fetchGrades = async () => {
                setLoadingSchoolGrades(true);
                try {
                    const response = await SchoolApi.getAssignedGradeLevels(exam.school_id);
                    setAvailableGradeLevels(response.data.data ?? []);
                } catch (error) {
                    console.error("Failed to fetch school grades:", error);
                    enqueueSnackbar('فشل تحميل مراحل المدرسة', { variant: 'error' });
                } finally {
                    setLoadingSchoolGrades(false);
                }
            };
            fetchGrades();
        }
    }, [open, exam, reset, enqueueSnackbar]);


    const onSubmit = async (data: QuickAddFormData) => {
        if (!exam || !data.grade_level_id) {
            setFormSubmitError("الرجاء اختيار المرحلة الدراسية.");
            return;
        }
        if (!activeAcademicYearId) { // <-- Check if active year is set
            setFormSubmitError("الرجاء تحديد العام الدراسي النشط في الإعدادات العامة أولاً.");
            enqueueSnackbar("لم يتم تحديد عام دراسي نشط في الإعدادات.", { variant: 'warning' });
            return;
        }
        setFormSubmitError(null);

        const payload = {
            grade_level_id: Number(data.grade_level_id),
            ...(data.default_start_time && { default_start_time: data.default_start_time }),
            ...(data.default_end_time && { default_end_time: data.default_end_time }),
            ...(data.default_max_marks && { default_max_marks: Number(data.default_max_marks) }),
            ...(data.default_pass_marks && { default_pass_marks: Number(data.default_pass_marks) }),
        };

        try {
            const response = await ExamScheduleApi.quickAddSchedulesForGrade(exam.id, Number(data.grade_level_id), activeAcademicYearId, payload);
            enqueueSnackbar(response.data.message || 'تمت عملية الإضافة السريعة بنجاح.', { variant: 'success' });
            onSuccess();
        } catch (error: unknown) {
            console.error("Quick Add Schedule error:", error);
            
            interface ErrorResponse {
                response?: {
                    data?: {
                        errors?: Record<string, string[]>;
                        message?: string;
                    };
                };
                message?: string;
            }
            
            const typedError = error as ErrorResponse;
            const backendErrors = typedError.response?.data?.errors;
            if (backendErrors) {
                setFormSubmitError(`فشل الإضافة: ${Object.values(backendErrors).flat().join('. ')}`);
            } else {
                setFormSubmitError(typedError.response?.data?.message || typedError.message || 'حدث خطأ غير متوقع.');
            }
        }
    };

    if (!exam) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>إضافة سريعة لمواعيد امتحان مرحلة كاملة</DialogTitle>
                    <DialogDescription>
                        اختر المرحلة، وسيتم إضافة جميع موادها المعرفة في المنهج إلى جدول الامتحان لدورة "{exam.name}".
                        يمكنك تعديل المواعيد الفردية لاحقاً.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {formSubmitError && <Alert variant="destructive"><AlertCircle className="h-4 w-4"/><AlertDescription>{formSubmitError}</AlertDescription></Alert>}
                        {!activeAcademicYearId && ( // <-- Alert if no active year
                            <Alert variant="destructive" className="mb-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>تنبيه هام</AlertTitle>
                                <AlertDescription>
                                    لم يتم تحديد عام دراسي نشط في الإعدادات العامة. الإضافة السريعة تعتمد على العام النشط لتحديد المناهج.
                                    <Button variant="link" size="sm" asChild className="p-0 h-auto mr-1"><Link to="/settings/general">الذهاب للإعدادات</Link></Button>
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-1.5">
                            <Label htmlFor="quick_add_grade_level_id">المرحلة الدراسية *</Label>
                            <Controller name="grade_level_id" control={control} rules={{ required: 'المرحلة مطلوبة' }}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange} required disabled={loadingSchoolGrades}>
                                        <SelectTrigger id="quick_add_grade_level_id" className={cn(errors.grade_level_id && "border-destructive")}><SelectValue placeholder="اختر مرحلة..." /></SelectTrigger>
                                        <SelectContent>
                                                                                         <SelectItem value=" " disabled>اختر مرحلة...</SelectItem>
                                            {availableGradeLevels.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                            {errors.grade_level_id && <p className="text-xs text-destructive">{errors.grade_level_id.message}</p>}
                        </div>
                        <p className="text-xs text-muted-foreground">القيم الافتراضية للمواعيد (يمكن تعديلها):</p>
                        <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1.5"><Label htmlFor="default_start_time">وقت البدء الافتراضي</Label><Input id="default_start_time" type="time" {...control.register('default_start_time')} defaultValue="09:00"/></div>
                             <div className="space-y-1.5"><Label htmlFor="default_end_time">وقت الانتهاء الافتراضي</Label><Input id="default_end_time" type="time" {...control.register('default_end_time')} defaultValue="11:00"/></div>
                             <div className="space-y-1.5"><Label htmlFor="default_max_marks">العلامة العظمى</Label><Input id="default_max_marks" type="number" {...control.register('default_max_marks')} defaultValue="100" min="0"/></div>
                             <div className="space-y-1.5"><Label htmlFor="default_pass_marks">علامة النجاح</Label><Input id="default_pass_marks" type="number" {...control.register('default_pass_marks')} defaultValue="50" min="0"/></div>
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>إلغاء</Button></DialogClose>
                        <Button type="submit" disabled={isSubmitting || loadingSchoolGrades || !selectedGradeId}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            إضافة مواد المرحلة
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default QuickAddScheduleDialog;