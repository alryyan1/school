// src/components/exams/QuickAddScheduleDialog.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, Clock, BookOpen, Users, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { Exam } from '@/types/exam';
import { GradeLevel } from '@/types/gradeLevel';
import { SchoolApi } from '@/api/schoolApi';
import { ExamScheduleApi } from '@/api/examScheduleApi';
import { useSnackbar } from 'notistack';
import { useSettingsStore } from '@/stores/settingsStore';

interface QuickAddScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    exam: Exam | null;
}

type QuickAddFormData = {
    grade_level_id: string;
    default_start_time: string;
    default_end_time: string;
    default_max_marks: string;
    default_pass_marks: string;
    default_duration?: string; // in minutes
};

// Enhanced validation rules
const VALIDATION_RULES = {
    grade_level_id: {
        required: 'المرحلة الدراسية مطلوبة',
        validate: (value: string) => value !== '' || 'يجب اختيار مرحلة دراسية'
    },
    default_start_time: {
        required: 'وقت البدء مطلوب',
        pattern: {
            value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            message: 'صيغة الوقت غير صحيحة'
        }
    },
    default_end_time: {
        required: 'وقت الانتهاء مطلوب',
        pattern: {
            value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            message: 'صيغة الوقت غير صحيحة'
        }
    },
    default_max_marks: {
        required: 'العلامة العظمى مطلوبة',
        min: { value: 1, message: 'العلامة العظمى يجب أن تكون أكبر من 0' },
        max: { value: 1000, message: 'العلامة العظمى لا يمكن أن تتجاوز 1000' }
    },
    default_pass_marks: {
        required: 'علامة النجاح مطلوبة',
        min: { value: 0, message: 'علامة النجاح لا يمكن أن تكون سالبة' }
    }
};

const QuickAddScheduleDialog: React.FC<QuickAddScheduleDialogProps> = ({ 
    open, 
    onOpenChange, 
    onSuccess, 
    exam 
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
    const [availableGradeLevels, setAvailableGradeLevels] = useState<GradeLevel[]>([]);
    const [loadingSchoolGrades, setLoadingSchoolGrades] = useState(false);
    const [previewData, setPreviewData] = useState<{
        selectedGrade?: GradeLevel;
        subjectCount?: number;
        estimatedDuration?: number;
    }>({});
    
    const { activeAcademicYearId } = useSettingsStore();

    const { 
        control,
        handleSubmit, 
        reset, 
        watch, 
        trigger,
        clearErrors,
        formState: { errors, isSubmitting, isValid, isDirty } 
    } = useForm<QuickAddFormData>({
        mode: 'onChange',
        defaultValues: {
            grade_level_id: '',
            default_start_time: '09:00',
            default_end_time: '11:00',
            default_max_marks: '100',
            default_pass_marks: '50',
            default_duration: '120'
        }
    });

    const watchedFields = watch();
    const selectedGradeId = watch('grade_level_id');
    const startTime = watch('default_start_time');
    const endTime = watch('default_end_time');
    const maxMarks = watch('default_max_marks');
    const passMarks = watch('default_pass_marks');

    // Time validation
    const validateTimeRange = useCallback((start: string, end: string) => {
        if (!start || !end) return true;
        
        const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
        const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
        
        if (endMinutes <= startMinutes) {
            return 'وقت الانتهاء يجب أن يكون بعد وقت البدء';
        }
        
        const duration = endMinutes - startMinutes;
        if (duration < 30) {
            return 'مدة الامتحان يجب أن تكون 30 دقيقة على الأقل';
        }
        
        if (duration > 480) { // 8 hours
            return 'مدة الامتحان لا يمكن أن تتجاوز 8 ساعات';
        }
        
        return true;
    }, []);

    // Marks validation
    const validateMarks = useCallback((maxMarks: string, passMarks: string) => {
        const max = parseFloat(maxMarks);
        const pass = parseFloat(passMarks);
        
        if (pass > max) {
            return 'علامة النجاح لا يمكن أن تكون أكبر من العلامة العظمى';
        }
        
        if (pass < max * 0.3) {
            return 'علامة النجاح منخفضة جداً (أقل من 30% من العلامة العظمى)';
        }
        
        return true;
    }, []);

    // Enhanced grade fetching with caching
    const fetchGradeLevels = useCallback(async () => {
        if (!exam?.school_id) return;
        
        setLoadingSchoolGrades(true);
        try {
            const response = await SchoolApi.getAssignedGradeLevels(exam.school_id);
            const grades = response.data.data ?? [];
            setAvailableGradeLevels(grades);
            
            if (grades.length === 0) {
                enqueueSnackbar('لا توجد مراحل دراسية مسجلة لهذه المدرسة', { variant: 'warning' });
            }
        } catch (error) {
            console.error("Failed to fetch school grades:", error);
            enqueueSnackbar('فشل تحميل مراحل المدرسة', { variant: 'error' });
            setAvailableGradeLevels([]);
        } finally {
            setLoadingSchoolGrades(false);
        }
    }, [exam?.school_id, enqueueSnackbar]);

    // Update preview data when selection changes
    useEffect(() => {
        if (selectedGradeId) {
            const selectedGrade = availableGradeLevels.find(g => g.id === parseInt(selectedGradeId));
            if (selectedGrade) {
                setPreviewData(prev => ({
                    ...prev,
                    selectedGrade,
                    subjectCount: selectedGrade.subjects?.length || 0,
                    estimatedDuration: selectedGrade.subjects?.length ? 
                        selectedGrade.subjects.length * 2 : 0 // 2 hours per subject estimate
                }));
            }
        } else {
            setPreviewData({});
        }
    }, [selectedGradeId, availableGradeLevels]);

    // Initialize dialog
    useEffect(() => {
        if (open && exam?.school_id) {
            setFormSubmitError(null);
            clearErrors();
            reset({
                grade_level_id: '',
                default_start_time: '09:00',
                default_end_time: '11:00',
                default_max_marks: '100',
                default_pass_marks: '50',
                default_duration: '120'
            });
            fetchGradeLevels();
        }
    }, [open, exam, reset, clearErrors, fetchGradeLevels]);

    // Enhanced form submission
    const onSubmit = async (data: QuickAddFormData) => {
        if (!exam || !data.grade_level_id) {
            setFormSubmitError("الرجاء اختيار المرحلة الدراسية.");
            return;
        }

        if (!activeAcademicYearId) {
            setFormSubmitError("الرجاء تحديد العام الدراسي النشط في الإعدادات العامة أولاً.");
            enqueueSnackbar("لم يتم تحديد عام دراسي نشط في الإعدادات.", { variant: 'warning' });
            return;
        }

        // Additional validations
        const timeValidation = validateTimeRange(data.default_start_time, data.default_end_time);
        if (timeValidation !== true) {
            setFormSubmitError(timeValidation);
            return;
        }

        const marksValidation = validateMarks(data.default_max_marks, data.default_pass_marks);
        if (marksValidation !== true) {
            setFormSubmitError(marksValidation);
            return;
        }

        setFormSubmitError(null);

        const payload = {
            grade_level_id: Number(data.grade_level_id),
            default_start_time: data.default_start_time,
            default_end_time: data.default_end_time,
            default_max_marks: Number(data.default_max_marks),
            default_pass_marks: Number(data.default_pass_marks),
            ...(data.default_duration && { default_duration: Number(data.default_duration) })
        };

        try {
            const response = await ExamScheduleApi.quickAddSchedulesForGrade(
                exam.id, 
                Number(data.grade_level_id), 
                activeAcademicYearId, 
                payload
            );

            const successMessage = response.data.message || 'تمت عملية الإضافة السريعة بنجاح.';
            const addedCount = response.data.added_count || 0;
            
            enqueueSnackbar(
                `${successMessage} (تم إضافة ${addedCount} موعد امتحان)`, 
                { 
                    variant: 'success',
                    autoHideDuration: 6000,
                    action: (key) => (
                        <Button size="sm" onClick={() => {/* Navigate to schedule view */}}>
                            عرض الجدول
                        </Button>
                    )
                }
            );
            
            onSuccess();
            
        } catch (error: unknown) {
            console.error("Quick Add Schedule error:", error);
            
            interface ErrorResponse {
                response?: {
                    data?: {
                        errors?: Record<string, string[]>;
                        message?: string;
                    };
                    status?: number;
                };
                message?: string;
            }
            
            const typedError = error as ErrorResponse;
            const backendErrors = typedError.response?.data?.errors;
            const status = typedError.response?.status;
            
            if (backendErrors) {
                setFormSubmitError(`فشل الإضافة: ${Object.values(backendErrors).flat().join('. ')}`);
            } else if (status === 409) {
                setFormSubmitError('توجد مواعيد امتحان مسجلة مسبقاً لهذه المرحلة. يرجى المراجعة.');
            } else if (status === 422) {
                setFormSubmitError('البيانات المدخلة غير صحيحة. يرجى المراجعة.');
            } else {
                setFormSubmitError(
                    typedError.response?.data?.message || 
                    typedError.message || 
                    'حدث خطأ غير متوقع.'
                );
            }
        }
    };

    if (!exam) return null;

    const calculateDuration = (start: string, end: string): number => {
        if (!start || !end) return 0;
        const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
        const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
        return Math.max(0, endMinutes - startMinutes);
    };

    const duration = calculateDuration(startTime, endTime);

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        إضافة سريعة لمواعيد امتحان مرحلة كاملة
                    </DialogTitle>
                    <DialogDescription>
                        اختر المرحلة الدراسية وحدد الإعدادات الافتراضية، وسيتم إضافة جميع موادها المعرفة في المنهج إلى جدول الامتحان لدورة{' '}
                        <span className="font-semibold">"{exam.name}"</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 py-4">
                        {/* Error Alert */}
                        {formSubmitError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{formSubmitError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Academic Year Warning */}
                        {!activeAcademicYearId && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>تنبيه هام</AlertTitle>
                                <AlertDescription className="space-y-2">
                                    <p>لم يتم تحديد عام دراسي نشط في الإعدادات العامة. الإضافة السريعة تعتمد على العام النشط لتحديد المناهج.</p>
                                    <Button variant="link" size="sm" className="p-0 h-auto text-destructive" asChild>
                                        <a href="/settings/general" target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            الذهاب للإعدادات
                                        </a>
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Exam Info Card */}
                        <Card className="bg-muted/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">معلومات دورة الامتحان</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">اسم الدورة:</span>
                                    <Badge variant="outline">{exam.name}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">الفترة:</span>
                                    <span>{exam.start_date} إلى {exam.end_date}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Grade Level Selection */}
                        <div className="space-y-3">
                            <Label htmlFor="quick_add_grade_level_id" className="text-sm font-medium">
                                المرحلة الدراسية <span className="text-destructive">*</span>
                            </Label>
                            <Controller 
                                name="grade_level_id" 
                                control={control} 
                                rules={VALIDATION_RULES.grade_level_id}
                                render={({ field }) => (
                                    <Select 
                                        value={field.value} 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            trigger('grade_level_id');
                                        }}
                                        required 
                                        disabled={loadingSchoolGrades}
                                    >
                                        <SelectTrigger 
                                            id="quick_add_grade_level_id" 
                                            className={cn(
                                                "h-11",
                                                errors.grade_level_id && "border-destructive"
                                            )}
                                        >
                                            <SelectValue placeholder={
                                                loadingSchoolGrades ? "جاري التحميل..." : "اختر مرحلة دراسية..."
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableGradeLevels.length === 0 ? (
                                                <SelectItem value="" disabled>
                                                    <em>لا توجد مراحل متاحة</em>
                                                </SelectItem>
                                            ) : (
                                                availableGradeLevels.map(grade => (
                                                    <SelectItem key={grade.id} value={String(grade.id)}>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4" />
                                                            <span>{grade.name}</span>
                                                            {grade.subjects && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {grade.subjects.length} مادة
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.grade_level_id && (
                                <p className="text-xs text-destructive">
                                    {errors.grade_level_id.message}
                                </p>
                            )}
                        </div>

                        {/* Preview Card */}
                        {previewData.selectedGrade && (
                            <Card className="border-green-200 bg-green-50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        معاينة الإضافة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">المرحلة:</span>
                                            <p className="font-medium">{previewData.selectedGrade.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">عدد المواد:</span>
                                            <p className="font-medium">{previewData.subjectCount || 0} مادة</p>
                                        </div>
                                    </div>
                                    {previewData.subjectCount === 0 && (
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertDescription>
                                                لا توجد مواد مسجلة لهذه المرحلة في المنهج النشط
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Separator />

                        {/* Default Settings */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <Label className="text-sm font-medium">الإعدادات الافتراضية</Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                هذه القيم ستُطبق على جميع مواعيد الامتحان المضافة. يمكنك تعديل كل موعد بشكل منفصل لاحقاً.
                            </p>

                            {/* Time Settings */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="default_start_time" className="text-sm">
                                        وقت البدء الافتراضي <span className="text-destructive">*</span>
                                    </Label>
                                    <Controller
                                        name="default_start_time"
                                        control={control}
                                        rules={{
                                            ...VALIDATION_RULES.default_start_time,
                                            validate: (value) => validateTimeRange(value, endTime)
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                id="default_start_time"
                                                type="time"
                                                {...field}
                                                className={cn(
                                                    "h-10",
                                                    errors.default_start_time && "border-destructive"
                                                )}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    trigger(['default_start_time', 'default_end_time']);
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.default_start_time && (
                                        <p className="text-xs text-destructive">
                                            {errors.default_start_time.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="default_end_time" className="text-sm">
                                        وقت الانتهاء الافتراضي <span className="text-destructive">*</span>
                                    </Label>
                                    <Controller
                                        name="default_end_time"
                                        control={control}
                                        rules={{
                                            ...VALIDATION_RULES.default_end_time,
                                            validate: (value) => validateTimeRange(startTime, value)
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                id="default_end_time"
                                                type="time"
                                                {...field}
                                                className={cn(
                                                    "h-10",
                                                    errors.default_end_time && "border-destructive"
                                                )}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    trigger(['default_start_time', 'default_end_time']);
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.default_end_time && (
                                        <p className="text-xs text-destructive">
                                            {errors.default_end_time.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Duration Display */}
                            {duration > 0 && (
                                <div className="text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    مدة الامتحان: {Math.floor(duration / 60)} ساعة {duration % 60} دقيقة
                                </div>
                            )}

                            {/* Marks Settings */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="default_max_marks" className="text-sm">
                                        العلامة العظمى الافتراضية <span className="text-destructive">*</span>
                                    </Label>
                                    <Controller
                                        name="default_max_marks"
                                        control={control}
                                        rules={{
                                            ...VALIDATION_RULES.default_max_marks,
                                            validate: (value) => validateMarks(value, passMarks)
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                id="default_max_marks"
                                                type="number"
                                                min="1"
                                                max="1000"
                                                {...field}
                                                className={cn(
                                                    "h-10",
                                                    errors.default_max_marks && "border-destructive"
                                                )}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    trigger(['default_max_marks', 'default_pass_marks']);
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.default_max_marks && (
                                        <p className="text-xs text-destructive">
                                            {errors.default_max_marks.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="default_pass_marks" className="text-sm">
                                        علامة النجاح الافتراضية <span className="text-destructive">*</span>
                                    </Label>
                                    <Controller
                                        name="default_pass_marks"
                                        control={control}
                                        rules={{
                                            ...VALIDATION_RULES.default_pass_marks,
                                            validate: (value) => validateMarks(maxMarks, value)
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                id="default_pass_marks"
                                                type="number"
                                                min="0"
                                                max={maxMarks}
                                                {...field}
                                                className={cn(
                                                    "h-10",
                                                    errors.default_pass_marks && "border-destructive"
                                                )}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    trigger(['default_max_marks', 'default_pass_marks']);
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.default_pass_marks && (
                                        <p className="text-xs text-destructive">
                                            {errors.default_pass_marks.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Pass Percentage Display */}
                            {maxMarks && passMarks && (
                                <div className="text-sm text-muted-foreground">
                                    نسبة النجاح: {Math.round((parseFloat(passMarks) / parseFloat(maxMarks)) * 100)}%
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-6 border-t">
                        <div className="flex items-center justify-between w-full">
                            <div className="text-xs text-muted-foreground">
                                {previewData.subjectCount ? (
                                    <span>سيتم إضافة {previewData.subjectCount} موعد امتحان</span>
                                ) : (
                                    <span>اختر مرحلة لمعاينة المواد</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={isSubmitting}>
                                        إلغاء
                                    </Button>
                                </DialogClose>
                                <Button 
                                    type="submit" 
                                    disabled={
                                        isSubmitting || 
                                        loadingSchoolGrades || 
                                        !selectedGradeId || 
                                        !isValid ||
                                        previewData.subjectCount === 0
                                    }
                                    className="min-w-[140px]"
                                >
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    إضافة مواد المرحلة
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default QuickAddScheduleDialog;
