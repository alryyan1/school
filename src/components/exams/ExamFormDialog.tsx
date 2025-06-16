// src/components/exams/ExamFormDialog.tsx
import React, { useEffect, useState } from "react";
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
import { Loader2, AlertCircle, CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/ar";
dayjs.locale("ar");

import { Exam, ExamFormData } from "@/types/exam"; // Adjust path
import { useExamStore } from "@/stores/examStore"; // Adjust path
import { useSchoolStore } from "@/stores/schoolStore"; // Adjust path
import { useSettingsStore } from "@/stores/settingsStore"; // For default school
import { useSnackbar } from "notistack";

interface ExamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: Exam | null;
}

const ExamFormDialog: React.FC<ExamFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}) => {
  const isEditMode = !!initialData;
  const { createExam, updateExam } = useExamStore();
  const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
  const { activeSchoolId: defaultActiveSchoolId } = useSettingsStore.getState();
  const { enqueueSnackbar } = useSnackbar();
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormData>({
    // Default values set in useEffect
  });

  useEffect(() => {
    if (open && schools.length === 0) {
      fetchSchools();
    }
  }, [open, schools.length, fetchSchools]);

  useEffect(() => {
    if (open) {
      setFormSubmitError(null);
      const defaultSchool = initialData?.school_id
        ? initialData.school_id
        : defaultActiveSchoolId || 0;
      reset({
        name: "",
        school_id: defaultSchool,
        start_date: dayjs().format("YYYY-MM-DD"),
        end_date: dayjs().add(7, "day").format("YYYY-MM-DD"),
        description: "",
        ...(initialData
          ? {
              ...initialData,
              start_date: dayjs(initialData.start_date).format("YYYY-MM-DD"),
              end_date: dayjs(initialData.end_date).format("YYYY-MM-DD"),
              description: initialData.description || "",
            }
          : {}),
      });
    }
  }, [initialData, open, reset, defaultActiveSchoolId]);

  const onSubmit = async (data: ExamFormData) => {
    setFormSubmitError(null);
    const submitData = {
      ...data,
      school_id: Number(data.school_id), // Convert to number for API
    };

    try {
      if (isEditMode && initialData) {
        await updateExam(initialData.id, submitData);
        enqueueSnackbar("تم تحديث دورة الامتحان بنجاح", { variant: "success" });
      } else {
        await createExam(submitData);
        enqueueSnackbar("تم إضافة دورة الامتحان بنجاح", { variant: "success" });
      }
      onSuccess();
    } catch (error: unknown) {
      console.error("Exam Form submission error:", error);
      
      // Type-safe error handling
      interface ErrorResponse {
        response?: {
          data?: {
            errors?: Record<string, string[]>;
          };
        };
        message?: string;
      }
      
      const typedError = error as ErrorResponse;
      const backendErrors = typedError.response?.data?.errors;
      
      if (backendErrors) {
        setFormSubmitError(
          `فشل الحفظ: ${Object.values(backendErrors).flat().join(". ")}`
        );
      } else {
        setFormSubmitError(typedError.message || "حدث خطأ غير متوقع.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? `تعديل دورة الامتحان: ${initialData?.name}`
              : "إضافة دورة امتحان جديدة"}
          </DialogTitle>
          <DialogDescription>
            أدخل تفاصيل دورة الامتحان المطلوبة.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {formSubmitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formSubmitError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="school_id_exam">المدرسة *</Label>
              <Controller
                name="school_id"
                control={control}
                rules={{ required: "المدرسة مطلوبة" }}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) =>
                      field.onChange(val ? Number(val) : 0)
                    }
                    disabled={isEditMode || schoolsLoading}
                    required
                  >
                    <SelectTrigger
                      id="school_id_exam"
                      className={cn(errors.school_id && "border-destructive")}
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
                        <SelectItem value=" " disabled>
                          <em>اختر مدرسة...</em>
                        </SelectItem>
                      {schools.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.school_id && (
                <p className="text-xs text-destructive mt-1">
                  {errors.school_id.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_exam">اسم الدورة *</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "اسم الدورة مطلوب" }}
                render={({ field }) => (
                  <Input
                    id="name_exam"
                    placeholder="مثال: امتحانات نصف الفصل 2024"
                    {...field}
                    className={cn(errors.name && "border-destructive")}
                  />
                )}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date_exam">تاريخ البداية *</Label>
                <Controller
                  name="start_date"
                  control={control}
                  rules={{ required: "تاريخ البداية مطلوب" }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !field.value && "text-muted-foreground",
                            errors.start_date && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {field.value ? (
                            dayjs(field.value).format("DD / MM / YYYY")
                          ) : (
                            <span>اختر تاريخ</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            field.value
                              ? dayjs(field.value).toDate()
                              : undefined
                          }
                          onSelect={(d) =>
                            field.onChange(
                              d ? dayjs(d).format("YYYY-MM-DD") : null
                            )
                          }
                          initialFocus
                          dir="rtl"
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
              <div className="space-y-2">
                <Label htmlFor="end_date_exam">تاريخ النهاية *</Label>
                <Controller
                  name="end_date"
                  control={control}
                  rules={{
                    required: "تاريخ النهاية مطلوب",
                    validate: (value) =>
                      dayjs(value).isAfter(dayjs(watch("start_date")), "day") ||
                      dayjs(value).isSame(dayjs(watch("start_date")), "day") ||
                      "تاريخ النهاية يجب أن يكون بعد أو نفس تاريخ البداية",
                  }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !field.value && "text-muted-foreground",
                            errors.end_date && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {field.value ? (
                            dayjs(field.value).format("DD / MM / YYYY")
                          ) : (
                            <span>اختر تاريخ</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            field.value
                              ? dayjs(field.value).toDate()
                              : undefined
                          }
                          onSelect={(d) =>
                            field.onChange(
                              d ? dayjs(d).format("YYYY-MM-DD") : null
                            )
                          }
                          initialFocus
                          dir="rtl"
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
            <div className="space-y-2">
              <Label htmlFor="description_exam">الوصف (اختياري)</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="description_exam"
                    placeholder="أي تفاصيل إضافية..."
                    {...field}
                    value={field.value ?? ""}
                    className="min-h-[80px]"
                  />
                )}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                إلغاء
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || schoolsLoading}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? "حفظ التعديلات" : "إضافة دورة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamFormDialog;