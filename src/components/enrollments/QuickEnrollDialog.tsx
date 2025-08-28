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
}

const QuickEnrollDialog: React.FC<QuickEnrollDialogProps> = ({ open, onOpenChange, student, onSuccess }) => {
  const wishedSchoolId = student?.wished_school ?? null;
  const wishedSchoolName = student?.wished_school_details?.name ?? '';

  const { enrollStudent } = useStudentEnrollmentStore();
  const { enqueueSnackbar } = useSnackbar();

  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2024/2025');
  const [selectedGradeLevelId, setSelectedGradeLevelId] = useState<number | ''>('');
  // Fees and discount removed per request
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available academic years
  const availableAcademicYears = [
    "2024/2025",
    "2023/2024", 
    "2022/2023",
    "2021/2022",
    "2020/2021"
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

  // Removed fees auto-fill behavior

  const handleSubmit = async () => {
    if (!student?.id || !wishedSchoolId || !selectedAcademicYear || !selectedGradeLevelId) {
      setFormError('الرجاء اختيار العام والمرحلة بشكل صحيح.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
              await enrollStudent({
          student_id: Number(student.id),
          academic_year: selectedAcademicYear,
          grade_level_id: Number(selectedGradeLevelId),
          classroom_id: null,
        status: 'active',
        school_id: Number(wishedSchoolId),
        // Defaults to satisfy backend schema; inputs removed from UI
        fees: 0,
        discount: 0,
      });
      enqueueSnackbar('تم تسجيل الطالب بنجاح', { variant: 'success' });
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      const err = e as { message?: string };
      enqueueSnackbar(err?.message || 'فشل تسجيل الطالب', { variant: 'error' });
      setFormError(err?.message || 'فشل تسجيل الطالب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>تسجيل الطالب</DialogTitle>
          <DialogDescription>
            المدرسة: {wishedSchoolName || '-'}
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
            تسجيل
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEnrollDialog;


