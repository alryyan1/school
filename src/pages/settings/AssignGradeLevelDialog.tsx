// src/components/settings/AssignGradeLevelDialog.tsx
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // shadcn Dialog
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // shadcn Select
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react"; // Icons

import { GradeLevel, AssignGradeLevelFormData } from "@/types/gradeLevel"; // Adjust path
import { SchoolApi } from "@/api/schoolApi"; // Adjust path
import { useSnackbar } from "notistack";

interface AssignGradeLevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void; // For shadcn Dialog control
  onSuccess: () => void; // Callback to refetch list on success
  schoolId: number | null; // School to assign to
  availableGrades: GradeLevel[]; // Grades NOT currently assigned to this school
}

const AssignGradeLevelDialog: React.FC<AssignGradeLevelDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  schoolId,
  availableGrades,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignGradeLevelFormData>({
    defaultValues: { grade_level_id: "", basic_fees: "0" }, // Use string for input, number for type
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormError(null);
      reset({ grade_level_id: "", basic_fees: "0" });
    }
  }, [open, reset]);

  const onSubmit = async (data: AssignGradeLevelFormData) => {
    if (!schoolId) {
      setFormError("معرف المدرسة غير متوفر.");
      return;
    }
    setFormError(null);

    try {
      await SchoolApi.attachGradeLevels(
        schoolId,
        Number(data.grade_level_id),
        Number(data.basic_fees) || 0
      );
      enqueueSnackbar("تم تعيين المرحلة الدراسية بنجاح", {
        variant: "success",
      });
      onSuccess(); // Close dialog and trigger refetch in parent
    } catch (error: unknown) {
      console.error("Assign GradeLevel Error:", error);
      const errorObj = error as { response?: { data?: { errors?: Record<string, string[]> } }; message?: string };
      const backendErrors = errorObj.response?.data?.errors;
      if (backendErrors) {
        // Handle specific error format from backend for array of assignments
        let errorMsg = "فشل الحفظ: ";
        if (backendErrors.assignments && backendErrors.assignments[0]) {
          errorMsg += Object.values(backendErrors.assignments[0])
            .flat()
            .join(". ");
        } else {
          errorMsg += Object.values(backendErrors).flat().join(". ");
        }
        setFormError(errorMsg);
      } else {
        setFormError(errorObj.message || "حدث خطأ غير متوقع.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعيين مرحلة دراسية جديدة للمدرسة</DialogTitle>
          <DialogDescription>
            اختر المرحلة الدراسية من القائمة المتاحة وحدد الرسوم الأساسية لها في
            هذه المدرسة.
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
              <Label htmlFor="grade_level_id_assign">المرحلة الدراسية *</Label>
              <Controller
                name="grade_level_id"
                control={control}
                rules={{ required: "الرجاء اختيار المرحلة الدراسية" }}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) =>
                      field.onChange(value ? Number(value) : "")
                    }
                    required
                  >
                    <SelectTrigger
                      id="grade_level_id_assign"
                      className={cn(
                        errors.grade_level_id && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="اختر مرحلة..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGrades.length === 0 && (
                        <SelectItem value=" " disabled>
                          <em>(لا توجد مراحل أخرى متاحة للتعيين)</em>
                        </SelectItem>
                      )}
                      {availableGrades.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.name} ({g.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.grade_level_id && (
                <p className="text-xs text-destructive mt-1">
                  {errors.grade_level_id.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="basic_fees_assign">الرسوم الأساسية *</Label>
              <Controller
                name="basic_fees"
                control={control}
                rules={{
                  required: "الرسوم الأساسية مطلوبة",
                  min: { value: 0, message: "الرسوم لا يمكن أن تكون سالبة" },
                }}
                render={({ field }) => (
                  <Input
                    id="basic_fees_assign"
                    type="number"
                    {...field}
                    value={field.value ?? ""} // Ensure controlled input for numbers
                    onChange={(e) => field.onChange(e.target.value)} // RHF handles conversion for number type if schema validation is used
                    placeholder="مثال: 5000"
                    min="0"
                    step="1"
                    className={cn(errors.basic_fees && "border-destructive")}
                  />
                )}
              />
              {errors.basic_fees && (
                <p className="text-xs text-destructive mt-1">
                  {errors.basic_fees.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                إلغاء
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || availableGrades.length === 0}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              تعيين وحفظ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignGradeLevelDialog;
