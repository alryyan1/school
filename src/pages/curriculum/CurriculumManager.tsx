// src/pages/curriculum/CurriculumManager.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  ArrowLeft,
  Trash2,
  Edit,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { useSubjectStore } from "@/stores/subjectStore";
import { useTeacherStore } from "@/stores/teacherStore";
import { useGradeLevelSubjectStore } from "@/stores/gradeLevelSubjectStore";
import { GradeLevelSubject } from "@/api/gradeLevelSubjectApi";
import { useSnackbar } from "notistack";
import { useGradeLevelStore } from "@/stores/gradeLevelStore";
import { NavLink } from "react-router-dom";

const CurriculumManager: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  // --- State for selections ---
  const [selectedGradeId, setSelectedGradeId] = useState<number | "">("");

  // --- Fetch data from stores ---
  const { subjects, fetchSubjects } = useSubjectStore();
  const { teachers, fetchTeachers: fetchAllTeachers } = useTeacherStore();
  const {
    assignments,
    loading,
    error,
    fetchAssignments,
    assignSubject,
    updateTeacherAssignment,
    unassignSubject,
    clearAssignments,
  } = useGradeLevelSubjectStore();
  const { gradeLevels, fetchGradeLevels } = useGradeLevelStore();

  // --- State for Dialogs ---
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editTeacherDialogOpen, setEditTeacherDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] =
    useState<GradeLevelSubject | null>(null);

  // --- State for Assign Dialog Form ---
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // --- Fetch initial lists ---
  useEffect(() => {
    fetchSubjects();
    fetchAllTeachers();
    fetchGradeLevels();
  }, [fetchSubjects, fetchAllTeachers, fetchGradeLevels]);



  // --- Fetch assignments when grade changes ---
  useEffect(() => {
    if (selectedGradeId) {
      fetchAssignments(selectedGradeId);
    } else {
      clearAssignments();
    }
  }, [selectedGradeId, fetchAssignments, clearAssignments]);

  // --- Calculate available subjects for Assign Dialog ---
  const availableSubjects = useMemo(() => {
    const assignedSubjectIds = assignments.map((a) => a.subject_id);
    return subjects.filter((s) => !assignedSubjectIds.includes(s.id));
  }, [subjects, assignments]);

  // --- Dialog Open/Close Handlers ---
  const handleOpenAssignDialog = () => {
    setSelectedSubjectId("");
    setSelectedTeacherId(null);
    setAssignError(null);
    setAssignDialogOpen(true);
  };
  const handleCloseAssignDialog = () => setAssignDialogOpen(false);

  const handleOpenEditTeacherDialog = (assignment: GradeLevelSubject) => {
    setCurrentAssignment(assignment);
    setSelectedTeacherId(assignment.teacher_id);
    setAssignError(null);
    setEditTeacherDialogOpen(true);
  };
  const handleCloseEditTeacherDialog = () => setEditTeacherDialogOpen(false);

  const handleOpenDeleteDialog = (assignment: GradeLevelSubject) => {
    setCurrentAssignment(assignment);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

  // --- Form Submission Handlers ---
  const handleAssignSubject = async () => {
    if (!selectedGradeId || !selectedSubjectId) {
      setAssignError("الرجاء تحديد المرحلة والمادة.");
      return;
    }
    setAssignLoading(true);
    setAssignError(null);
    try {
      await assignSubject({
        grade_level_id: selectedGradeId,
        subject_id: selectedSubjectId,
        teacher_id: selectedTeacherId,
      });
      enqueueSnackbar("تم تعيين المادة بنجاح", { variant: "success" });
      handleCloseAssignDialog();
    } catch (error: unknown) {
      setAssignError((error as Error).message || "فشل تعيين المادة.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUpdateTeacher = async () => {
    if (!currentAssignment) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      await updateTeacherAssignment(currentAssignment.id, selectedTeacherId);
      enqueueSnackbar("تم تحديث المعلم بنجاح", { variant: "success" });
      handleCloseEditTeacherDialog();
    } catch (error: unknown) {
      setAssignError((error as Error).message || "فشل تحديث المعلم.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (currentAssignment) {
      const success = await unassignSubject(currentAssignment.id);
      if (success) {
        enqueueSnackbar("تم إلغاء تعيين المادة بنجاح", { variant: "success" });
      } else {
        enqueueSnackbar(
          useGradeLevelSubjectStore.getState().error || "فشل إلغاء التعيين",
          { variant: "error" }
        );
      }
      handleCloseDeleteDialog();
    }
  };



  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl" dir="rtl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <NavLink to={'..'}><ArrowLeft className="w-4 h-4 ml-2" />العودة</NavLink>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            إدارة المناهج الدراسية (المواد والمعلمين)
          </CardTitle>
          
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label>المرحلة الدراسية</Label>
              <Select 
                value={selectedGradeId.toString()} 
                onValueChange={(value) => setSelectedGradeId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مرحلة..." />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((gl) => (
                    <SelectItem key={gl.id} value={gl.id.toString()}>
                      {gl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleOpenAssignDialog}
                disabled={!selectedGradeId}
                className="w-full"
              >
                <Plus className="w-4 h-4 ml-2" />
                تعيين مادة
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info State */}
          {!loading && !selectedGradeId && (
            <Alert className="mb-4">
              <AlertDescription>
                الرجاء تحديد المرحلة لعرض المواد المعينة.
              </AlertDescription>
            </Alert>
          )}

          {/* Table */}
          {!loading && !error && selectedGradeId && (
            <div className="w-full flex justify-center">
              <div className="w-full border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 text-center">#</TableHead>
                        <TableHead className="min-w-[150px] text-center">المادة الدراسية</TableHead>
                        <TableHead className="w-24 text-center">الرمز</TableHead>
                        <TableHead className="min-w-[150px] text-center">المعلم المسؤول</TableHead>
                        <TableHead className="w-24 text-center">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            لا توجد مواد معينة لهذه المرحلة في هذا العام.
                          </TableCell>
                        </TableRow>
                      )}
                      {assignments.map((assignment, index) => (
                        <TableRow key={assignment.id} className="hover:bg-muted/50">
                          <TableCell className="text-center font-medium text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-center">
                            {assignment.subject?.name ?? "N/A"}
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {assignment.subject?.code ?? "N/A"}
                          </TableCell>
                          <TableCell className="text-center">
                            {assignment.teacher?.name ?? (
                              <span className="text-muted-foreground italic">غير محدد</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEditTeacherDialog(assignment)}>
                                  <Edit className="w-4 h-4 ml-2" />
                                  تغيير المعلم
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleOpenDeleteDialog(assignment)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 ml-2" />
                                  إلغاء التعيين
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Subject Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعيين مادة جديدة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {assignError && (
              <Alert>
                <AlertDescription>{assignError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="subject">المادة الدراسية *</Label>
              <Select 
                value={selectedSubjectId.toString()} 
                onValueChange={(value) => setSelectedSubjectId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مادة..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacher">المعلم المسؤول (اختياري)</Label>
              <Select 
                value={selectedTeacherId?.toString() || ""} 
                onValueChange={(value) => setSelectedTeacherId(value ? Number(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر معلم..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">بدون معلم</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAssignDialog} disabled={assignLoading}>
              إلغاء
            </Button>
            <Button 
              onClick={handleAssignSubject} 
              disabled={assignLoading || !selectedSubjectId}
            >
              {assignLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              تعيين
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={editTeacherDialogOpen} onOpenChange={setEditTeacherDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              تغيير المعلم للمادة "{currentAssignment?.subject?.name}"
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {assignError && (
              <Alert>
                <AlertDescription>{assignError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="teacher">المعلم المسؤول</Label>
              <Select 
                value={selectedTeacherId?.toString() || ""} 
                onValueChange={(value) => setSelectedTeacherId(value ? Number(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر معلم أو اتركه فارغاً..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">بدون معلم</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditTeacherDialog} disabled={assignLoading}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateTeacher} disabled={assignLoading}>
              {assignLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حفظ التغيير
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد إلغاء التعيين</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من إلغاء تعيين المادة "
              {currentAssignment?.subject?.name}" من هذه المرحلة الدراسية لهذا
              العام؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteDialog}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              تأكيد الإلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CurriculumManager;
