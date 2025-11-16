import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Eye,
  Edit3,
  CheckCircle2,
  Mail,
  User,
  GraduationCap,
  Shield,
  Calendar,
  Hash,
  BookOpen,
  Trash2,
  Truck,
  Plus,
} from "lucide-react";
import { Student } from "@/types/student";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { EnrollmentType } from "@/types/enrollment";
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
import { useEffect, useCallback } from "react";

interface StudentActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent: Student | null;
  onActionClick: (action: string, student: Student, enrollmentType?: EnrollmentType) => void;
}

const StudentActionsDialog: React.FC<StudentActionsDialogProps> = ({
  open,
  onOpenChange,
  selectedStudent,
  onActionClick,
}) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transportDialogOpen, setTransportDialogOpen] = useState(false);
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
    if (transportDialogOpen) {
      fetchDeportationPaths();
      // Load current enrollment deportation data if exists
      const activeEnrollment = selectedStudent?.enrollments?.find(
        enrollment => enrollment.status === 'active'
      );
      if (activeEnrollment) {
        setDeportationType(activeEnrollment.deportation_type || '');
        setDeportationPathId(activeEnrollment.deportation_path_id?.toString() || '');
      }
    } else {
      // Reset form when dialog closes
      setDeportationType('');
      setDeportationPathId('');
      setNewPathName('');
      setShowAddPath(false);
    }
  }, [transportDialogOpen, selectedStudent, fetchDeportationPaths]);

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
    const activeEnrollment = selectedStudent?.enrollments?.find(
      enrollment => enrollment.status === 'active'
    );

    if (!activeEnrollment) {
      enqueueSnackbar('لا يوجد تسجيل نشط للطالب', { variant: 'error' });
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
      await EnrollmentApi.updateDeportation(Number(activeEnrollment.id), {
        deportation: true,
        deportation_type: deportationType as 'داخلي' | 'خارجي',
        deportation_path_id: Number(deportationPathId),
      });
      
      enqueueSnackbar('تم حفظ اشتراك الترحيل بنجاح', { variant: 'success' });
      setTransportDialogOpen(false);
      // Refresh student data by calling the action
      onActionClick('refresh', selectedStudent);
    } catch (error: unknown) {
      console.error('Error saving deportation:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'حدث خطأ أثناء حفظ اشتراك الترحيل';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!selectedStudent) return null;

  const getStatusBadge = () => {
    if (selectedStudent.approved) {
      return (
        <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-200">
          <CheckCircle2 className="w-3 h-3 ml-1" />
          مقبول
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
        <Mail className="w-3 h-3 ml-1" />
        في انتظار القبول
      </Badge>
    );
  };

  const getEnrollmentStatus = () => {
    if (selectedStudent.enrollments && selectedStudent.enrollments.length > 0) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
          <GraduationCap className="w-3 h-3 ml-1" />
          مسجل
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <User className="w-3 h-3 ml-1" />
        غير مسجل
      </Badge>
    );
  };

  const handleEnrollmentTypeChange = (value: string) => {
    const enrollmentType = value as EnrollmentType;
    onActionClick('change-enrollment-type', selectedStudent, enrollmentType);
  };

  const handleDashboardClick = () => {
    // Find the first active enrollment
    const activeEnrollment = selectedStudent.enrollments?.find(
      enrollment => enrollment.status === 'active'
    );
    
    if (activeEnrollment) {
      // Navigate to the enrollment dashboard
      navigate(`/students/${selectedStudent.id}/enrollments/${activeEnrollment.id}/dashboard`);
      onOpenChange(false); // Close the dialog
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl sm:max-w-5xl md:max-w-5xl lg:max-w-5xl">
       
        
        <div className="space-y-6">
                     {/* Student Info Card */}
           <div className="text-center p-6 border-2 border-dashed border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
            <h3 className="font-bold text-xl text-foreground mb-4">
              {selectedStudent.student_name}
            </h3>
            
            {/* Image, ID, and Enrollment Type Row */}
            <div className="flex items-center justify-between gap-4 mb-4">
              {/* Left: Enrollment Type */}
              <div className="flex-1 flex justify-start">
                {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 ? (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">نوع التسجيل</div>
                    <Select 
                      value={selectedStudent.enrollments[0]?.enrollment_type || 'regular'} 
                      onValueChange={handleEnrollmentTypeChange}
                    >
                      <SelectTrigger className="w-32 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            عادي
                          </div>
                        </SelectItem>
                        <SelectItem value="scholarship">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            منحة
                          </div>
                        </SelectItem>
                        <SelectItem value="free">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            إعفاء
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
              
              {/* Center: Student ID */}
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xl font-bold text-foreground font-mono">
                    {selectedStudent.id}
                  </span>
                </div>
              </div>
              
              {/* Right: Image */}
              <div className="flex-1 flex justify-end">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer group relative">
                  {selectedStudent.image_url ? (
                    <>
                      <img 
                        src={selectedStudent.image_url} 
                        alt={selectedStudent.student_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                        onClick={() => window.open(selectedStudent.image_url, '_blank')}
                      />
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none"></div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3 h-3 text-white" />
                      </div>
                    </>
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-primary ${selectedStudent.image_url ? 'hidden' : ''}`}>
                    <User className="w-10 h-10 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              {getStatusBadge()}
              {getEnrollmentStatus()}
            </div>
            
            {/* Student Details */}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm flex-wrap">
              {/* School Information */}
              {selectedStudent.wished_school_details && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="font-medium text-foreground">
                    {selectedStudent.wished_school_details.name}
                  </span>
                </div>
              )}
              
              {/* Grade Level */}
              {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 && selectedStudent.enrollments[0]?.grade_level?.name && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="font-medium text-foreground">
                    الصف: {selectedStudent.enrollments[0].grade_level.name}
                  </span>
                </div>
              )}
              
              {/* Classroom Information */}
              {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <span className="font-medium text-foreground">
                    الفصل: {selectedStudent.enrollments[0]?.classroom?.name || 'غير محدد'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions Grid */}
          <div className="grid gap-3">
            {/* View Profile and Transport Subscription Row */}
            <div className="flex items-center gap-3">
              {/* View Profile Action */}
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 justify-start h-14 text-right hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                onClick={() => onActionClick('view', selectedStudent)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-foreground">عرض الملف الشخصي</div>
                    <div className="text-xs text-muted-foreground">عرض كافة بيانات الطالب</div>
                  </div>
                </div>
              </Button>
              
              {/* Transport Subscription Action - Only show if student has enrollment */}
              {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 justify-start h-14 text-right hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                  onClick={() => setTransportDialogOpen(true)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="font-semibold text-foreground">اشتراك في الترحيل</div>
                      <div className="text-xs text-muted-foreground">إدارة اشتراك الطالب في خدمة الترحيل</div>
                    </div>
                  </div>
                </Button>
              )}
            </div>
            
            {/* Enroll Action - Only show if approved and not enrolled */}
            {selectedStudent.approved && (!selectedStudent.enrollments || selectedStudent.enrollments.length === 0) ? (
              <Button 
                variant="outline" 
                size="lg"
                className="justify-start h-14 text-right hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                onClick={() => onActionClick('enroll', selectedStudent)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-foreground">تسجيل الطالب</div>
                    <div className="text-xs text-muted-foreground">إضافة الطالب إلى فصل دراسي</div>
                  </div>
                </div>
              </Button>
            ) : ''}
            
            {/* Edit Actions Row */}
            <div className="flex items-center gap-3">
              {/* Edit Data Button */}
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 justify-start h-14 text-right hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
                onClick={() => onActionClick('edit', selectedStudent)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-foreground">تعديل البيانات</div>
                    <div className="text-xs text-muted-foreground">تعديل معلومات الطالب</div>
                  </div>
                </div>
              </Button>
              
              {/* Edit Grade Level Button - Only show if student has enrollment */}
              {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 justify-start h-14 text-right hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                  onClick={() => onActionClick('edit-grade-level', selectedStudent)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="font-semibold text-foreground">تعديل الصف الدراسي</div>
                      <div className="text-xs text-muted-foreground">تغيير مستوى الصف للطالب</div>
                    </div>
                  </div>
                </Button>
              )}
              
              {/* Delete Button */}
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 justify-start h-14 text-right hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-foreground">حذف الطالب</div>
                    <div className="text-xs text-muted-foreground">حذف الطالب وجميع البيانات المرتبطة</div>
                  </div>
                </div>
              </Button>
            </div>
            
            {/* Accept Action - Only show if not approved */}
            {!selectedStudent.approved ? (
              <Button 
                variant="outline" 
                size="lg"
                className="justify-start h-14 text-right hover:bg-teal-50 hover:border-teal-300 transition-all duration-200"
                onClick={() => onActionClick('accept', selectedStudent)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-foreground">قبول الطالب</div>
                    <div className="text-xs text-muted-foreground">الموافقة على طلب التسجيل</div>
                  </div>
                </div>
              </Button>
            ) : null}
            
            {/* Dashboard Link Action - Only show if student has active enrollment */}
            {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 && (
              <Button 
                variant="outline" 
                size="lg"
                className="justify-start h-14 text-right hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                onClick={handleDashboardClick}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-foreground">لوحة التحكم</div>
                    <div className="text-xs text-muted-foreground">عرض لوحة تحكم التسجيل</div>
                  </div>
                </div>
              </Button>
            )}
          </div>
          
          {/* Additional Info */}
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                تاريخ التسجيل: {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Transport Subscription Dialog */}
      <Dialog open={transportDialogOpen} onOpenChange={setTransportDialogOpen}>
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
                  setTransportDialogOpen(false);
                  setDeportationType('');
                  setDeportationPathId('');
                  setNewPathName('');
                  setShowAddPath(false);
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حذف الطالب</AlertDialogTitle>
            <AlertDialogDescription className="text-right space-y-3">
              <p className="font-semibold text-foreground">
                هل أنت متأكد من حذف الطالب <span className="text-primary">{selectedStudent.student_name}</span>؟
              </p>
              <p className="text-sm text-muted-foreground">
                سيتم حذف جميع البيانات المرتبطة بالطالب بشكل دائم ولا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-800 mb-2 text-sm">البيانات التي سيتم حذفها:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700 text-right">
                  <li>بيانات الطالب الأساسية</li>
                  <li>جميع التسجيلات (Enrollments)</li>
                  <li>سجل الدفاتر المالية (Student Ledgers)</li>
                  <li>المدفوعات المالية (Fee Payments)</li>
                  <li>سجل الحضور والغياب (Absences)</li>
                  <li>الملاحظات (Notes)</li>
                  <li>التحذيرات (Warnings)</li>
                  <li>سجل النقل (Transport Assignments)</li>
                  <li>سجل المعاملات المالية (Payment Transactions)</li>
                  <li>سجل التسجيلات (Enrollment Logs)</li>
                  <li>نتائج الامتحانات المرتبطة (Exam Results)</li>
                  <li>صورة الطالب</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onActionClick('delete', selectedStudent);
                setDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default StudentActionsDialog;
