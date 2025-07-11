// src/components/exams/ExamFormDialog.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, CalendarIcon, CheckCircle } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.locale("ar");

import { Exam, ExamFormData } from "@/types/exam";
import { useExamStore } from "@/stores/examStore";
import { useSchoolStore } from "@/stores/schoolStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useSnackbar } from "notistack";

interface ExamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: Exam | null;
}

// Enhanced validation rules
const VALIDATION_RULES = {
  name: {
    required: "اسم الدورة مطلوب",
    minLength: {
      value: 3,
      message: "اسم الدورة يجب أن يكون على الأقل 3 أحرف"
    },
    maxLength: {
      value: 255,
      message: "اسم الدورة يجب أن لا يتجاوز 255 حرف"
    },
    pattern: {
      value: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\w\d\-_.،؛؟!]+$/,
      message: "اسم الدورة يحتوي على أحرف غير مسموحة"
    }
  },
  school_id: {
    required: "المدرسة مطلوبة",
    validate: (value: number) => value > 0 || "يجب اختيار مدرسة صحيحة"
  },
  description: {
    maxLength: {
      value: 1000,
      message: "الوصف يجب أن لا يتجاوز 1000 حرف"
    }
  }
};

const ExamFormDialog: React.FC<ExamFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}) => {
  const isEditMode = !!initialData;
  const { createExam, updateExam, loading: examLoading } = useExamStore();
  const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
  const { activeSchoolId: defaultActiveSchoolId, loading: settingsLoading } = useSettingsStore();
  const { enqueueSnackbar } = useSnackbar();
  
  // Enhanced state management
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState({ start: false, end: false });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    clearErrors,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<ExamFormData>({
    mode: 'onChange', // Real-time validation
    reValidateMode: 'onChange',
    defaultValues: {
      name: "",
      school_id: 0,
      start_date: dayjs().format("YYYY-MM-DD"),
      end_date: dayjs().add(7, "day").format("YYYY-MM-DD"),
      description: "",
    }
  });

  // Watch form changes for unsaved changes detection
  const watchedFields = watch();
  useEffect(() => {
    if (open && isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [watchedFields, open, isDirty]);

  // Enhanced school fetching with error handling
  const handleFetchSchools = useCallback(async () => {
    try {
      await fetchSchools();
    } catch (error) {
      console.error("Failed to fetch schools:", error);
      enqueueSnackbar("فشل تحميل قائمة المدارس", { variant: "error" });
    }
  }, [fetchSchools, enqueueSnackbar]);

  // Initialize form when dialog opens
  useEffect(() => {
    if (open && schools.length === 0 && !schoolsLoading) {
      handleFetchSchools();
    }
  }, [open, schools.length, schoolsLoading, handleFetchSchools]);

  // Enhanced form reset with better default handling
  useEffect(() => {
    if (open) {
      setFormSubmitError(null);
      setHasUnsavedChanges(false);
      clearErrors();
      
      const now = dayjs();
      const defaultSchoolId = initialData?.school_id || defaultActiveSchoolId || 0;
      
      const formData: ExamFormData = {
        name: initialData?.name || "",
        school_id: defaultSchoolId,
        start_date: initialData?.start_date 
          ? dayjs(initialData.start_date).format("YYYY-MM-DD")
          : now.format("YYYY-MM-DD"),
        end_date: initialData?.end_date 
          ? dayjs(initialData.end_date).format("YYYY-MM-DD")
          : now.add(7, "day").format("YYYY-MM-DD"),
        description: initialData?.description || "",
      };

      reset(formData);
    }
  }, [initialData, open, reset, defaultActiveSchoolId, clearErrors]);

  // Enhanced date validation
  const validateDateRange = useCallback((startDate: string, endDate: string) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const now = dayjs();
    
    // Check if dates are valid
    if (!start.isValid() || !end.isValid()) {
      return "تاريخ غير صحيح";
    }
    
    // Check if end date is after start date
    if (end.isBefore(start)) {
      return "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    }
    
    // Check if date range is not too long (e.g., more than 6 months)
    if (end.diff(start, 'month') > 6) {
      return "فترة الامتحان لا يمكن أن تتجاوز 6 أشهر";
    }
    
    // Warning for past dates (but don't block submission)
    if (start.isBefore(now, 'day') && !isEditMode) {
      enqueueSnackbar("تحذير: تاريخ البداية في الماضي", { variant: "warning" });
    }
    
    return true;
  }, [isEditMode, enqueueSnackbar]);

  // Enhanced form submission with better error handling
  const onSubmit = async (data: ExamFormData) => {
    setFormSubmitError(null);
    
    // Additional validation
    const dateValidation = validateDateRange(data.start_date, data.end_date);
    if (dateValidation !== true) {
      setFormSubmitError(dateValidation);
      return;
    }

    const submitData = {
      ...data,
      school_id: Number(data.school_id),
      name: data.name.trim(),
      description: data.description?.trim() || null,
      start_date: dayjs(data.start_date).format("YYYY-MM-DD"),
      end_date: dayjs(data.end_date).format("YYYY-MM-DD"),
    };

    try {
      if (isEditMode && initialData) {
        await updateExam(initialData.id, submitData);
        enqueueSnackbar("تم تحديث دورة الامتحان بنجاح", { 
          variant: "success",
          action: (key) => (
            <Button size="sm" onClick={() => {/* View exam details */}}>
              عرض
            </Button>
          )
        });
      } else {
        const newExam = await createExam(submitData);
        enqueueSnackbar("تم إضافة دورة الامتحان بنجاح", { 
          variant: "success",
          action: (key) => (
            <Button size="sm" onClick={() => {/* View exam details */}}>
              عرض
            </Button>
          )
        });
      }
      
      setHasUnsavedChanges(false);
      onSuccess();
      
    } catch (error: unknown) {
      console.error("Exam Form submission error:", error);
      
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
        setFormSubmitError(
          `فشل الحفظ: ${Object.values(backendErrors).flat().join(". ")}`
        );
      } else if (status === 422) {
        setFormSubmitError("البيانات المدخلة غير صحيحة. يرجى المراجعة والمحاولة مرة أخرى.");
      } else if (status === 403) {
        setFormSubmitError("ليس لديك صلاحية للقيام بهذا الإجراء.");
      } else if (status === 500) {
        setFormSubmitError("خطأ في الخادم. يرجى المحاولة لاحقاً.");
      } else {
        setFormSubmitError(
          typedError.response?.data?.message || 
          typedError.message || 
          "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
        );
      }
    }
  };

  // Handle dialog close with unsaved changes warning
  const handleDialogClose = (shouldClose: boolean) => {
    if (shouldClose && hasUnsavedChanges) {
      const confirm = window.confirm(
        "لديك تغييرات غير محفوظة. هل أنت متأكد من الإغلاق؟"
      );
      if (!confirm) return;
    }
    
    setHasUnsavedChanges(false);
    onOpenChange(shouldClose);
  };

  const isLoading = examLoading || schoolsLoading || settingsLoading;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose} modal>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <span>تعديل دورة الامتحان</span>
                {initialData?.name && (
                  <span className="text-sm text-muted-foreground">
                    ({initialData.name})
                  </span>
                )}
              </>
            ) : (
              "إضافة دورة امتحان جديدة"
            )}
          </DialogTitle>
          <DialogDescription className="text-right">
            {isEditMode 
              ? "قم بتعديل تفاصيل دورة الامتحان حسب الحاجة."
              : "أدخل تفاصيل دورة الامتحان المطلوبة. جميع الحقول المطلوبة مميزة بـ *"
            }
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

            {/* School Selection */}
            <div className="space-y-2">
              <Label htmlFor="school_id_exam" className="text-sm font-medium">
                المدرسة <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="school_id"
                control={control}
                rules={VALIDATION_RULES.school_id}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) => {
                      field.onChange(val ? Number(val) : 0);
                      trigger('school_id');
                    }}
                    disabled={isEditMode || isLoading}
                    required
                  >
                    <SelectTrigger
                      id="school_id_exam"
                      className={cn(
                        "h-11",
                        errors.school_id && "border-destructive focus:border-destructive"
                      )}
                    >
                      <SelectValue
                        placeholder={
                          schoolsLoading
                            ? "جاري تحميل المدارس..."
                            : "اختر مدرسة..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.length === 0 ? (
                        <SelectItem value="" disabled>
                          <em>لا توجد مدارس متاحة</em>
                        </SelectItem>
                      ) : (
                        schools.map((school) => (
                          <SelectItem key={school.id} value={String(school.id)}>
                            <div className="flex items-center gap-2">
                              <span>{school.name}</span>
                              {school.id === defaultActiveSchoolId && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.school_id && (
                <p className="text-xs text-destructive mt-1">
                  {errors.school_id.message}
                </p>
              )}
              {isEditMode && (
                <p className="text-xs text-muted-foreground">
                  لا يمكن تغيير المدرسة في وضع التعديل
                </p>
              )}
            </div>

            {/* Exam Name */}
            <div className="space-y-2">
              <Label htmlFor="name_exam" className="text-sm font-medium">
                اسم الدورة <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="name"
                control={control}
                rules={VALIDATION_RULES.name}
                render={({ field }) => (
                  <Input
                    id="name_exam"
                    placeholder="مثال: امتحانات نصف الفصل الأول 2024"
                    {...field}
                    className={cn(
                      "h-11",
                      errors.name && "border-destructive focus:border-destructive"
                    )}
                    onChange={(e) => {
                      field.onChange(e);
                      trigger('name');
                    }}
                  />
                )}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                اختر اسماً وصفياً وواضحاً لدورة الامتحان
              </p>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start_date_exam" className="text-sm font-medium">
                  تاريخ البداية <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="start_date"
                  control={control}
                  rules={{ 
                    required: "تاريخ البداية مطلوب",
                    validate: (value) => {
                      const endDate = watch('end_date');
                      return validateDateRange(value, endDate);
                    }
                  }}
                  render={({ field }) => (
                    <Popover 
                      open={isDatePickerOpen.start} 
                      onOpenChange={(open) => setIsDatePickerOpen(prev => ({ ...prev, start: open }))}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal h-11",
                            !field.value && "text-muted-foreground",
                            errors.start_date && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {field.value ? (
                            dayjs(field.value).format("DD / MM / YYYY")
                          ) : (
                            <span>اختر تاريخ البداية</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? dayjs(field.value).toDate() : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const formattedDate = dayjs(date).format("YYYY-MM-DD");
                              field.onChange(formattedDate);
                              trigger(['start_date', 'end_date']);
                              setIsDatePickerOpen(prev => ({ ...prev, start: false }));
                            }
                          }}
                          initialFocus
                          dir="rtl"
                          locale={require('date-fns/locale/ar')}
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.start_date && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end_date_exam" className="text-sm font-medium">
                  تاريخ النهاية <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="end_date"
                  control={control}
                  rules={{
                    required: "تاريخ النهاية مطلوب",
                    validate: (value) => {
                      const startDate = watch('start_date');
                      return validateDateRange(startDate, value);
                    }
                  }}
                  render={({ field }) => (
                    <Popover 
                      open={isDatePickerOpen.end} 
                      onOpenChange={(open) => setIsDatePickerOpen(prev => ({ ...prev, end: open }))}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal h-11",
                            !field.value && "text-muted-foreground",
                            errors.end_date && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {field.value ? (
                            dayjs(field.value).format("DD / MM / YYYY")
                          ) : (
                            <span>اختر تاريخ النهاية</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? dayjs(field.value).toDate() : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const formattedDate = dayjs(date).format("YYYY-MM-DD");
                              field.onChange(formattedDate);
                              trigger(['start_date', 'end_date']);
                              setIsDatePickerOpen(prev => ({ ...prev, end: false }));
                            }
                          }}
                          initialFocus
                          dir="rtl"
                          locale={require('date-fns/locale/ar')}
                          className="rounded-md border"
                          disabled={(date) => {
                            const startDate = watch('start_date');
                            return startDate ? dayjs(date).isBefore(dayjs(startDate), 'day') : false;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.end_date && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description_exam" className="text-sm font-medium">
                الوصف (اختياري)
              </Label>
              <Controller
                name="description"
                control={control}
                rules={VALIDATION_RULES.description}
                render={({ field }) => (
                  <Textarea
                    id="description_exam"
                    placeholder="أي تفاصيل إضافية عن دورة الامتحان..."
                    {...field}
                    value={field.value ?? ""}
                    className={cn(
                      "min-h-[100px] resize-none",
                      errors.description && "border-destructive focus:border-destructive"
                    )}
                    onChange={(e) => {
                      field.onChange(e);
                      trigger('description');
                    }}
                  />
                )}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {watch('description')?.length || 0} / 1000 حرف
              </p>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="text-xs text-amber-600">
                    • تغييرات غير محفوظة
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isSubmitting}
                    onClick={() => handleDialogClose(false)}
                  >
                    إلغاء
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isLoading || !isValid}
                  className="min-w-[120px]"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "حفظ التعديلات" : "إضافة دورة"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamFormDialog;
