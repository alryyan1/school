// src/components/exams/ExamScheduleFormDialog.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/ar";
dayjs.locale("ar");

import { ExamSchedule, ExamScheduleFormData } from "@/types/examSchedule"; // Adjust path
import { useExamScheduleStore } from "@/stores/examScheduleStore"; // Adjust path
import { useSubjectStore } from "@/stores/subjectStore"; // Adjust path
import { useClassroomStore } from "@/stores/classroomStore"; // Adjust path
import { useUserStore } from "@/stores/userStore"; // Adjust path
import { useSettingsStore } from "@/stores/settingsStore"; // Adjust path
import { SchoolApi } from "@/api/schoolApi"; // Adjust path
import { GradeLevel } from "@/types/gradeLevel"; // Adjust path
import { useSnackbar } from "notistack";

interface ExamScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void; // Callback to refetch list on success
  examId: number | null; // ID of the parent Exam period
  schoolId: number | null; // School ID from parent Exam, crucial for fetching context data
  // For Edit mode
  initialData?: ExamSchedule | null;
  // For context if editing and parent exam details are available
  parentExamStartDate?: string | null;
  parentExamEndDate?: string | null;
}

// Form data type for this dialog (omits exam_id as it's a prop)
type DialogFormData = {
  subject_id: number;
  grade_level_id: number;
  classroom_id: number | null;
  teacher_id: number | null;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: string;
  pass_marks: string | null;
};

const ExamScheduleFormDialog: React.FC<ExamScheduleFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  examId,
  schoolId,
  initialData,
  parentExamStartDate,
  parentExamEndDate,
}) => {
  const isEditMode = !!initialData;
  const { createSchedule, updateSchedule } = useExamScheduleStore();
  const { enqueueSnackbar } = useSnackbar();
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

  // Data for dropdowns
  const {
    gradeSpecificSubjects,
    fetchSubjectsForGrade,
    loadingGradeSubjects,
    clearGradeSpecificSubjects,
  } = useSubjectStore();
  const [schoolSpecificGradeLevels, setSchoolSpecificGradeLevels] = useState<
    GradeLevel[]
  >([]);
  const [loadingSchoolGrades, setLoadingSchoolGrades] = useState(false);
  const {
    classrooms,
    fetchClassrooms: fetchClassroomsByGradeAndSchool,
    loading: classroomsLoading,
    clearClassrooms,
  } = useClassroomStore();
  const {
    users: teachers,
    fetchUsers: fetchAllTeachers,
    loading: teachersLoading,
  } = useUserStore();
  const { activeAcademicYearId } = useSettingsStore.getState(); // Get current active year

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DialogFormData>({
    defaultValues: {
      subject_id: 0,
      grade_level_id: 0,
      classroom_id: null,
      teacher_id: null,
      exam_date: parentExamStartDate || dayjs().format("YYYY-MM-DD"), // Default to parent exam start or today
      start_time: "09:00",
      end_time: "11:00",
      max_marks: "100",
      pass_marks: "50",
    },
  });

  const selectedGradeId = watch("grade_level_id");

  // --- Fetch Data for Dropdowns ---
  const fetchSchoolGrades = useCallback(
    async (currentSchoolId: number) => {
      setLoadingSchoolGrades(true);
      try {
        const response = await SchoolApi.getAssignedGradeLevels(
          currentSchoolId
        );
        setSchoolSpecificGradeLevels(
          response.data.data?.sort((a, b) => a.name.localeCompare(b.name)) ?? []
        );
      } catch (error) {
        console.error("Failed to fetch school grades:", error);
        enqueueSnackbar("فشل تحميل مراحل المدرسة", { variant: "error" });
        setSchoolSpecificGradeLevels([]);
      } finally {
        setLoadingSchoolGrades(false);
      }
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    if (open) {
      if (schoolId) fetchSchoolGrades(schoolId); // Fetch grades for the exam's school
      fetchAllTeachers(1, { role: "teacher" }); // Fetch all teachers for invigilator
    } else {
      // Clear dependent dropdown data when dialog closes
      clearGradeSpecificSubjects();
      clearClassrooms();
    }
  }, [
    open,
    schoolId,
    fetchSchoolGrades,
    fetchAllTeachers,
    clearGradeSpecificSubjects,
    clearClassrooms,
  ]);

      // Fetch subjects for the selected grade, school, and active academic year
    useEffect(() => {
      if (open && selectedGradeId && schoolId && activeAcademicYearId) {
        fetchSubjectsForGrade({
        school_id: schoolId,
        academic_year_id: activeAcademicYearId,
        grade_level_id: Number(selectedGradeId),
      });
    } else if (open) {
      // Clear if prerequisites change
      clearGradeSpecificSubjects();
    }
  }, [
    open,
    selectedGradeId,
    schoolId,
    activeAcademicYearId,
    fetchSubjectsForGrade,
    clearGradeSpecificSubjects,
  ]);

  // Fetch classrooms when selected grade for this school changes
  useEffect(() => {
    if (open && selectedGradeId && schoolId && activeAcademicYearId) {
      fetchClassroomsByGradeAndSchool({
        school_id: schoolId,
        grade_level_id: Number(selectedGradeId),
        active_academic_year_id: activeAcademicYearId, // For year-specific classrooms
      });
    } else if (open) {
      // Clear if prerequisites change
      clearClassrooms();
    }
  }, [
    open,
    selectedGradeId,
    schoolId,
    activeAcademicYearId,
    fetchClassroomsByGradeAndSchool,
    clearClassrooms,
  ]);

  // Form Reset Logic
  useEffect(() => {
    if (open && examId) {
      setFormSubmitError(null);
      const defaults: DialogFormData = {
        subject_id: 0,
        grade_level_id: 0,
        classroom_id: null,
        teacher_id: null,
        exam_date: parentExamStartDate || dayjs().format("YYYY-MM-DD"),
        start_time: "09:00",
        end_time: "11:00",
        max_marks: "100",
        pass_marks: "50",
      };

      if (isEditMode && initialData) {
        // If editing, specific grades for the school might have been fetched already
        // or need to be fetched based on initialData.exam.school_id
        if (initialData.exam?.school_id && initialData.grade_level_id) {
          // Fetch data needed for edit mode prefill
          fetchSchoolGrades(initialData.exam.school_id);
          if (activeAcademicYearId) {
            fetchSubjectsForGrade({
              school_id: initialData.exam.school_id,
              academic_year_id: activeAcademicYearId,
              grade_level_id: initialData.grade_level_id,
            });
            fetchClassroomsByGradeAndSchool({
              school_id: initialData.exam.school_id,
              grade_level_id: initialData.grade_level_id,
              active_academic_year_id: activeAcademicYearId,
            });
          }
        }
        Object.assign(defaults, {
          subject_id: Number(initialData.subject_id),
          grade_level_id: Number(initialData.grade_level_id),
          classroom_id: initialData.classroom_id
            ? Number(initialData.classroom_id)
            : null,
          teacher_id: initialData.teacher_id
            ? Number(initialData.teacher_id)
            : null,
          exam_date: dayjs(initialData.exam_date).format("YYYY-MM-DD"),
          start_time: initialData.start_time?.substring(0, 5) || "09:00",
          end_time: initialData.end_time?.substring(0, 5) || "11:00",
          max_marks: String(initialData.max_marks ?? "100"),
          pass_marks:
            initialData.pass_marks != null
              ? String(initialData.pass_marks)
              : "50",
        });
      } else if (schoolId) {
        // Create mode, ensure school grades are fetched if schoolId is present
        fetchSchoolGrades(schoolId);
      }
      reset(defaults);
    }
  }, [
    initialData,
    open,
    examId,
    schoolId,
    reset,
    isEditMode,
    fetchSchoolGrades,
    fetchSubjectsForGrade,
    fetchClassroomsByGradeAndSchool,
    activeAcademicYearId,
    parentExamStartDate,
  ]);

  const onSubmit = async (data: DialogFormData) => {
    if (!examId) {
      setFormSubmitError("معرف دورة الامتحان الرئيسية غير متوفر.");
      return;
    }
    setFormSubmitError(null);

    const submitData: ExamScheduleFormData = {
      ...data,
      exam_id: Number(examId),
      subject_id: Number(data.subject_id),
      grade_level_id: Number(data.grade_level_id),
      classroom_id: data.classroom_id ? Number(data.classroom_id) : null,
      teacher_id: data.teacher_id ? Number(data.teacher_id) : null,
      max_marks: String(data.max_marks),
      pass_marks: data.pass_marks != null ? String(data.pass_marks) : null,
      start_time: data.start_time.includes(":")
        ? `${data.start_time}:00`
        : "00:00:00",
      end_time: data.end_time.includes(":")
        ? `${data.end_time}:00`
        : "00:00:00",
    };

    try {
      if (isEditMode && initialData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { exam_id, subject_id, grade_level_id, ...updatePayload } =
          submitData; // Usually these aren't changed in an update
        await updateSchedule(initialData.id, updatePayload);
        enqueueSnackbar("تم تحديث موعد الامتحان بنجاح", { variant: "success" });
      } else {
        await createSchedule(submitData);
        enqueueSnackbar("تم إضافة موعد الامتحان بنجاح", { variant: "success" });
      }
      onSuccess(); // Close dialog and trigger refetch in parent
    } catch (error: unknown) {
      console.error("Exam Schedule Form error:", error);
      
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
        setFormSubmitError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
      } else {
        setFormSubmitError(typedError.message || 'حدث خطأ غير متوقع.');
      }
    }
  };

  const teacherOptions = useMemo(
    () =>
      teachers
        .filter((u) => u.role === "teacher" || u.role === "admin")
        .sort((a, b) => a.name.localeCompare(b.name)),
    [teachers]
  );
  const subjectOptionsToDisplay = useMemo(() => {
    // Logic to ensure initialData.subject is shown in edit mode, even if not in current gradeSpecificSubjects
    if (
      isEditMode &&
      initialData?.subject &&
      !gradeSpecificSubjects.find((s) => s.id === initialData.subject_id)
    ) {
      if (gradeSpecificSubjects.length > 0)
        return [initialData.subject, ...gradeSpecificSubjects].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      return [initialData.subject];
    }
          return gradeSpecificSubjects.sort((a, b) => a.name.localeCompare(b.name));
    }, [gradeSpecificSubjects, isEditMode, initialData]);

    // Use schoolSpecificGradeLevels for the grade dropdown
  const gradeLevelOptions = schoolSpecificGradeLevels;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="sm:max-w-lg md:max-w-xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "تعديل موعد امتحان" : "إضافة موعد امتحان جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `تعديل موعد لامتحان "${initialData?.subject?.name}" للمرحلة "${initialData?.grade_level?.name}"`
              : "إضافة موعد جديد لجدول الامتحانات."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
                     <ScrollArea className="max-h-[65vh] p-1 pr-3">
            <div className="grid gap-4 py-4">
              {formSubmitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formSubmitError}</AlertDescription>
                </Alert>
              )}

              {/* Grade Level (uses school-specific grades) */}
              <div className="space-y-1.5">
                <Label htmlFor="grade_level_id_schedule_form">
                  المرحلة الدراسية *
                </Label>
                <Controller
                  name="grade_level_id"
                  control={control}
                  rules={{ required: "المرحلة مطلوبة" }}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) => {
                        field.onChange(val ? Number(val) : 0);
                        setValue("subject_id", 0);
                        setValue("classroom_id", null);
                      }}
                      disabled={isEditMode || loadingSchoolGrades}
                      required
                    >
                      <SelectTrigger
                        id="grade_level_id_schedule_form"
                        className={cn(
                          errors.grade_level_id && "border-destructive"
                        )}
                      >
                        <SelectValue
                          placeholder={
                            loadingSchoolGrades
                              ? "تحميل المراحل..."
                              : "اختر مرحلة..."
                          }
                        />
                      </SelectTrigger>
                                              <SelectContent>
                                                     <SelectItem value=" " disabled>
                              اختر مرحلة...
                            </SelectItem>
                        {gradeLevelOptions.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.name}
                          </SelectItem>
                        ))}
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

              {/* Subject (dynamically filtered) */}
              <div className="space-y-1.5">
                <Label htmlFor="subject_id_schedule_form">المادة *</Label>
                <Controller
                  name="subject_id"
                  control={control}
                  rules={{ required: "المادة مطلوبة" }}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) =>
                        field.onChange(val ? Number(val) : 0)
                      }
                      disabled={
                        isEditMode || loadingGradeSubjects || !selectedGradeId
                      }
                      required
                    >
                      <SelectTrigger
                        id="subject_id_schedule_form"
                        className={cn(
                          errors.subject_id && "border-destructive"
                        )}
                      >
                        <SelectValue
                          placeholder={
                            loadingGradeSubjects
                              ? "تحميل المواد..."
                              : !selectedGradeId
                              ? "اختر مرحلة أولاً"
                              : "اختر مادة..."
                          }
                        />
                      </SelectTrigger>
                                              <SelectContent>
                                                     <SelectItem value=" " disabled>
                              اختر مادة...
                            </SelectItem>
                        {subjectOptionsToDisplay.length === 0 &&
                          !loadingGradeSubjects && (
                            <SelectItem value=" " disabled>
                              <em>
                                (لا مواد لهذه المرحلة أو لم يتم تحديد مرحلة)
                              </em>
                            </SelectItem>
                          )}
                        {subjectOptionsToDisplay.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name} ({s.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subject_id && (
                  <p className="text-xs text-destructive">
                    {errors.subject_id.message}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="exam_date_schedule_form">
                  تاريخ الامتحان *
                </Label>
                <Controller
                  name="exam_date"
                  control={control}
                  rules={{ required: "تاريخ الامتحان مطلوب" }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !field.value && "text-muted-foreground",
                            errors.exam_date && "border-destructive"
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
                          // Disable dates outside of parent exam range
                          fromDate={
                            parentExamStartDate
                              ? dayjs(parentExamStartDate).toDate()
                              : undefined
                          }
                          toDate={
                            parentExamEndDate
                              ? dayjs(parentExamEndDate).toDate()
                              : undefined
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.exam_date && (
                  <p className="text-xs text-destructive">
                    {errors.exam_date.message}
                  </p>
                )}
              </div>

              {/* Start Time & End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start_time_schedule_form">وقت البدء *</Label>
                  <Controller
                    name="start_time"
                    control={control}
                    rules={{
                      required: "وقت البدء مطلوب",
                      pattern: {
                        value: /^([01]\d|2[0-3]):([0-5]\d)$/,
                        message: "صيغة الوقت HH:MM",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        id="start_time_schedule_form"
                        type="time"
                        {...field}
                        className={cn(
                          errors.start_time && "border-destructive"
                        )}
                      />
                    )}
                  />
                  {errors.start_time && (
                    <p className="text-xs text-destructive">
                      {errors.start_time.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end_time_schedule_form">وقت الانتهاء *</Label>
                  <Controller
                    name="end_time"
                    control={control}
                    rules={{
                      required: "وقت الانتهاء مطلوب",
                      pattern: {
                        value: /^([01]\d|2[0-3]):([0-5]\d)$/,
                        message: "صيغة الوقت HH:MM",
                      },
                      validate: (value) =>
                        value > watch("start_time") ||
                        "الانتهاء يجب أن يكون بعد البدء",
                    }}
                    render={({ field }) => (
                      <Input
                        id="end_time_schedule_form"
                        type="time"
                        {...field}
                        className={cn(errors.end_time && "border-destructive")}
                      />
                    )}
                  />
                  {errors.end_time && (
                    <p className="text-xs text-destructive">
                      {errors.end_time.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Max Marks & Pass Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="max_marks_schedule_form">
                    العلامة العظمى *
                  </Label>
                  <Controller
                    name="max_marks"
                    control={control}
                    rules={{
                      required: "العلامة العظمى مطلوبة",
                      min: { value: 1, message: ">0" },
                    }}
                    render={({ field }) => (
                      <Input
                        id="max_marks_schedule_form"
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        min="1"
                        step="0.5"
                        className={cn(errors.max_marks && "border-destructive")}
                      />
                    )}
                  />
                  {errors.max_marks && (
                    <p className="text-xs text-destructive">
                      {errors.max_marks.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pass_marks_schedule_form">
                    علامة النجاح (اختياري)
                  </Label>
                  <Controller
                    name="pass_marks"
                    control={control}
                    rules={{
                      validate: (value) =>
                        value == null ||
                        value === "" ||
                        parseFloat(String(value)) <=
                          parseFloat(String(watch("max_marks"))) ||
                        "يجب أن تكون أصغر أو تساوي العظمى",
                      min: { value: 0, message: ">=0" },
                    }}
                    render={({ field }) => (
                      <Input
                        id="pass_marks_schedule_form"
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        min="0"
                        step="0.5"
                        className={cn(
                          errors.pass_marks && "border-destructive"
                        )}
                      />
                    )}
                  />
                  {errors.pass_marks && (
                    <p className="text-xs text-destructive">
                      {errors.pass_marks.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Classroom (filtered by selected grade) & Teacher (Invigilator) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="classroom_id_schedule_form">
                    الفصل (اختياري)
                  </Label>
                  <Controller
                    name="classroom_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) =>
                          field.onChange(val ? Number(val) : null)
                        }
                        disabled={!selectedGradeId || classroomsLoading}
                      >
                        <SelectTrigger id="classroom_id_schedule_form">
                          <SelectValue
                            placeholder={
                              classroomsLoading
                                ? "تحميل الفصول..."
                                : "اختر فصلاً..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" ">
                            <em>(غير محدد)</em>
                          </SelectItem>
                          {classrooms.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="teacher_id_schedule_form">
                    المراقب (اختياري)
                  </Label>
                  <Controller
                    name="teacher_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) =>
                          field.onChange(val ? Number(val) : null)
                        }
                        disabled={teachersLoading}
                      >
                        <SelectTrigger id="teacher_id_schedule_form">
                          <SelectValue
                            placeholder={
                              teachersLoading
                                ? "تحميل المدرسين..."
                                : "اختر مراقباً..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" ">
                            <em>(غير محدد)</em>
                          </SelectItem>
                          {teacherOptions.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 mt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                إلغاء
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                loadingGradeSubjects ||
                loadingSchoolGrades ||
                classroomsLoading ||
                teachersLoading
              }
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? "حفظ التعديلات" : "إضافة موعد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamScheduleFormDialog;
