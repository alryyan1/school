import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DeportationPathApi, DeportationPath } from "@/api/deportationPathApi";
import { EnrollmentApi } from "@/api/enrollmentApi";
import { useSnackbar } from "notistack";
import { Plus } from "lucide-react";
import { Student } from "@/types/student";

interface DeportationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent: Student | null;
  onSuccess?: () => void;
}

const DeportationDialog: React.FC<DeportationDialogProps> = ({
  open,
  onOpenChange,
  selectedStudent,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [deportationType, setDeportationType] = useState<string>('');
  const [deportationPathId, setDeportationPathId] = useState<string>('');
  const [newPathName, setNewPathName] = useState<string>('');
  const [showAddPath, setShowAddPath] = useState(false);
  const [deportationPaths, setDeportationPaths] = useState<DeportationPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchDeportationPaths = useCallback(async () => {
    try {
      setLoading(true);
      const response = await DeportationPathApi.getAll();
      setDeportationPaths(response.data.data || []);
    } catch (error) {
      console.error('Error fetching deportation paths:', error);
      enqueueSnackbar('حدث خطأ أثناء جلب مسارات الترحيل', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Fetch deportation paths when dialog opens
  useEffect(() => {
    if (open) {
      fetchDeportationPaths();
      // Load current enrollment deportation data if exists (use first enrollment like RevenuesPage)
      const firstEnrollment = selectedStudent?.enrollments?.[0];
      if (firstEnrollment) {
        setDeportationType(firstEnrollment.deportation_type || '');
        setDeportationPathId(firstEnrollment.deportation_path_id?.toString() || '');
      } else {
        setDeportationType('');
        setDeportationPathId('');
      }
    } else {
      // Reset form when dialog closes
      setDeportationType('');
      setDeportationPathId('');
      setNewPathName('');
      setShowAddPath(false);
    }
  }, [open, selectedStudent, fetchDeportationPaths]);

  const handleAddNewPath = async () => {
    if (!newPathName.trim()) {
      enqueueSnackbar('يرجى إدخال اسم المسار', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const response = await DeportationPathApi.create(newPathName.trim());
      const newPath = response.data.data;
      setDeportationPaths([...deportationPaths, newPath]);
      setDeportationPathId(newPath.id.toString());
      setNewPathName('');
      setShowAddPath(false);
      enqueueSnackbar('تم إضافة المسار بنجاح', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error creating deportation path:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'حدث خطأ أثناء إضافة المسار';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeportation = async () => {
    // Use first enrollment like RevenuesPage does
    const firstEnrollment = selectedStudent?.enrollments?.[0];

    if (!firstEnrollment) {
      enqueueSnackbar('لا يوجد تسجيل للطالب', { variant: 'error' });
      return;
    }

    if (!deportationType) {
      enqueueSnackbar('يرجى اختيار نوع الترحيل', { variant: 'warning' });
      return;
    }

    if (!deportationPathId) {
      enqueueSnackbar('يرجى اختيار مسار الترحيل', { variant: 'warning' });
      return;
    }

    try {
      setSaving(true);
      await EnrollmentApi.updateDeportation(Number(firstEnrollment.id), {
        deportation: true,
        deportation_type: deportationType as 'داخلي' | 'خارجي',
        deportation_path_id: Number(deportationPathId),
      });
      
      enqueueSnackbar('تم حفظ اشتراك الترحيل بنجاح', { variant: 'success' });
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Error saving deportation:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'حدث خطأ أثناء حفظ اشتراك الترحيل';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">اشتراك في الترحيل</h3>
            <p className="text-sm text-muted-foreground">إدارة اشتراك الطالب في خدمة الترحيل</p>
          </div>

          {/* Deportation Type Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">نوع الترحيل</label>
            <Select value={deportationType} onValueChange={setDeportationType}>
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="اختر نوع الترحيل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="داخلي">داخلي</SelectItem>
                <SelectItem value="خارجي">خارجي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deportation Path Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-right block">مسار الترحيل</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddPath(!showAddPath)}
                className="text-xs"
              >
                <Plus className="w-3 h-3 ml-1" />
                {showAddPath ? 'إلغاء' : 'إضافة مسار جديد'}
              </Button>
            </div>
            
            {showAddPath && (
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="أدخل اسم المسار الجديد"
                  value={newPathName}
                  onChange={(e) => setNewPathName(e.target.value)}
                  className="text-right"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPathName.trim() && !loading) {
                      handleAddNewPath();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddNewPath}
                  disabled={loading}
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة'}
                </Button>
              </div>
            )}

            <Select value={deportationPathId} onValueChange={setDeportationPathId} disabled={loading}>
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder={loading ? "جاري التحميل..." : "اختر مسار الترحيل"} />
              </SelectTrigger>
              <SelectContent>
                {deportationPaths.map((path) => (
                  <SelectItem key={path.id} value={path.id.toString()}>
                    {path.name}
                  </SelectItem>
                ))}
                {!loading && deportationPaths.length === 0 && (
                  <SelectItem value="no-paths" disabled>
                    لا توجد مسارات متاحة
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSaveDeportation}
              disabled={!deportationType || !deportationPathId || saving}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeportationDialog;

