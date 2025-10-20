import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSnackbar } from 'notistack';

import { Student } from '@/types/student';
import { GradeLevel } from '@/types/gradeLevel';
import { SchoolApi } from '@/api/schoolApi';
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore';

interface QuickEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSuccess: () => void;
  editMode?: boolean; // New prop to indicate if we're editing existing enrollment
  enrollmentId?: number; // ID of enrollment to edit (if in edit mode)
}

const QuickEnrollDialog: React.FC<QuickEnrollDialogProps> = ({ 
  open, 
  onOpenChange, 
  student, 
  onSuccess, 
  editMode = false, 
  enrollmentId 
}) => {
  const wishedSchoolId = student?.wished_school ?? null;
  const wishedSchoolName = student?.wished_school_details?.name ?? '';

  const { enrollStudent, updateEnrollment } = useStudentEnrollmentStore();
  const { enqueueSnackbar } = useSnackbar();

  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2025/2026');
  const [selectedGradeLevelId, setSelectedGradeLevelId] = useState<number | ''>('');
  // Fees and discount removed per request
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available academic years
  const availableAcademicYears = [
    "2025/2026",
  ];

  // Load lists when opening
  useEffect(() => {
    if (!open || !wishedSchoolId) return;
    setFormError(null);
    // Fetch assigned grade levels
    setLoadingGrades(true);
    SchoolApi.getAssignedGradeLevels(wishedSchoolId)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : resp.data.data;
        setGradeLevels(data || []);
      })
      .catch((err) => {
        console.error('Failed to load grade levels', err);
        setGradeLevels([]);
      })
      .finally(() => setLoadingGrades(false));
  }, [open, wishedSchoolId]);

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (editMode && student?.enrollments && student.enrollments.length > 0) {
      const enrollment = student.enrollments.find(e => e.id === enrollmentId) || student.enrollments[0];
      console.log(enrollment,'enrollment')
      if (enrollment) {
        setSelectedAcademicYear(enrollment.academic_year);
        setSelectedGradeLevelId(enrollment.grade_level.id);
      }
    } else if (!editMode) {
      // Reset form for new enrollment
      setSelectedAcademicYear('2025/2026');
      setSelectedGradeLevelId('');
    }
  }, [editMode, student, enrollmentId]);

  // Removed fees auto-fill behavior

  const handleSubmit = async () => {
    if (!student?.id || !wishedSchoolId || !selectedAcademicYear || !selectedGradeLevelId) {
      setFormError('الرجاء اختيار العام والمرحلة بشكل صحيح.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editMode && enrollmentId) {
        // Update existing enrollment
        await updateEnrollment(enrollmentId, {
          grade_level_id: Number(selectedGradeLevelId),
          academic_year: selectedAcademicYear,
        });
        enqueueSnackbar('تم تحديث تسجيل الطالب بنجاح', { variant: 'success' });
      } else {
        // Create new enrollment
        await enrollStudent({
          student_id: Number(student.id),
          academic_year: selectedAcademicYear,
          grade_level_id: Number(selectedGradeLevelId),
          classroom_id: null,
          status: 'active',
          school_id: Number(wishedSchoolId),
          enrollment_type: 'regular',
          // Fees will be automatically set by backend based on school's annual_fees
          discount: 0,
        });
        enqueueSnackbar('تم تسجيل الطالب بنجاح', { variant: 'success' });
      }
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      const err = e as { message?: string };
      const errorMessage = editMode ? 'فشل تحديث تسجيل الطالب' : 'فشل تسجيل الطالب';
      enqueueSnackbar(err?.message || errorMessage, { variant: 'error' });
      setFormError(err?.message || errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editMode ? 'تعديل تسجيل الطالب' : 'تسجيل الطالب'}</DialogTitle>
          <DialogDescription>
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-center">
                الطالب: {student?.student_name || '-'}
              </div>
              <div className="text-sm text-muted-foreground">
                المدرسة: {wishedSchoolName || '-'}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {formError && (
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>المرحلة الدراسية *</Label>
            <Select
              value={selectedGradeLevelId === '' ? '' : String(selectedGradeLevelId)}
              onValueChange={(val) => setSelectedGradeLevelId(val ? Number(val) : '')}
              disabled={loadingGrades}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingGrades ? 'جاري تحميل المراحل...' : 'اختر المرحلة...'} />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels.map(gl => (
                  <SelectItem key={gl.id} value={String(gl.id)}>
                    {gl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>العام الدراسي *</Label>
            <Select
              value={selectedAcademicYear}
              onValueChange={(val) => setSelectedAcademicYear(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر العام..." />
              </SelectTrigger>
              <SelectContent>
                {availableAcademicYears.map(ay => (
                  <SelectItem key={ay} value={ay}>
                    {ay}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fees and discount inputs removed */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedAcademicYear || !selectedGradeLevelId}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editMode ? 'تحديث' : 'تسجيل'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEnrollDialog;


