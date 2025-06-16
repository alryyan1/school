// src/pages/enrollments/StudentEnrollmentManager.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog as ShadcnDialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle as ShadcnDialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Search,
  FilterX,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";

import { useAcademicYearStore } from "@/stores/academicYearStore";
import { useGradeLevelStore } from "@/stores/gradeLevelStore";
import { useSchoolStore } from "@/stores/schoolStore";
import { useStudentEnrollmentStore } from "@/stores/studentEnrollmentStore";
import { SchoolApi } from "@/api/schoolApi";
import EnrollmentFormDialog from "@/components/enrollments/EnrollmentFormDialog";
import UpdateEnrollmentDialog from "@/components/enrollments/UpdateEnrollmentDialog";
import StudentFeePaymentList from "@/components/finances/StudentFeePaymentList";
import {
  StudentAcademicYear,
  EnrollmentStatus,
} from "@/types/studentAcademicYear";
import { GradeLevel } from "@/types/gradeLevel";
import { useSnackbar } from "notistack";
import { useSettingsStore } from "@/stores/settingsStore";

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// Helper to get status chip color (Tailwind classes for Badge variants)
const getStatusVariant = (
  status: EnrollmentStatus
): "default" | "secondary" | "destructive" | "outline" | "success" => {
  switch (status) {
    case "active":
      return "success";
    case "graduated":
      return "default"; // Or a specific color
    case "transferred":
      return "secondary";
    case "withdrawn":
      return "destructive";
    default:
      return "outline";
  }
};

const StudentEnrollmentManager: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const initialActiveSchoolId = useSettingsStore.getState().activeSchoolId;
  const initialActiveYearId = useSettingsStore.getState().activeAcademicYearId;

  // --- Local State ---
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | "">(
    initialActiveSchoolId ?? ""
  );
  const [selectedYearId, setSelectedYearId] = useState<number | "">(() => {
    const initialAcademicYears = useAcademicYearStore.getState().academicYears;
    const yearIsValid = initialAcademicYears.some(
      (y) =>
        y.id === initialActiveYearId && y.school_id === initialActiveSchoolId
    );
    return yearIsValid && initialActiveSchoolId ? initialActiveYearId : "";
  });
  const [selectedGradeId, setSelectedGradeId] = useState<number | "">("");
  const [availableGradeLevels, setAvailableGradeLevels] = useState<
    GradeLevel[]
  >([]); // School-specific grades
  const [loadingSchoolGrades, setLoadingSchoolGrades] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog States
  const [enrollFormOpen, setEnrollFormOpen] = useState(false);
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentListOpen, setPaymentListOpen] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] =
    useState<StudentAcademicYear | null>(null);

  // --- Store Data ---
  const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
  const { academicYears, fetchAcademicYears } = useAcademicYearStore();
  const { fetchGradeLevels } = useGradeLevelStore();
  const {
    enrollments,
    loading,
    error,
    isSearchResult,
    fetchEnrollments,
    deleteEnrollment,
    clearEnrollments,
    searchEnrollments,
  } = useStudentEnrollmentStore();

  // --- Effects ---
  useEffect(() => {
    fetchSchools();
    fetchAcademicYears();
    fetchGradeLevels();
  }, [fetchSchools, fetchAcademicYears, fetchGradeLevels]);

  const fetchSchoolSpecificGrades = useCallback(
    async (schoolId: number) => {
      setLoadingSchoolGrades(true);
      setAvailableGradeLevels([]);
      try {
        const response = await SchoolApi.getAssignedGradeLevels(schoolId);
        setAvailableGradeLevels(
          response.data.data?.sort((a, b) => a.id - b.id) ?? []
        );
      } catch (err: unknown) {
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
    if (selectedSchoolId) {
      fetchSchoolSpecificGrades(selectedSchoolId);
      if (selectedYearId && !isSearchResult) {
        // Don't fetch by filter if search is active
        fetchEnrollments({
          school_id: selectedSchoolId,
          academic_year_id: selectedYearId,
          grade_level_id: selectedGradeId || undefined,
        });
      } else if (!selectedYearId && !isSearchResult) {
        clearEnrollments();
      }
    } else {
      clearEnrollments();
      setAvailableGradeLevels([]);
      setSelectedYearId("");
      setSelectedGradeId("");
    }
  }, [
    selectedSchoolId,
    selectedYearId,
    selectedGradeId,
    fetchEnrollments,
    clearEnrollments,
    fetchSchoolSpecificGrades,
    isSearchResult,
  ]);

  // --- Handlers ---
  const handleSchoolChange = (value: string) => {
    /* ... same logic, use Number(value) ... */ setSelectedSchoolId(
      value ? Number(value) : ""
    );
    setSelectedYearId("");
    setSelectedGradeId("");
    clearSearch();
  };
  const handleYearChange = (value: string) => {
    /* ... same logic ... */ setSelectedYearId(value ? Number(value) : "");
    setSelectedGradeId("");
    clearSearch();
  };
  const handleGradeChange = (value: string) => {
    /* ... same logic ... */ setSelectedGradeId(value ? Number(value) : "");
    clearSearch();
  };
  const handleSearch = () => {
    if (searchTerm) searchEnrollments(searchTerm);
  };
  const clearSearch = () => {
    setSearchTerm("");
    clearEnrollments(); /* Fetch with current filters is handled by useEffect */
  };

  const handleOpenEnrollForm = () => {
    if (!selectedGradeId) {
      enqueueSnackbar("الرجاء تحديد المرحلة الدراسية أولاً لإضافة تسجيل.", {
        variant: "warning",
      });
      return;
    }
    setEnrollFormOpen(true);
  };
  const handleEnrollSuccess = () => {
    setEnrollFormOpen(false); /* Store action handles refetch */
  };
  const handleOpenUpdateForm = (enrollment: StudentAcademicYear) => {
    setCurrentEnrollment(enrollment);
    setUpdateFormOpen(true);
  };
  const handleUpdateSuccess = () => {
    setUpdateFormOpen(false);
    setCurrentEnrollment(null); /* Store action handles refetch */
  };
  const handleOpenDeleteDialog = (enrollment: StudentAcademicYear) => {
    setCurrentEnrollment(enrollment);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setCurrentEnrollment(null);
    setDeleteDialogOpen(false);
  };
  const handleDeleteConfirm = async () => {
    if (currentEnrollment && selectedSchoolId && selectedYearId) {
      try {
        const success = await deleteEnrollment(Number(currentEnrollment.id));
        if (success) {
          enqueueSnackbar('تم حذف التسجيل بنجاح', { variant: 'success' });
          fetchEnrollments({
            school_id: selectedSchoolId,
            academic_year_id: selectedYearId,
            grade_level_id: selectedGradeId || undefined,
          });
        } else {
          enqueueSnackbar('فشل حذف التسجيل', { variant: 'error' });
        }
      } catch (err: unknown) {
        console.error("Delete enrollment error:", err);
        enqueueSnackbar('فشل حذف التسجيل', { variant: 'error' });
      } finally {
        handleCloseDeleteDialog();
      }
    }
  };
  const handleOpenPaymentList = (enrollment: StudentAcademicYear) => {
    setCurrentEnrollment(enrollment);
    setPaymentListOpen(true);
  };
  const handleClosePaymentList = () => {
    setPaymentListOpen(false);
    setCurrentEnrollment(null);
  };

  // --- Memoized Data ---
  const filteredAcademicYears = useMemo(() => {
    if (!selectedSchoolId) return [];
    return academicYears
      .filter((ay) => ay.school_id === selectedSchoolId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [academicYears, selectedSchoolId]);

  const selectedAcademicYearObj = useMemo(() => {
    return academicYears.find((ay) => ay.id === selectedYearId) || null;
  }, [academicYears, selectedYearId]);

  const selectedGradeLevelObj = useMemo(() => {
    // Use availableGradeLevels which are school-specific
    return availableGradeLevels.find((gl) => gl.id === selectedGradeId) || null;
  }, [availableGradeLevels, selectedGradeId]);

  // --- Render ---
  return (
    <div className="container max-w-screen-xl mx-auto py-6 px-4" dir="rtl">
      {/* Header & Filters Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle className="text-xl font-semibold">
              إدارة تعيين الطلاب
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="بحث بالاسم أو الرقم الوطني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[200px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchTerm) handleSearch();
                }}
              />
              <Button
                onClick={handleSearch}
                disabled={!searchTerm || loading}
                size="sm"
              >
                <Search className="ml-2 h-4 w-4" /> بحث
              </Button>
              {isSearchResult && (
                <Button variant="outline" onClick={clearSearch} size="sm">
                  <FilterX className="ml-2 h-4 w-4" /> مسح البحث
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            {/* School Filter */}
            <div className="space-y-1">
              <Label htmlFor="school-filter-enroll">المدرسة *</Label>
              <Select
                value={selectedSchoolId ? String(selectedSchoolId) : ""}
                onValueChange={handleSchoolChange}
                disabled={schoolsLoading || isSearchResult}
              >
                <SelectTrigger id="school-filter-enroll">
                  <SelectValue
                    placeholder={schoolsLoading ? "..." : "اختر مدرسة..."}
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
            </div>
            {/* Academic Year Filter */}
            <div className="space-y-1">
              <Label htmlFor="year-filter-enroll">العام الدراسي *</Label>
              <Select
                value={selectedYearId ? String(selectedYearId) : ""}
                onValueChange={handleYearChange}
                disabled={!selectedSchoolId || isSearchResult}
              >
                <SelectTrigger id="year-filter-enroll">
                  <SelectValue placeholder="اختر عاماً..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" " disabled>
                    <em>اختر عاماً...</em>
                  </SelectItem>
                  {filteredAcademicYears.map((ay) => (
                    <SelectItem key={ay.id} value={String(ay.id)}>
                      {ay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Grade Level Filter */}
            <div className="space-y-1">
              <Label htmlFor="grade-filter-enroll">المرحلة الدراسية</Label>
              <Select
                value={selectedGradeId ? String(selectedGradeId) : ""}
                onValueChange={handleGradeChange}
                disabled={
                  !selectedYearId || loadingSchoolGrades || isSearchResult
                }
              >
                <SelectTrigger id="grade-filter-enroll">
                  <SelectValue
                    placeholder={
                      loadingSchoolGrades ? "..." : "اختر مرحلة (أو الكل)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">
                    <em>(جميع المراحل)</em>
                  </SelectItem>
                  {availableGradeLevels.map((gl) => (
                    <SelectItem key={gl.id} value={String(gl.id)}>
                      {gl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Enroll Button */}
            <Button
              onClick={handleOpenEnrollForm}
              disabled={
                !selectedSchoolId ||
                !selectedYearId ||
                !selectedGradeId ||
                loadingSchoolGrades ||
                isSearchResult
              }
              className="w-full sm:w-auto"
            >
              <PlusCircle className="ml-2 h-4 w-4" /> تعيين طالب
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading/Error/Info Display */}
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
      {!loading &&
        !isSearchResult &&
        (!selectedSchoolId || !selectedYearId) && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              الرجاء تحديد المدرسة والعام الدراسي لعرض الطلاب المسجلين أو استخدم
              البحث العام.
            </AlertDescription>
          </Alert>
        )}
      {isSearchResult && !loading && (
        <Alert
          variant="default"
          className="mb-4 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
        >
          <AlertDescription>
            عرض نتائج البحث عن "{searchTerm}".
          </AlertDescription>
        </Alert>
      )}

      {/* Enrollments Table */}
      {!loading &&
        !error &&
        (isSearchResult || (selectedSchoolId && selectedYearId)) && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <div className="border rounded-lg overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    {isSearchResult && <TableHead className="text-center">المدرسة</TableHead>}
                    {isSearchResult && <TableHead className="text-center">العام</TableHead>}
                    <TableHead className="text-center"> كود الطالب</TableHead>
                    <TableHead className="text-center">اسم الطالب</TableHead>
                    <TableHead className="hidden sm:table-cell text-center">
                      الرقم الوطني
                    </TableHead>
                    <TableHead className="text-center hidden sm:table-cell">الصف</TableHead>
                    <TableHead className="hidden sm:table-cell text-center">
                      الفصل
                    </TableHead>
                    <TableHead className="text-center hidden sm:table-cell">الحالة</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">الدفعات</TableHead>
                    <TableHead className="text-center  w-[100px]">
                      إجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isSearchResult ? 9 : 7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        {isSearchResult
                          ? "لا نتائج للبحث."
                          : "لا يوجد طلاب مسجلون."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollments.map((enrollment) => (
                      <motion.tr
                        key={enrollment.id}
                        variants={itemVariants}
                        className="hover:bg-muted/50"
                      >
                        {isSearchResult && (
                          <TableCell className="text-center">
                            {enrollment.school?.name || "-"}
                          </TableCell>
                        )}
                        {isSearchResult && (
                          <TableCell className="text-center">
                            {enrollment.academic_year?.name || "-"}
                          </TableCell>
                        )}
                        <TableCell className="font-medium text-center">
                          {enrollment.student?.id || "-"}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {enrollment.student?.student_name || "-"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          {enrollment.student?.goverment_id || "-"}
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          {enrollment.grade_level?.name || "-"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          {enrollment.classroom?.name || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <Badge variant={getStatusVariant(enrollment.status)}>
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleOpenPaymentList(enrollment)}
                            className="h-auto p-0"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center w-[100px]">
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
                                onSelect={() =>
                                  handleOpenUpdateForm(enrollment)
                                }
                              >
                                <Edit3 className="ml-2 h-4 w-4" /> تعديل التسجيل
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleOpenDeleteDialog(enrollment)
                                }
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="ml-2 h-4 w-4" /> حذف التسجيل
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

      {/* Dialogs */}
      {selectedGradeLevelObj && selectedAcademicYearObj && (
        <EnrollmentFormDialog
          open={enrollFormOpen}
          onOpenChange={setEnrollFormOpen}
          onSuccess={handleEnrollSuccess}
          selectedAcademicYear={selectedAcademicYearObj}
          selectedGradeLevel={selectedGradeLevelObj}
        />
      )}
      <UpdateEnrollmentDialog
        open={updateFormOpen}
        onOpenChange={setUpdateFormOpen}
        onSuccess={handleUpdateSuccess}
        enrollmentData={currentEnrollment}
      />
      <ShadcnDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <ShadcnDialogTitle>تأكيد حذف التسجيل</ShadcnDialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف تسجيل الطالب "
              {currentEnrollment?.student?.student_name}" من العام "
              {currentEnrollment?.academic_year?.name}"?
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
      {/* Payments Dialog */}
      <ShadcnDialog
        open={paymentListOpen}
        onOpenChange={setPaymentListOpen}
      >
        <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col" dir="rtl">
          <DialogHeader>
            <ShadcnDialogTitle>
              سجل دفعات الطالب:{" "}
              {currentEnrollment?.student?.student_name}
            </ShadcnDialogTitle>
            <DialogDescription>
              للعام الدراسي:{" "}
              {currentEnrollment?.academic_year?.name} / الصف:{" "}
              {currentEnrollment?.grade_level?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto py-4">
            {currentEnrollment && (
              <StudentFeePaymentList
                feeInstallmentId={Number(currentEnrollment.id)}
                onDataChange={() => {
                  if (selectedSchoolId && selectedYearId) {
                    fetchEnrollments({
                      school_id: selectedSchoolId,
                      academic_year_id: selectedYearId,
                      grade_level_id: selectedGradeId || undefined,
                    });
                  }
                }}
              />
            )}
          </div>
          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={handleClosePaymentList}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </ShadcnDialog>
    </div>
  );
};
export default StudentEnrollmentManager;
