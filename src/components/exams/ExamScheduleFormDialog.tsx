// src/components/exams/ExamScheduleFormDialog.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers"; // Add TimePicker
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/ar";
import dayjs from "dayjs";
import { ExamSchedule, ExamScheduleFormData } from "@/types/examSchedule";
import { useExamScheduleStore } from "@/stores/examScheduleStore";
// Stores for dropdowns
import { useSubjectStore } from "@/stores/subjectStore";
import { useGradeLevelStore } from "@/stores/gradeLevelStore";
import { useClassroomStore } from "@/stores/classroomStore";
import { useTeacherStore } from "@/stores/teacherStore";
import { useSnackbar } from "notistack";
import { useSettingsStore } from "@/stores/settingsStore";
import { SchoolApi } from "@/api/schoolApi";
import { useAcademicYearSubjectStore } from "@/stores/academicYearSubjectStore";

interface ExamScheduleFormDialogProps {
  open: boolean;
  onClose: (refetch?: boolean) => void;
  examId: number | null; // ID of the parent Exam period
  schoolId: number | null; // School ID from parent Exam
  initialData?: ExamSchedule | null; // For editing
}

const ExamScheduleFormDialog: React.FC<ExamScheduleFormDialogProps> = ({
  open,
  onClose,
  examId,
  schoolId,
  initialData,
}) => {
  const isEditMode = !!initialData;
  const { createSchedule, updateSchedule } = useExamScheduleStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  // const { gradeLevels, fetchGradeLevels } = useGradeLevelStore();
  const { activeSchoolId, activeAcademicYearId } = useSettingsStore();
  // Fetch classrooms filtered by the selected grade level
  const { classrooms, fetchClassrooms: fetchClassroomsByGrade } =
    useClassroomStore();
  const { teachers, fetchTeachers: fetchAllTeachers } = useTeacherStore(); // Fetch all teachers for invigilator
  const { enqueueSnackbar } = useSnackbar();
  const [formError, setFormError] = useState<string | null>(null);
  const [schoolGradeLevels, setSchoolGradeLevels] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExamScheduleFormData>({
    defaultValues: {
      exam_id: examId ?? "",
      subject_id: "",
      grade_level_id: "",
      classroom_id: null,
      teacher_id: null,
      exam_date: dayjs().format("YYYY-MM-DD"),
      start_time: "09:00", // Default start time HH:MM
      end_time: "11:00", // Default end time HH:MM
      max_marks: "100",
      pass_marks: "50",
    },
  });

  const selectedGradeId = watch("grade_level_id"); // Watch grade level to filter classrooms
  const { fetchAssignments, clearAssignments, assignments } =
    useAcademicYearSubjectStore();
  // Fetch necessary dropdown data when dialog opens
  useEffect(() => {
    if (open) {
      fetchSubjects();
      // fetchGradeLevels(); // Fetch all grades initially
      fetchAllTeachers(); // Fetch all teachers
    }
  }, [open, fetchSubjects, fetchAllTeachers]);
  useEffect(() => {
    if (selectedGradeId && activeAcademicYearId) {
      fetchAssignments(activeAcademicYearId, selectedGradeId);
    }
  }, [activeAcademicYearId, selectedGradeId]);
  console.log(assignments, "assigments");
  // Fetch classrooms when selected grade changes
  useEffect(() => {
    if (selectedGradeId && schoolId) {
      fetchClassroomsByGrade({
        grade_level_id: Number(selectedGradeId),
        school_id: schoolId,
      });
    }
  }, [selectedGradeId, schoolId, fetchClassroomsByGrade]);
  const filteredSubjects = useMemo(() => {
   return subjects.filter((s) => {
      const assignmentsIds = assignments.map((a) => a.subject_id);
      return assignmentsIds.includes(s.id);
    });
  }, [subjects, assignments]);
  // Reset form logic
  useEffect(() => {
    if (open && examId) {
      setFormError(null);
      const defaults: Partial<ExamScheduleFormData> = {
        exam_id: examId,
        subject_id: "",
        grade_level_id: "",
        classroom_id: null,
        teacher_id: null,
        exam_date: dayjs().format("YYYY-MM-DD"),
        start_time: "09:00",
        end_time: "11:00",
        max_marks: "100",
        pass_marks: "50",
        ...(initialData
          ? {
              // Pre-fill if editing
              ...initialData,
              // Format data for form controls
              start_time: initialData.start_time.substring(0, 5), // Extract HH:MM
              end_time: initialData.end_time.substring(0, 5), // Extract HH:MM
              max_marks: String(initialData.max_marks),
              pass_marks:
                initialData.pass_marks != null
                  ? String(initialData.pass_marks)
                  : null,
              teacher_id: initialData.teacher_id || null, // Ensure null if not set
              classroom_id: initialData.classroom_id || null, // Ensure null if not set
            }
          : {}),
      };
      reset(defaults);
      // If editing, fetch classrooms for the initial grade
      if (isEditMode && initialData?.grade_level_id && schoolId) {
        fetchClassroomsByGrade({
          grade_level_id: initialData.grade_level_id,
          school_id: schoolId,
        });
      }
    }
  }, [
    initialData,
    open,
    examId,
    schoolId,
    reset,
    isEditMode,
    fetchClassroomsByGrade,
  ]);

  // Form Submit Handler
  const onSubmit = async (data: ExamScheduleFormData) => {
    if (!examId) {
      setFormError("معرف دورة الامتحان غير متوفر.");
      return;
    }
    setFormError(null);
    // Convert marks back to numbers, ensure IDs are numbers, format time
    const submitData = {
      ...data,
      exam_id: Number(examId),
      subject_id: Number(data.subject_id),
      grade_level_id: Number(data.grade_level_id),
      classroom_id: data.classroom_id ? Number(data.classroom_id) : null,
      teacher_id: data.teacher_id ? Number(data.teacher_id) : null,
      max_marks: parseFloat(data.max_marks),
      pass_marks: data.pass_marks ? parseFloat(data.pass_marks) : null,
      // Ensure time includes seconds if backend expects H:i:s
      start_time: data.start_time.includes(":")
        ? `${data.start_time}:00`
        : "00:00:00",
      end_time: data.end_time.includes(":")
        ? `${data.end_time}:00`
        : "00:00:00",
    };

    try {
      if (isEditMode && initialData) {
        // Exclude fields not meant for update if necessary
        const { exam_id, subject_id, grade_level_id, ...updateData } =
          submitData;
        await updateSchedule(initialData.id, updateData);
        enqueueSnackbar("تم تحديث موعد الامتحان بنجاح", { variant: "success" });
      } else {
        await createSchedule(submitData);
        enqueueSnackbar("تم إضافة موعد الامتحان بنجاح", { variant: "success" });
      }
      onClose(true); // Close dialog and trigger refetch on success
    } catch (error: any) {
      console.error("Exam Schedule Form submission error:", error);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setFormError(
          `فشل الحفظ: ${Object.values(backendErrors).flat().join(". ")}`
        );
      } else {
        setFormError(error.message || "حدث خطأ غير متوقع.");
      }
    }
  };
  const fetchSchoolGradeLevelsCallback = useCallback(async () => {
    try {
      const response = await SchoolApi.getAssignedGradeLevels(
        activeSchoolId as number
      );
      console.log(response.data.data, "response");
      setSchoolGradeLevels(response.data.data);
    } catch (error) {
      console.log(error);
      enqueueSnackbar({
        variant: "error",
        message: "فشل في جلب مستويات المدرسه المحدده",
      });
    }
  }, [activeSchoolId]);
  // Filter classrooms based on selected grade level
  const filteredClassrooms = React.useMemo(() => {
    if (!selectedGradeId) return [];
    return classrooms.filter(
      (c) => c.grade_level_id === Number(selectedGradeId)
    );
  }, [classrooms, selectedGradeId]);

  useEffect(() => {
    fetchSchoolGradeLevelsCallback();
  }, []);
  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      {" "}
      {/* Wider dialog */}
      <DialogTitle>
        {isEditMode ? "تعديل موعد امتحان" : "إضافة موعد امتحان جديد"}
      </DialogTitle>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {formError && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setFormError(null)}
              >
                {formError}
              </Alert>
            )}
            <Grid container spacing={2.5} sx={{ pt: 1 }}>
              {/* Row 1: Subject, Grade Level */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="subject_id"
                  control={control}
                  rules={{ required: "المادة مطلوبة" }}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.subject_id}>
                      <InputLabel id="exam-subject-label">المادة *</InputLabel>
                      <Select
                        labelId="exam-subject-label"
                        label="المادة *"
                        {...field}
                        value={field.value || ""}
                        disabled={isEditMode}
                      >
                        <MenuItem value="" disabled>
                          <em>اختر مادة...</em>
                        </MenuItem>
                        {filteredSubjects.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.subject_id && (
                        <FormHelperText>
                          {errors.subject_id.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="grade_level_id"
                  control={control}
                  rules={{ required: "المرحلة مطلوبة" }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      required
                      error={!!errors.grade_level_id}
                    >
                      <InputLabel id="exam-grade-label">
                        المرحلة الدراسية *
                      </InputLabel>
                      <Select
                        labelId="exam-grade-label"
                        label="المرحلة الدراسية *"
                        {...field}
                        value={field.value || ""}
                        disabled={isEditMode}
                      >
                        <MenuItem value="" disabled>
                          <em>اختر مرحلة...</em>
                        </MenuItem>
                        {schoolGradeLevels.map((g) => (
                          <MenuItem key={g.id} value={g.id}>
                            {g.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.grade_level_id && (
                        <FormHelperText>
                          {errors.grade_level_id.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Row 2: Classroom, Teacher (Invigilator) */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="classroom_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.classroom_id}
                      disabled={!selectedGradeId}
                    >
                      <InputLabel id="exam-classroom-label">
                        الفصل (اختياري)
                      </InputLabel>
                      <Select
                        labelId="exam-classroom-label"
                        label="الفصل (اختياري)"
                        {...field}
                        value={field.value || ""}
                      >
                        <MenuItem value="">
                          <em>(غير محدد)</em>
                        </MenuItem>
                        {filteredClassrooms.length === 0 && (
                          <MenuItem disabled>
                            <em>(لا توجد فصول لهذه المرحلة)</em>
                          </MenuItem>
                        )}
                        {filteredClassrooms.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.classroom_id && (
                        <FormHelperText>
                          {errors.classroom_id.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="teacher_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={teachers}
                      getOptionLabel={(option) => option.name}
                      value={teachers.find((t) => t.id === field.value) || null}
                      onChange={(event, newValue) =>
                        field.onChange(newValue ? newValue.id : null)
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="المراقب (اختياري)" />
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      noOptionsText="لا يوجد مدرسون"
                      clearOnBlur
                      handleHomeEndKeys
                    />
                  )}
                />
              </Grid>

              {/* Row 3: Date, Start Time, End Time */}
              <Grid item xs={12} sm={4}>
                <Controller
                  name="exam_date"
                  control={control}
                  rules={{ required: "تاريخ الامتحان مطلوب" }}
                  render={({ field }) => (
                    <DatePicker
                      label="تاريخ الامتحان *"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(d) =>
                        field.onChange(d?.format("YYYY-MM-DD") ?? null)
                      }
                      format="YYYY/MM/DD"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.exam_date,
                          helperText: errors.exam_date?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="start_time"
                  control={control}
                  rules={{ required: "وقت البدء مطلوب" }}
                  render={({ field }) => (
                    // Use TimePicker or basic TextField with validation pattern
                    // <TimePicker label="وقت البدء *" value={field.value ? dayjs(field.value, 'HH:mm:ss') : null} onChange={(t) => field.onChange(t?.format('HH:mm') ?? null)} slotProps={{ textField: { fullWidth: true, required: true, error: !!errors.start_time, helperText: errors.start_time?.message }}} />
                    <TextField
                      {...field}
                      label="وقت البدء (HH:MM)*"
                      placeholder="09:00"
                      fullWidth
                      required
                      error={!!errors.start_time}
                      helperText={errors.start_time?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="end_time"
                  control={control}
                  rules={{
                    required: "وقت الانتهاء مطلوب",
                    validate: (value) =>
                      value > watch("start_time") ||
                      "وقت الانتهاء يجب أن يكون بعد وقت البدء",
                  }}
                  render={({ field }) => (
                    // <TimePicker label="وقت الانتهاء *" value={field.value ? dayjs(field.value, 'HH:mm:ss') : null} onChange={(t) => field.onChange(t?.format('HH:mm') ?? null)} slotProps={{ textField: { fullWidth: true, required: true, error: !!errors.end_time, helperText: errors.end_time?.message }}} />
                    <TextField
                      {...field}
                      label="وقت الانتهاء (HH:MM)*"
                      placeholder="11:00"
                      fullWidth
                      required
                      error={!!errors.end_time}
                      helperText={errors.end_time?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              {/* Row 4: Marks */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="max_marks"
                  control={control}
                  rules={{
                    required: "العلامة العظمى مطلوبة",
                    min: { value: 1, message: "يجب أن تكون أكبر من 0" },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="العلامة العظمى *"
                      type="number"
                      fullWidth
                      required
                      error={!!errors.max_marks}
                      helperText={errors.max_marks?.message}
                      InputProps={{ inputProps: { min: 1, step: "0.5" } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="pass_marks"
                  control={control}
                  rules={{
                    validate: (value) =>
                      value == null ||
                      parseFloat(value) <= parseFloat(watch("max_marks")) ||
                      "علامة النجاح يجب أن تكون أصغر أو تساوي العظمى",
                    min: { value: 0, message: "لا يمكن أن تكون سالبة" },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ""}
                      label="علامة النجاح (اختياري)"
                      type="number"
                      fullWidth
                      error={!!errors.pass_marks}
                      helperText={errors.pass_marks?.message}
                      InputProps={{ inputProps: { min: 0, step: "0.5" } }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => onClose()}
              color="inherit"
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={22} />
              ) : isEditMode ? (
                "حفظ التعديلات"
              ) : (
                "إضافة موعد"
              )}
            </Button>
          </DialogActions>
        </form>
      </LocalizationProvider>
    </Dialog>
  );
};

export default ExamScheduleFormDialog;
