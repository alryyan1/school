import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSnackbar } from 'notistack';

import { Student } from '@/types/student';
import { AcademicYear } from '@/types/academicYear';
import { GradeLevel } from '@/types/gradeLevel';
import { useAcademicYearStore } from '@/stores/academicYearStore';
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

  const { academicYears, fetchAcademicYears, loading: loadingYears } = useAcademicYearStore();
  const { enrollStudent } = useStudentEnrollmentStore();
  const { enqueueSnackbar } = useSnackbar();

  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | ''>('');
  const [selectedGradeLevelId, setSelectedGradeLevelId] = useState<number | ''>('');
  const [fees, setFees] = useState<number | string>('');
  const [discount, setDiscount] = useState<number | string>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter academic years for wished school only
  const schoolYears = useMemo<AcademicYear[]>(() =>
    academicYears.filter(ay => ay.school_id === wishedSchoolId),
    [academicYears, wishedSchoolId]
  );

  // Determine latest academic year by end_date then start_date
  const defaultYearId = useMemo(() => {
    if (schoolYears.length === 0) return '';
    const sorted = [...schoolYears].sort((a, b) => {
      const aEnd = a.end_date || '';
      const bEnd = b.end_date || '';
      if (aEnd === bEnd) return (a.start_date || '').localeCompare(b.start_date || '');
      return aEnd.localeCompare(bEnd);
    });
    return sorted[sorted.length - 1]?.id ?? '';
  }, [schoolYears]);

  // Load lists when opening
  useEffect(() => {
    if (!open || !wishedSchoolId) return;
    setFormError(null);
    // Fetch school academic years
    fetchAcademicYears(wishedSchoolId);
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
  }, [open, wishedSchoolId, fetchAcademicYears]);

  // Initialize defaults when data is ready
  useEffect(() => {
    if (!open) return;
    // Academic year default
    if (selectedAcademicYearId === '' && defaultYearId !== '') {
      setSelectedAcademicYearId(defaultYearId);
    }
  }, [open, defaultYearId, selectedAcademicYearId]);

  // When academic year changes, default fees to academic year's enrollment_fee
  useEffect(() => {
    if (!selectedAcademicYearId) return;
    const ay = schoolYears.find(y => y.id === Number(selectedAcademicYearId));
    if (ay && ay.enrollment_fee != null) {
      setFees(ay.enrollment_fee);
    }
  }, [selectedAcademicYearId, schoolYears]);

  const handleSubmit = async () => {
    if (!student?.id || !wishedSchoolId || !selectedAcademicYearId || !selectedGradeLevelId) {
      setFormError('الرجاء اختيار العام والمرحلة بشكل صحيح.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await enrollStudent({
        student_id: Number(student.id),
        academic_year_id: Number(selectedAcademicYearId),
        grade_level_id: Number(selectedGradeLevelId),
        classroom_id: null,
        status: 'active',
        school_id: Number(wishedSchoolId),
        fees: Number(fees) || 0,
        discount: Number(discount) || 0,
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
              value={selectedAcademicYearId === '' ? '' : String(selectedAcademicYearId)}
              onValueChange={(val) => setSelectedAcademicYearId(val ? Number(val) : '')}
              disabled={loadingYears}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingYears ? 'جاري تحميل الأعوام...' : 'اختر العام...'} />
              </SelectTrigger>
              <SelectContent>
                {schoolYears.map(ay => (
                  <SelectItem key={ay.id} value={String(ay.id)}>
                    {ay.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fees_input">الرسوم *</Label>
            <Input
              id="fees_input"
              type="number"
              value={fees === '' ? '' : String(fees)}
              onChange={(e) => setFees(e.target.value)}
              placeholder="مثال: 5000"
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_input">الخصم</Label>
            <Input
              id="discount_input"
              type="number"
              value={discount === '' ? '' : String(discount)}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="مثال: 500"
              min={0}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedAcademicYearId || !selectedGradeLevelId}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            تسجيل
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEnrollDialog;


