// src/pages/exams/ExamList.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

// lucide-react icons
import {
  PlusCircle,
  MoreHorizontal,
  Edit3,
  Trash2,
  CalendarCheck2,
  AlertCircle,
  Loader2,
  FilterX,
  ArrowRight,
} from "lucide-react";

import { useExamStore } from "@/stores/examStore";
import { useSchoolStore } from "@/stores/schoolStore";
// Removed useSettingsStore import
import ExamFormDialog from "@/components/exams/ExamFormDialog";
import { Exam } from "@/types/exam";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

const ExamList: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  // Removed useSettingsStore - implement your preferred state management

  // --- Local State ---
  const [formOpen, setFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<number | "">(
    defaultActiveSchoolId ?? ""
  );

  // --- Store Data ---
  const { exams, loading, error, fetchExams, deleteExam } = useExamStore();
  const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();

  // --- Effects ---
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  useEffect(() => {
    // Fetch exams based on filter (fetch all if filter is empty)
    fetchExams({ school_id: selectedSchoolFilter || undefined });
  }, [selectedSchoolFilter, fetchExams]);

  // --- Handlers ---
  const handleOpenForm = (exam?: Exam) => {
    setEditingExam(exam || null);
    setFormOpen(true);
  };
  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingExam(null);
    fetchExams({ school_id: selectedSchoolFilter || undefined }); // Refetch after save
  };
  const handleOpenDeleteDialog = (exam: Exam) => {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setExamToDelete(null);
    setDeleteDialogOpen(false);
  };
  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;
    
    try {
      await deleteExam(examToDelete.id);
      enqueueSnackbar("تم حذف دورة الامتحان بنجاح", { variant: "success" });
      handleCloseDeleteDialog();
      fetchExams({ school_id: selectedSchoolFilter || undefined });
    } catch (error) {
      console.error("Delete exam error:", error);
      enqueueSnackbar("فشل في حذف دورة الامتحان", { variant: "error" });
    }
  };
  const handleSchoolFilterChange = (value: string) =>
    setSelectedSchoolFilter(value ? Number(value) : "");
  const clearFilters = () => setSelectedSchoolFilter("");

  // --- Animation Variants ---
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // --- Render Skeletons ---
  if (schoolsLoading || (loading && exams.length === 0)) {
    return (
      <div className="container max-w-screen-lg mx-auto py-6 px-4" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto py-6 px-4" dir="rtl">
      {/* Header & Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-foreground">
            دورات الامتحانات
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="ml-2 h-4 w-4" /> إضافة دورة امتحان
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">
                <ArrowRight className="w-4 h-4 ml-2" />
                عودة للإعدادات
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-card items-end">
          <div className="space-y-1">
            <Label htmlFor="exam-school-filter">تصفية حسب المدرسة</Label>
            <Select
              value={selectedSchoolFilter ? String(selectedSchoolFilter) : ""}
              onValueChange={handleSchoolFilterChange}
              disabled={schoolsLoading}
            >
              <SelectTrigger id="exam-school-filter">
                <SelectValue placeholder="اختر مدرسة..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">
                  <em>(جميع المدارس)</em>
                </SelectItem>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedSchoolFilter && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              size="sm"
              className="self-end"
            >
              <FilterX className="ml-2 h-4 w-4" /> مسح الفلتر
            </Button>
          )}
        </div>
      </div>

      {/* Loading/Error for Table */}
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

      {/* Table - Centered */}
      {!loading && !error && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          <div className="border rounded-lg overflow-x-auto mx-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">اسم الدورة</TableHead>
                  <TableHead className="hidden md:table-cell text-center">
                    المدرسة
                  </TableHead>
                  <TableHead className="text-center">تاريخ البداية</TableHead>
                  <TableHead className="text-center">تاريخ النهاية</TableHead>
                  <TableHead className="hidden sm:table-cell">الوصف</TableHead>
                  <TableHead className="text-left w-[120px]">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      لا توجد دورات امتحانات لعرضها حسب الفلتر المحدد.
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <motion.tr
                      key={exam.id}
                      variants={itemVariants}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-center">{exam.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        {exam.school?.name || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {dayjs(exam.start_date).format("YYYY/MM/DD")}
                      </TableCell>
                      <TableCell className="text-center">
                        {dayjs(exam.end_date).format("YYYY/MM/DD")}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell max-w-[200px] truncate text-center">
                        {exam.description || "-"}
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
                            className="w-[180px]"
                          >
                            <DropdownMenuItem
                              onSelect={() =>
                                navigate(`/exams/${exam.id}/schedule`)
                              }
                            >
                              <CalendarCheck2 className="ml-2 h-4 w-4" /> إدارة
                              الجدول
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleOpenForm(exam)}
                            >
                              <Edit3 className="ml-2 h-4 w-4" /> تعديل الدورة
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => handleOpenDeleteDialog(exam)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="ml-2 h-4 w-4" /> حذف الدورة
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

      {/* Form Dialog */}
      <ExamFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
        initialData={editingExam}
      />

      {/* Delete Confirmation Dialog */}
      <ShadcnDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <ShadcnDialogTitle>تأكيد الحذف</ShadcnDialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف دورة الامتحان "{examToDelete?.name}"؟
              <br />
              <span className="text-destructive font-medium text-sm">
                (تحذير: قد يؤدي حذف الدورة إلى حذف الجداول والنتائج المرتبطة
                بها.)
              </span>
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

export default ExamList;
