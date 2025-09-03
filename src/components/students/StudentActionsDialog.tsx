import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { Student } from "@/types/student";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';

interface StudentActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent: Student | null;
  onActionClick: (action: string, student: Student) => void;
}

const StudentActionsDialog: React.FC<StudentActionsDialogProps> = ({
  open,
  onOpenChange,
  selectedStudent,
  onActionClick,
}) => {
  const navigate = useNavigate();

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-primary">
            إجراءات الطالب
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
                     {/* Student Info Card */}
           <div className="text-center p-6 border-2 border-dashed border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
             <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer group relative">
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
            
            <h3 className="font-bold text-xl text-foreground mb-2">
              {selectedStudent.student_name}
            </h3>
            
            <div className="flex items-center justify-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-mono">
                {selectedStudent.id}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              {getStatusBadge()}
              {getEnrollmentStatus()}
            </div>
            
            {/* Student Details */}
            <div className="mt-4 space-y-2 text-sm">
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
            {/* View Profile Action */}
            <Button 
              variant="outline" 
              size="lg"
              className="justify-start h-14 text-right hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
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
            
            {/* Edit Action */}
            <Button 
              variant="outline" 
              size="lg"
              className="justify-start h-14 text-right hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
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
    </Dialog>
  );
};

export default StudentActionsDialog;
