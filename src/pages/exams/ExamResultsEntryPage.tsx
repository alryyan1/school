// src/pages/exams/ExamResultsEntryPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useForm,
  useFieldArray,
  Controller,
} from "react-hook-form";
import dayjs from "dayjs";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// lucide-react icons
import {
  Loader2,
  AlertCircle,
  Save,
  ArrowRight,
  UserCircle,
} from "lucide-react";

// Stores and Types
import { useExamStore } from "@/stores/examStore";
import { useExamScheduleStore } from "@/stores/examScheduleStore"; // To get available schedules/subjects for filter
import { useExamResultStore } from "@/stores/examResultStore";
import { useSchoolStore } from "@/stores/schoolStore";
import { GradeLevel } from "@/types/gradeLevel";
import { ExamResultFormData } from "@/types/examResult";
import { useSnackbar } from "notistack";
import { useSettingsStore } from "@/stores/settingsStore"; // To get active school/year context
import { SchoolApi } from "@/api/schoolApi";

// Form structure for the entire page (array of results)
type ResultsPageFormData = {
  results: ExamResultFormData[];
};

const ExamResultsEntryPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  // Get examId from URL if navigating directly to results for a specific exam
  const { examId: examIdFromParams } = useParams<{ examId?: string }>();

  const { activeSchoolId } = useSettingsStore.getState();

  // --- Filters & Selected State ---
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | "">(
    activeSchoolId ?? ""
  );
  const [selectedExamId, setSelectedExamId] = useState<number | "">(
    examIdFromParams ? Number(examIdFromParams) : ""
  );
  const [selectedGradeId, setSelectedGradeId] = useState<number | "">("");
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | "">("");

  // --- Store Data ---
  const {
    schools,
    fetchSchools: fetchSchoolList,
    loading: schoolsLoading,
  } = useSchoolStore();
  const { exams, fetchExams, loading: examsLoading } = useExamStore();
  // Fetch school-specific grades if using SchoolGradeLevelManager logic
  const [schoolSpecificGradeLevels, setSchoolSpecificGradeLevels] = useState<
    GradeLevel[]
  >([]);
  const [loadingSchoolGrades, setLoadingSchoolGrades] = useState(false);

  const {
    schedules: availableSchedules,
    fetchSchedules: fetchExamSchedulesByExam,
    loading: schedulesLoading,
  } = useExamScheduleStore();
  const {
    resultsForSchedule,
    pendingStudents,
    fetchResultsForSchedule,
    fetchPendingStudents,
    saveResults,
    loadingResults: resultsListLoading,
    loadingPending,
    error: resultsError,
    clearResultsState,
  } = useExamResultStore();

  // --- React Hook Form ---
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResultsPageFormData>({
    defaultValues: { results: [] },
  });
  const { fields, replace } = useFieldArray({
    control,
    name: "results",
  });

  // --- Animation variants ---
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // --- Effects to fetch data for filters ---
  useEffect(() => {
    fetchSchoolList();
  }, [fetchSchoolList]);

  // Fetch exams for selected school
  useEffect(() => {
    if (selectedSchoolId) {
      fetchExams({ school_id: selectedSchoolId });
    } else {
      useExamStore.getState().clearExams(); // Assuming a clear action
    }
    setSelectedExamId(""); // Reset exam when school changes
    setSelectedGradeId("");
    setSelectedScheduleId("");
  }, [selectedSchoolId, fetchExams]);

  // Fetch grade levels assigned to the selected school
  const fetchSchoolGrades = useCallback(
    async (schoolIdParam: number) => {
      setLoadingSchoolGrades(true);
      setSchoolSpecificGradeLevels([]);
      try {
        const response = await SchoolApi.getAssignedGradeLevels(schoolIdParam);
        setSchoolSpecificGradeLevels(response.data.data ?? []);
      } catch (error) {
        console.error("Failed to fetch school grades:", error);
        enqueueSnackbar("فشل تحميل مراحل المدرسة", { variant: "error" });
      } finally {
        setLoadingSchoolGrades(false);
      }
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    if (selectedSchoolId) {
      fetchSchoolGrades(selectedSchoolId);
    } else {
      setSchoolSpecificGradeLevels([]);
    }
    setSelectedGradeId(""); // Reset grade when school changes
    setSelectedScheduleId("");
  }, [selectedSchoolId, fetchSchoolGrades]);

  // Fetch schedules when exam & grade are selected
  useEffect(() => {
    if (selectedExamId && selectedGradeId) {
      fetchExamSchedulesByExam(Number(selectedExamId), {
        grade_level_id: Number(selectedGradeId),
      });
    } else {
      useExamScheduleStore.getState().clearSchedules();
    }
    setSelectedScheduleId(""); // Reset schedule when exam/grade changes
  }, [selectedExamId, selectedGradeId, fetchExamSchedulesByExam]);

  // --- Effect to fetch results and pending students for the selected schedule ---
  useEffect(() => {
    if (selectedScheduleId) {
      fetchResultsForSchedule(Number(selectedScheduleId));
      fetchPendingStudents(Number(selectedScheduleId));
    } else {
      clearResultsState(); // Clears results and pending students
      reset({ results: [] }); // Reset form array
    }
  }, [
    selectedScheduleId,
    fetchResultsForSchedule,
    fetchPendingStudents,
    reset,
    clearResultsState,
  ]);

  // --- Effect to populate form fields once data is ready ---
  useEffect(() => {
    const formValues: ExamResultFormData[] = [];
    // Combine and map existing results with pending students
    const allStudentEnrollmentIds = new Set<number>();

    // Add null/undefined checks before calling forEach
    if (resultsForSchedule && Array.isArray(resultsForSchedule)) {
      resultsForSchedule.forEach((res) => {
        if (res.student_enrollment?.id) {
          const enrollmentId = Number(res.student_enrollment.id);
          allStudentEnrollmentIds.add(enrollmentId);
          formValues.push({
            student_academic_year_id: enrollmentId,
            marks_obtained:
              res.marks_obtained != null ? String(res.marks_obtained) : "",
            is_absent: res.is_absent,
            grade_letter: res.grade_letter || "",
            remarks: res.remarks || "",
          });
        }
      });
    }
    
    if (pendingStudents && Array.isArray(pendingStudents)) {
      pendingStudents.forEach((enrollment) => {
        if (enrollment.id) {
          const enrollmentId = Number(enrollment.id);
          if (!allStudentEnrollmentIds.has(enrollmentId)) {
            // Ensure not already added
            allStudentEnrollmentIds.add(enrollmentId);
            formValues.push({
              student_academic_year_id: enrollmentId,
              marks_obtained: "",
              is_absent: false,
              grade_letter: "",
              remarks: "",
            });
          }
        }
      });
    }

    // Sort by student name for consistent display
    const studentDataMapForSort = new Map<number, string>();
    
    if (resultsForSchedule && Array.isArray(resultsForSchedule)) {
      resultsForSchedule.forEach((r) => {
        if (r.student_enrollment?.student && r.student_enrollment?.id) {
          studentDataMapForSort.set(
            Number(r.student_enrollment.id),
            r.student_enrollment.student.student_name
          );
        }
      });
    }
    
    if (pendingStudents && Array.isArray(pendingStudents)) {
      pendingStudents.forEach((e) => {
        if (e.student && e.id) {
          studentDataMapForSort.set(Number(e.id), e.student.student_name);
        }
      });
    }

    formValues.sort((a, b) => {
      const nameA = studentDataMapForSort.get(a.student_academic_year_id) || "";
      const nameB = studentDataMapForSort.get(b.student_academic_year_id) || "";
      return nameA.localeCompare(nameB, "ar"); // Arabic sort
    });
    replace(formValues); // Use replace to set the entire array
  }, [
    resultsForSchedule,
    pendingStudents,
    selectedScheduleId,
    availableSchedules,
    reset,
    replace,
  ]); // Use replace

  // --- Form Submission ---
  const onSubmit = async (data: ResultsPageFormData) => {
    if (!selectedScheduleId) {
      enqueueSnackbar("الرجاء اختيار موعد امتحان", { variant: "error" });
      return;
    }
    const currentSchedule = availableSchedules.find(
      (s) => s.id === Number(selectedScheduleId)
    );
    if (!currentSchedule) {
      enqueueSnackbar("موعد الامتحان غير موجود", { variant: "error" });
      return;
    }

    const resultsToSubmit = data.results
      .filter(
        (r) =>
          (r.marks_obtained !== "" && r.marks_obtained !== null) ||
          r.is_absent === true
      )
      .map((r) => ({
        ...r,
        marks_obtained: r.is_absent ? "" : r.marks_obtained, // Send empty string for null marks for backend
        // Backend will convert marks_obtained string to number or null
      }));

    if (resultsToSubmit.length === 0) {
      enqueueSnackbar("لا توجد نتائج لحفظها", { variant: "info" });
      return;
    }

    const success = await saveResults(
      Number(selectedScheduleId),
      resultsToSubmit
    );
    if (success) {
      enqueueSnackbar("تم حفظ النتائج بنجاح!", { variant: "success" });
    } else {
      enqueueSnackbar(
        useExamResultStore.getState().error || "فشل حفظ النتائج.",
        { variant: "error" }
      );
    }
  };

  // --- Memoized data for display in table header ---
  const currentScheduleDetails = useMemo(
    () => availableSchedules.find((s) => s.id === Number(selectedScheduleId)),
    [availableSchedules, selectedScheduleId]
  );

  // Create a map for quick student lookup for display in the table
  const studentDataMap = useMemo(() => {
    const map = new Map<
      number,
      { name: string; govId?: string | null; image_url?: string | null }
    >();
    
    // Add null/undefined checks before calling forEach
    if (resultsForSchedule && Array.isArray(resultsForSchedule)) {
      resultsForSchedule.forEach((r) => {
        if (r.student_enrollment?.student && r.student_enrollment?.id) {
          map.set(Number(r.student_enrollment.id), {
            name: r.student_enrollment.student.student_name,
            govId: r.student_enrollment.student.goverment_id,
            image_url: r.student_enrollment.student.student_name, // Using name as fallback since image_url doesn't exist in type
          });
        }
      });
    }
    
    if (pendingStudents && Array.isArray(pendingStudents)) {
      pendingStudents.forEach((e) => {
        if (e.student && e.id) {
          map.set(Number(e.id), {
            name: e.student.student_name,
            govId: e.student.goverment_id,
            image_url: e.student.student_name, // Using name as fallback since image_url doesn't exist in type
          });
        }
      });
    }
    
    return map;
  }, [resultsForSchedule, pendingStudents]);

  // --- Render ---
  return (
    <div className="container max-w-screen-2xl mx-auto py-6 px-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="text-xl font-semibold">
                رصد درجات الامتحانات
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/exams">
                  <ArrowRight className="ml-2 h-4 w-4" />
                  عودة لدورات الامتحانات
                </Link>
              </Button>
            </div>
            <CardDescription>
              اختر المدرسة، دورة الامتحان، المرحلة، ثم المادة/الموعد لإدخال
              درجات الطلاب.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
            {/* School Select */}
            <div className="space-y-1">
              <Label>المدرسة *</Label>
              <Select
                value={selectedSchoolId ? String(selectedSchoolId) : ""}
                onValueChange={(val) => setSelectedSchoolId(Number(val))}
                disabled={schoolsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Exam Period Select */}
            <div className="space-y-1">
              <Label>دورة الامتحان *</Label>
              <Select
                value={selectedExamId ? String(selectedExamId) : ""}
                onValueChange={(val) => {
                  setSelectedExamId(Number(val));
                  setSelectedGradeId("");
                  setSelectedScheduleId("");
                }}
                disabled={examsLoading || !selectedSchoolId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent>
                  {exams
                    .filter((e) => e.school_id === selectedSchoolId)
                    .map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {/* Grade Level Select */}
            <div className="space-y-1">
              <Label>المرحلة الدراسية *</Label>
              <Select
                value={selectedGradeId ? String(selectedGradeId) : ""}
                onValueChange={(val) => {
                  setSelectedGradeId(Number(val));
                  setSelectedScheduleId("");
                }}
                disabled={!selectedExamId || loadingSchoolGrades}
              >
                <SelectTrigger>
                  <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent>
                  {schoolSpecificGradeLevels.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Exam Schedule (Subject) Select */}
            <div className="space-y-1">
              <Label>المادة (الموعد) *</Label>
              <Select
                value={selectedScheduleId ? String(selectedScheduleId) : ""}
                onValueChange={(val) => setSelectedScheduleId(Number(val))}
                disabled={!selectedGradeId || schedulesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSchedules.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.subject?.name} - {dayjs(s.exam_date).format("DD/MM")} @{" "}
                      {s.start_time.substring(0, 5)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {(resultsListLoading || loadingPending) && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
      {resultsError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{resultsError}</AlertDescription>
        </Alert>
      )}

      {selectedScheduleId &&
        !resultsListLoading &&
        !loadingPending &&
        !resultsError && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>
                  إدخال الدرجات لمادة:{" "}
                  <span className="text-primary">
                    {currentScheduleDetails?.subject?.name}
                  </span>
                </CardTitle>
                <CardDescription>
                  العلامة العظمى: {currentScheduleDetails?.max_marks || "N/A"} |
                  علامة النجاح: {currentScheduleDetails?.pass_marks ?? "-"} |
                  تاريخ:{" "}
                  {currentScheduleDetails?.exam_date
                    ? dayjs(currentScheduleDetails.exam_date).format(
                        "YYYY/MM/DD"
                      )
                    : ""}{" "}
                  | الوقت: {currentScheduleDetails?.start_time.substring(0, 5)}{" "}
                  - {currentScheduleDetails?.end_time.substring(0, 5)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto mx-auto">
                  <Table className="min-w-[800px]">
                    {" "}
                    {/* Ensure min-width for better layout */}
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead className="w-[80px] text-center">
                          الصورة
                        </TableHead>
                        <TableHead className="w-[200px]">اسم الطالب</TableHead>
                        <TableHead className="hidden sm:table-cell w-[130px]">
                          الرقم الوطني
                        </TableHead>
                        <TableHead className="w-[130px] text-center">
                          الدرجة
                        </TableHead>
                        <TableHead className="w-[80px] text-center">
                          غياب؟
                        </TableHead>
                        <TableHead className="w-[150px]">التقدير</TableHead>
                        <TableHead>ملاحظات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="h-24 text-center text-muted-foreground"
                          >
                            لا يوجد طلاب مسجلون أو تم رصد درجاتهم جميعاً لهذا
                            الموعد.
                          </TableCell>
                        </TableRow>
                      )}
                      {fields.map((fieldItem, index) => {
                        const studentInfo = studentDataMap.get(
                          fieldItem.student_academic_year_id
                        );
                        const isAbsent = watch(`results.${index}.is_absent`);
                        const marksError =
                          errors.results?.[index]?.marks_obtained;

                        return (
                          <motion.tr
                            key={fieldItem.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <TableCell className="py-2 text-center text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              <Avatar className="h-9 w-9 mx-auto">
                                <AvatarImage
                                  src={studentInfo?.image_url ?? undefined}
                                  alt={studentInfo?.name}
                                />
                                <AvatarFallback>
                                  {studentInfo?.name?.charAt(0) ?? (
                                    <UserCircle className="h-5 w-5" />
                                  )}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium py-2">
                              {studentInfo?.name ||
                                `Enroll. ID ${fieldItem.student_academic_year_id}`}
                            </TableCell>
                            <TableCell className="py-2 text-muted-foreground hidden sm:table-cell">
                              {studentInfo?.govId || "-"}
                            </TableCell>
                            <TableCell className="py-2">
                              <Controller
                                name={`results.${index}.marks_obtained`}
                                control={control}
                                rules={{
                                  validate: (value) =>
                                    isAbsent ||
                                    (value !== "" &&
                                      value !== null &&
                                      !isNaN(parseFloat(value))) ||
                                    "مطلوب",
                                  min: { value: 0, message: ">=0" },
                                  max: {
                                    value: Number(
                                      currentScheduleDetails?.max_marks || 100
                                    ),
                                    message: `<= ${
                                      currentScheduleDetails?.max_marks || 100
                                    }`,
                                  },
                                }}
                                render={({ field: marksField }) => (
                                  <Input
                                    type="number"
                                    placeholder={`0-${
                                      currentScheduleDetails?.max_marks || 100
                                    }`}
                                    {...marksField}
                                    value={isAbsent ? "" : marksField.value} // Clear if absent
                                    onChange={(e) =>
                                      marksField.onChange(e.target.value)
                                    } // Ensure string for input
                                    disabled={isAbsent || isSubmitting}
                                    className={cn(
                                      "w-24 text-center",
                                      marksError && "border-destructive"
                                    )}
                                    step="0.25"
                                  />
                                )}
                              />
                              {marksError && (
                                <p className="text-xs text-destructive mt-1">
                                  {marksError.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-center py-2">
                              <Controller
                                name={`results.${index}.is_absent`}
                                control={control}
                                render={({ field: absentField }) => (
                                  <Checkbox
                                    id={`absent-${index}-${fieldItem.id}`}
                                    checked={!!absentField.value}
                                    onCheckedChange={(checked) => {
                                      absentField.onChange(checked);
                                      if (checked)
                                        setValue(
                                          `results.${index}.marks_obtained`,
                                          ""
                                        );
                                    }}
                                    disabled={isSubmitting}
                                  />
                                )}
                              />
                            </TableCell>
                            <TableCell className="py-2">
                              <Controller
                                name={`results.${index}.grade_letter`}
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    placeholder="مثال: A+, جيد"
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={isSubmitting}
                                    className="w-28"
                                  />
                                )}
                              />
                            </TableCell>
                            <TableCell className="py-2">
                              <Controller
                                name={`results.${index}.remarks`}
                                control={control}
                                render={({ field }) => (
                                  <Textarea
                                    placeholder="ملاحظات..."
                                    {...field}
                                    value={field.value ?? ""}
                                    rows={1}
                                    className="min-h-[38px]"
                                    disabled={isSubmitting}
                                  />
                                )}
                              />
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    resultsListLoading ||
                    loadingPending ||
                    fields.length === 0
                  }
                  className="min-w-[150px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4" /> حفظ النتائج
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
    </div>
  );
};

export default ExamResultsEntryPage;
