// src/pages/exams/ExamSchedulePage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// shadcn/ui components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog as ShadcnDialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle as ShadcnDialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

// lucide-react icons
import {
  PlusCircle,
  MoreHorizontal,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  ArrowRight,
  PlusSquare,
} from "lucide-react";

import { useExamStore } from "@/stores/examStore";
import { useExamScheduleStore } from "@/stores/examScheduleStore";
import { useGradeLevelStore } from "@/stores/gradeLevelStore"; // To filter schedules
import ExamScheduleFormDialog from "@/pages/exams/ExamScheduleFormDialog";
import QuickAddScheduleDialog from "@/components/exams/QuickAddScheduleDialog"; // Import Quick Add Dialog
import { ExamSchedule } from "@/types/examSchedule";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";

const ExamSchedulePage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // --- Local State ---
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ExamSchedule | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ExamSchedule | null>(
    null
  );
  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false); // State for quick add
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | "">(
    ""
  );

  // --- Store Data ---
  const {
    exams,
    fetchExams: fetchExamList,
    loading: examLoading,
  } = useExamStore(); // Renamed loading
  const currentExam = useMemo(
    () => exams.find((e) => e.id === Number(examId)),
    [exams, examId]
  );

  const {
    schedules,
    loading,
    error,
    fetchSchedules,
    deleteSchedule,
    clearSchedules,
  } = useExamScheduleStore();
  const { gradeLevels: allGradeLevels, fetchGradeLevels } =
    useGradeLevelStore(); // All grades for filter

  // --- Effects ---
  useEffect(() => {
    if (exams.length === 0) fetchExamList(); // Fetch if exam details not present
    fetchGradeLevels(); // Fetch all grades for filter
  }, [fetchExamList, fetchGradeLevels, exams.length]);

  useEffect(() => {
    if (examId) {
      fetchSchedules(Number(examId), {
        grade_level_id: selectedGradeFilter || undefined,
      });
    } else {
      clearSchedules();
    }
    // Cleanup if examId changes
    return () => {
      if (examId) clearSchedules();
    };
  }, [examId, selectedGradeFilter, fetchSchedules, clearSchedules]);

  // --- Handlers ---
  const handleOpenForm = (schedule?: ExamSchedule) => {
    setEditingSchedule(schedule || null);
    setFormOpen(true);
  };
  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingSchedule(null);
    if (examId)
      fetchSchedules(Number(examId), {
        grade_level_id: selectedGradeFilter || undefined,
      });
  };
  const handleOpenQuickAddDialog = () => setQuickAddDialogOpen(true);
  const handleQuickAddSuccess = () => {
    setQuickAddDialogOpen(false);
    if (examId)
      fetchSchedules(Number(examId), {
        grade_level_id: selectedGradeFilter || undefined,
      });
  };
  const handleOpenDeleteDialog = (schedule: ExamSchedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setScheduleToDelete(null);
    setDeleteDialogOpen(false);
  };
  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return;
    
    try {
      await deleteSchedule(scheduleToDelete.id);
      enqueueSnackbar("تم حذف موعد الامتحان بنجاح", { variant: "success" });
      handleCloseDeleteDialog();
      if (examId) {
        fetchSchedules(Number(examId), {
          grade_level_id: selectedGradeFilter || undefined,
        });
      }
    } catch (error) {
      console.error("Delete schedule error:", error);
      enqueueSnackbar("فشل في حذف موعد الامتحان", { variant: "error" });
    }
  };
  const handleGradeFilterChange = (value: string) =>
    setSelectedGradeFilter(value ? Number(value) : "");

  // --- Animation Variants ---
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };
 
  // --- Grade Level Options for Filter (school-specific if exam has school) ---
  const gradeLevelOptionsForFilter = useMemo(() => {
    if (currentExam?.school_id) {
      // If you have a mechanism to get grades assigned to *this specific school*, use it.
      // For now, using allGradeLevels as a fallback.
      // const schoolGrades = useSchoolStore.getState().schools.find(s => s.id === currentExam.school_id)?.gradeLevels;
      // return schoolGrades || allGlobalGradeLevels;
      return allGradeLevels; // Simpler for now, can be refined
    }
    return allGradeLevels;
  }, [allGradeLevels, currentExam]);

  // --- Render ---
  if (!examId)
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <Alert variant="destructive">
          <AlertDescription>معرف دورة الامتحان غير صالح.</AlertDescription>
        </Alert>
      </div>
    );
  if (examLoading && !currentExam)
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  if (!examLoading && !currentExam)
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <Alert variant="destructive">
          <AlertDescription>
            دورة الامتحان المطلوبة غير موجودة.
          </AlertDescription>
        </Alert>
      </div>
    );

  return (
    <div className="container max-w-screen-xl mx-auto py-6 px-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-xl font-semibold">
                  جدول الامتحانات: {currentExam?.name}
                </CardTitle>
                <CardDescription>
                  المدرسة: {currentExam?.school?.name || "-"} | الفترة:{" "}
                  {currentExam?.start_date
                    ? dayjs(currentExam.start_date).format("DD/MM/YYYY")
                    : "-"}{" "}
                  إلى{" "}
                  {currentExam?.end_date
                    ? dayjs(currentExam.end_date).format("DD/MM/YYYY")
                    : "-"}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/exams")}
                >
                  <ArrowRight className="ml-2 h-4 w-4" /> العودة لدورات
                  الامتحانات
                </Button>
                <Button
                  onClick={handleOpenQuickAddDialog}
                  disabled={!currentExam}
                  size="sm"
                  variant="secondary"
                >
                  <PlusSquare className="ml-2 h-4 w-4" /> إضافة سريعة لمرحلة
                </Button>
                <Button
                  onClick={() => handleOpenForm()}
                  disabled={!currentExam}
                  size="sm"
                >
                  <PlusCircle className="ml-2 h-4 w-4" /> إضافة موعد امتحان
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {" "}
            {/* Reduced padding top */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <Label htmlFor="schedule-grade-filter-page">
                  تصفية حسب المرحلة
                </Label>
                <Select
                  value={selectedGradeFilter ? String(selectedGradeFilter) : ""}
                  onValueChange={handleGradeFilterChange}
                  disabled={
                    !currentExam || gradeLevelOptionsForFilter.length === 0
                  }
                >
                  <SelectTrigger id="schedule-grade-filter-page">
                    <SelectValue placeholder="اختر مرحلة..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">
                      <em>(جميع المراحل)</em>
                    </SelectItem>
                    {gradeLevelOptionsForFilter.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {loading && (
        <div className="flex justify-center py-5">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {!loading && error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && currentExam && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          <div className="border rounded-lg overflow-x-auto mx-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] text-center ">المادة</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">
                    المرحلة
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-center">الفصل</TableHead>
                  <TableHead className="text-center">التاريخ</TableHead>
                  <TableHead className="text-center">الوقت</TableHead>
                  <TableHead className="text-center hidden lg:table-cell ">
                    العلامة العظمى
                  </TableHead>
                  <TableHead className="text-center hidden lg:table-cell ">
                    علامة النجاح
                  </TableHead>
                  <TableHead className="hidden xl:table-cell text-center    ">
                    المراقب
                  </TableHead>
                  <TableHead className="text-left w-[80px]">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      لا توجد مواعيد امتحانات مضافة لهذه الدورة/الفلتر.
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <motion.tr
                      key={schedule.id}
                      variants={itemVariants}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-center">
                        {schedule.subject?.name || "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {schedule.grade_level?.name || "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        {schedule.classroom?.name || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {dayjs(schedule.exam_date).format("YYYY/MM/DD")}
                      </TableCell>
                      <TableCell className="text-center">
                        {schedule.start_time.substring(0, 5)} -{" "}
                        {schedule.end_time.substring(0, 5)}
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        {schedule.max_marks}
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        {schedule.pass_marks ?? "-"}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-center">
                        {schedule.teacher?.name || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px]"
                          >
                            <DropdownMenuItem
                              onSelect={() => handleOpenForm(schedule)}
                            >
                              <Edit3 className="ml-2 h-4 w-4" /> تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => handleOpenDeleteDialog(schedule)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="ml-2 h-4 w-4" /> حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Form Dialogs */}
      {currentExam && (
        <ExamScheduleFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSuccess={handleFormSuccess}
          initialData={editingSchedule}
          examId={currentExam.id}
          schoolId={currentExam.school_id} // Pass exam's school ID
          parentExamStartDate={currentExam.start_date}
          parentExamEndDate={currentExam.end_date}
        />
      )}
      {currentExam && (
        <QuickAddScheduleDialog
          open={quickAddDialogOpen}
          onOpenChange={setQuickAddDialogOpen}
          onSuccess={handleQuickAddSuccess}
          exam={currentExam}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ShadcnDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <ShadcnDialogTitle>تأكيد الحذف</ShadcnDialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف موعد امتحان مادة "
              {scheduleToDelete?.subject?.name}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                إلغاء
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </ShadcnDialog>
    </div>
  );
};

export default ExamSchedulePage;
