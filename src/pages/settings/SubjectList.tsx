// src/pages/settings/SubjectList.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Edit, Trash2, ArrowLeft, MoreHorizontal } from "lucide-react";
import { useSubjectStore } from "@/stores/subjectStore";
import SubjectFormDialog from "@/components/settings/SubjectFormDialog";
import { Subject } from "@/types/subject";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";

const SubjectList: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { subjects, loading, error, fetchSubjects, deleteSubject } =
    useSubjectStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleOpenForm = (subject?: Subject) => {
    setEditingSubject(subject || null);
    setFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingSubject(null);
  };

  const handleOpenDeleteDialog = (subject: Subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setSubjectToDelete(null);
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteConfirm = async () => {
    if (subjectToDelete) {
      const success = await deleteSubject(subjectToDelete.id);
      if (success) {
        enqueueSnackbar("تم حذف المادة بنجاح", { variant: "success" });
      } else {
        enqueueSnackbar(useSubjectStore.getState().error || "فشل حذف المادة", {
          variant: "error",
        });
      }
      handleCloseDeleteDialog();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">المواد الدراسية</h1>
        <div className="flex gap-2 items-center">
          <Button onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة مادة
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

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

      {/* Table */}
      {!loading && !error && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">اسم المادة</TableHead>
                  <TableHead className="text-center">الرمز</TableHead>
                  <TableHead className="text-center">الوصف</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      لا توجد مواد دراسية لعرضها.
                    </TableCell>
                  </TableRow>
                )}
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium text-center">
                      {subject.name}
                    </TableCell>
                    <TableCell className="text-center">{subject.code}</TableCell>
                    <TableCell className="max-w-[350px] truncate text-center">
                      {subject.description || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenForm(subject)}>
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleOpenDeleteDialog(subject)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <SubjectFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        initialData={editingSubject}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف المادة "{subjectToDelete?.name}"؟ تأكد من عدم
              ارتباطها بمعلمين أو مقررات.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteDialog}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectList;
