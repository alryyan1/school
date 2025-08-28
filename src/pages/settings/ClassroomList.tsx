// src/pages/settings/ClassroomList.tsx
import React, { useState, useEffect, useCallback } from "react";
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
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  PlusCircle,
  MoreHorizontal,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { useClassroomStore } from "@/stores/classroomStore";
import { useSchoolStore } from "@/stores/schoolStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { SchoolApi } from "@/api/schoolApi";
import ClassroomFormDialog from "@/components/settings/ClassroomFormDialog";
import { Classroom } from "@/types/classroom";
import { GradeLevel } from "@/types/gradeLevel";
import { useSnackbar } from "notistack";

const ClassroomList: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { activeSchoolId } = useSettingsStore();
  const initialActiveSchoolId = activeSchoolId;

  // Debug logging for settings
  console.log("Settings - activeSchoolId:", activeSchoolId);

  // --- Local State ---
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | "">(
    initialActiveSchoolId ?? ""
  );
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | "">(
    ""
  );
  
  // Check if we have all required settings
  useEffect(() => {
    console.log("Settings check:", {
      activeSchoolId,
      selectedSchoolId,
      selectedGradeFilter,
      hasAllRequired: !!(activeSchoolId && selectedSchoolId && selectedGradeFilter)
    });
  }, [activeSchoolId, selectedSchoolId, selectedGradeFilter]);
  const [availableGradeLevels, setAvailableGradeLevels] = useState<
    GradeLevel[]
  >([]);
  const [loadingSchoolGrades, setLoadingSchoolGrades] =
    useState<boolean>(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(
    null
  );

  // --- Store Data ---
  const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
  const {
    classrooms,
    loading,
    error,
    fetchClassrooms,
    deleteClassroom,
    clearClassrooms,
  } = useClassroomStore();

  // --- Effects ---
  useEffect(() => {
    console.log("Fetching schools..."); // Debug log
    fetchSchools();
  }, [fetchSchools]);

  useEffect(() => {
    console.log("Schools loaded:", schools.length, schools); // Debug log
  }, [schools]);

  const fetchSchoolSpecificGrades = useCallback(
    async (schoolId: number) => {
      setLoadingSchoolGrades(true);
      setAvailableGradeLevels([]);
      try {
        const response = await SchoolApi.getAssignedGradeLevels(schoolId);
        console.log("School grades response:", response.data); // Debug log
        // Laravel Resource Collection returns { data: [...] }
        const gradeLevels = (response.data as { data: GradeLevel[] }).data ?? [];
        setAvailableGradeLevels(gradeLevels);
      } catch (err) {
        console.error("Failed to fetch school grades", err);
        enqueueSnackbar("فشل تحميل مراحل المدرسة المختارة", {
          variant: "error",
        });
      } finally {
        setLoadingSchoolGrades(false);
      }
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    console.log("useEffect triggered:", { selectedSchoolId, selectedGradeFilter }); // Debug log
    if (selectedSchoolId) {
      console.log("Fetching grades for school:", selectedSchoolId); // Debug log
      fetchSchoolSpecificGrades(selectedSchoolId);
      
      // Fetch classrooms if we have school and grade level
      if (selectedGradeFilter) {
        console.log("Fetching classrooms for school:", selectedSchoolId, "grade:", selectedGradeFilter);
        fetchClassrooms({
          school_id: selectedSchoolId,
          grade_level_id: selectedGradeFilter,
        });
      } else {
        console.log("No grade level selected"); // Debug log
      }
    } else {
      console.log("Clearing data"); // Debug log
      clearClassrooms();
      setAvailableGradeLevels([]);
      setSelectedGradeFilter("");
    }
  }, [
    selectedSchoolId,
    selectedGradeFilter,
    fetchClassrooms,
    clearClassrooms,
    fetchSchoolSpecificGrades,
  ]);

  // --- Handlers ---
  const handleSchoolChange = (value: string) => {
    // shadcn Select returns string value
    console.log("School changed to:", value, "Type:", typeof value); // Debug log
    const schoolId = value ? Number(value) : "";
    console.log("Setting schoolId to:", schoolId); // Debug log
    setSelectedSchoolId(schoolId);
    setSelectedGradeFilter("");
  };
  const handleGradeFilterChange = (value: string) => {
    console.log("Grade filter changed to:", value, "Type:", typeof value); // Debug log
    const gradeId = value ? Number(value) : "";
    console.log("Setting gradeFilter to:", gradeId); // Debug log
    setSelectedGradeFilter(gradeId);
  };
  const handleOpenForm = (classroom?: Classroom) => {
    if (!selectedSchoolId || !selectedGradeFilter) {
      enqueueSnackbar(
        "الرجاء تحديد المدرسة والمرحلة الدراسية أولاً لإضافة فصل.",
        { variant: "warning" }
      );
      return;
    }
    setEditingClassroom(classroom || null);
    setFormOpen(true);
  };
  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingClassroom(null);
    if (selectedSchoolId) {
      // Refetch classrooms for the current school
      fetchClassrooms({
        school_id: selectedSchoolId,
        grade_level_id: selectedGradeFilter || undefined,
      });
    }
  };
  const handleOpenDeleteDialog = (classroom: Classroom) => {
    setClassroomToDelete(classroom);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!classroomToDelete) return;
    try {
      await deleteClassroom(classroomToDelete.id);
      enqueueSnackbar('تم حذف الفصل بنجاح', { variant: 'success' });
      setDeleteDialogOpen(false);
      setClassroomToDelete(null);
      // Refetch classrooms
      if (selectedSchoolId) {
        fetchClassrooms({
          school_id: selectedSchoolId,
          grade_level_id: selectedGradeFilter || undefined,
        });
      }
    } catch (error) {
      console.error('Delete classroom error:', error);
      enqueueSnackbar('فشل حذف الفصل', { variant: 'error' });
    }
  };

  // --- Animation Variants (Optional) ---
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // --- Render Skeletons ---
  if (schoolsLoading) {
    return (
      <div className="container max-w-screen-lg mx-auto py-6 px-4" dir="rtl">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto py-6 px-4" dir="rtl">
      {/* Header & Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-foreground">
            إدارة الفصول الدراسية
          </h1>
          <Button
            onClick={() => handleOpenForm()}
            disabled={
              !selectedSchoolId || !selectedGradeFilter || loadingSchoolGrades
            }
          >
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة فصل
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-card">
          <div>
            <Label htmlFor="school-filter">المدرسة *</Label>
            <Select
              value={selectedSchoolId ? String(selectedSchoolId) : ""}
              onValueChange={handleSchoolChange}
              disabled={schoolsLoading}
            >
              <SelectTrigger id="school-filter" className="w-full">
                <SelectValue placeholder="اختر مدرسة..." />
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
          </div>
          <div>
            <Label htmlFor="grade-filter">المرحلة الدراسية</Label>
            <Select
              value={selectedGradeFilter ? String(selectedGradeFilter) : ""}
              onValueChange={handleGradeFilterChange}
              disabled={!selectedSchoolId || loadingSchoolGrades}
            >
              <SelectTrigger id="grade-filter" className="w-full">
                <SelectValue
                  placeholder={
                    loadingSchoolGrades
                      ? "جاري تحميل المراحل..."
                      : "اختر مرحلة (أو الكل)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">
                  <em>(جميع المراحل)</em>
                </SelectItem>
                {availableGradeLevels.length === 0 && !loadingSchoolGrades && (
                  <SelectItem value=" " disabled>
                    <em>لا مراحل لهذه المدرسة</em>
                  </SelectItem>
                )}
                {availableGradeLevels.map((gl) => (
                  <SelectItem key={gl.id} value={String(gl.id)}>
                    {gl.name} ({gl.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading/Error/Info for Table */}
      {loading && (
        <div className="flex justify-center py-5">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {!loading && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!loading && !selectedSchoolId && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>تنبيه</AlertTitle>
          <AlertDescription>الرجاء اختيار مدرسة لعرض الفصول.</AlertDescription>
        </Alert>
      )}
      {!loading && selectedSchoolId && !selectedGradeFilter && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>تنبيه</AlertTitle>
          <AlertDescription>الرجاء اختيار مرحلة دراسية لعرض الفصول.</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      {!loading && !error && selectedSchoolId && selectedGradeFilter && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">اسم الفصل</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">
                    المرحلة (الصف)
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-center">
                    مدرس الفصل
                  </TableHead>
                  <TableHead className="text-center">السعة</TableHead>
                  <TableHead className=" w-[80px] text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      لا توجد فصول دراسية حسب الفلتر المحدد.
                    </TableCell>
                  </TableRow>
                ) : (
                  classrooms.map((classroom) => (
                    <motion.tr
                      key={classroom.id}
                      variants={itemVariants}
                      className="hover:bg-muted/50"
                    >
                      <TableCell  className="font-medium text-center">
                        {classroom.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center">
                        {classroom.grade_level?.name || "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        {classroom.homeroom_teacher?.name || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {classroom.capacity}
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
                              onSelect={() => handleOpenForm(classroom)}
                            >
                              <Edit3 className="ml-2 h-4 w-4" /> تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => handleOpenDeleteDialog(classroom)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
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

      {/* Form Dialog */}
      <ClassroomFormDialog
        open={formOpen}
        onOpenChange={setFormOpen} // For shadcn dialog control
        onSuccess={handleFormSuccess} // Custom success handler
        initialData={editingClassroom}
        schoolId={selectedSchoolId ? Number(selectedSchoolId) : null}
        gradeLevelId={selectedGradeFilter ? Number(selectedGradeFilter) : null} // Pass selected grade for create
      />

      {/* Delete Confirmation Dialog */}
      <ShadcnDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الفصل الدراسي "{classroomToDelete?.name}"؟
              <br />
              <span className="text-destructive font-medium text-sm">
                (تحذير: لا يمكن حذف الفصل إذا كان هناك طلاب مسجلون به.)
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

export default ClassroomList;
