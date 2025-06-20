// src/pages/students/StudentView.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  ArrowRight,
  User,
  Upload,
  X,
  Loader2,
} from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
import { imagesUrl } from '@/constants';
import { Gender } from '@/types/student';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import StudentActionPane from '@/components/students/StudentActionPane';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore';

// Helper to display data or placeholder
const displayData = (data: string | number | null | undefined, placeholder = 'غير محدد', suffix = '') => {
    return data ? `${data}${suffix}` : placeholder;
};

// Simple component for displaying info items consistently
const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
        <div className="text-sm font-medium text-muted-foreground">
            {label}:
        </div>
        <div className="col-span-2">
            {typeof value === 'string' || typeof value === 'number' ? (
                <div className="text-sm">{value}</div>
            ) : (
                value
            )}
        </div>
    </div>
);

const StudentView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { enqueueSnackbar } = useSnackbar();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        currentStudent,
        loading,
        error: storeError,
        getStudentById,
        resetCurrentStudent,
        updateStudentPhoto
    } = useStudentStore();

    // State for photo upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        const studentId = parseInt(id ?? '', 10);
        if (!isNaN(studentId)) {
            getStudentById(studentId);
        } else {
            console.error("Invalid Student ID provided in URL");
        }
        return () => resetCurrentStudent();
    }, [id, getStudentById, resetCurrentStudent]);

    // Clear upload state if student changes
    useEffect(() => {
         setSelectedFile(null);
         setIsUploading(false);
         setUploadError(null);
    }, [currentStudent]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
             if (file.size > 2 * 1024 * 1024) { // Max 2MB
                 setUploadError("حجم الملف كبير جداً (الحد الأقصى 2 ميجا).");
                 setSelectedFile(null);
                 if(fileInputRef.current) fileInputRef.current.value = '';
                 return;
             }
            setSelectedFile(file);
            setUploadError(null);
        } else {
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !currentStudent) return;

        setIsUploading(true);
        setUploadError(null);
        const success = await updateStudentPhoto(currentStudent.id, selectedFile);
        setIsUploading(false);

        if (success) {
            enqueueSnackbar('تم تحديث صورة الطالب بنجاح', { variant: 'success' });
            setSelectedFile(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
        } else {
            setUploadError(useStudentStore.getState().error || 'فشل رفع الصورة. حاول مرة أخرى.');
        }
    };
    const { activeAcademicYearId } = useSettingsStore.getState();
    const { enrollments, fetchEnrollments: fetchStudentEnrollments } = useStudentEnrollmentStore();

     // Find the student's enrollment for the active academic year
     const currentEnrollmentRecord = useMemo(() => {
        if (!currentStudent || !activeAcademicYearId) return null;
        // This assumes 'enrollments' in useStudentEnrollmentStore is either global or fetched for this student
        // A more robust way would be a dedicated fetch: getEnrollmentForStudentInYear(studentId, activeAcademicYearId)
        return enrollments.find(
            e => e.student_id === currentStudent.id && e.academic_year_id === activeAcademicYearId
        );
    }, [currentStudent, activeAcademicYearId, enrollments]);


    if (loading && !currentStudent) {
        return (
            <div className="container mx-auto p-6" dir="rtl">
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (storeError) {
        return (
            <div className="container mx-auto p-6" dir="rtl">
                <Alert variant="destructive">
                    <AlertDescription>{storeError}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!currentStudent) {
        return (
            <div className="container mx-auto p-6" dir="rtl">
                <Alert>
                    <AlertDescription>لم يتم العثور على بيانات الطالب.</AlertDescription>
                </Alert>
            </div>
        );
    }
 

    const studentName = currentStudent.student_name || "الطالب";
    const imageUrl = currentStudent.image_url;
    const imagePreviewUrl = selectedFile ? URL.createObjectURL(selectedFile) : imageUrl;

    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="container max-w-screen-xl mx-auto py-6 px-4" dir="rtl" // Wider container for two columns
    >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6"> {/* Main grid for content + action pane */}

            {/* Main Content Area (Student Details) */}
            <div className="lg:col-span-9"> {/* Takes up more space */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">
                            ملف الطالب: {studentName}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <RouterLink to="/students/list">
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                    القائمة
                                </RouterLink>
                            </Button>
                            <Button asChild>
                                <RouterLink to={`/students/${currentStudent.id}/edit`}>
                                    <Edit className="ml-2 h-4 w-4" />
                                    تعديل
                                </RouterLink>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Image & Upload Section */}
                        <div className="md:col-span-1">
                            <div className="flex flex-col items-center space-y-4">
                                <Avatar className="w-40 h-40">
                                    <AvatarImage src={`${imagePreviewUrl}`} alt={studentName} />
                                    <AvatarFallback className="text-4xl">
                                        {studentName.charAt(0) || <User className="w-16 h-16" />}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Hidden Input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full"
                                >
                                    <Upload className="ml-2 h-4 w-4" />
                                    {isUploading ? 'جار الرفع...' : (selectedFile ? 'تأكيد الرفع' : 'تغيير الصورة')}
                                </Button>

                                {selectedFile && !isUploading && (
                                    <Button
                                        onClick={handleUpload}
                                        className="w-full"
                                    >
                                        تأكيد رفع "{selectedFile.name.substring(0, 15)}..."
                                    </Button>
                                )}

                                {isUploading && <Progress value={50} className="w-full" />}
                                
                                {uploadError && (
                                    <Alert variant="destructive" className="w-full">
                                        <AlertDescription className="flex items-center justify-between">
                                            {uploadError}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setUploadError(null)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="md:col-span-3 space-y-6">
                            {/* Basic Info Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">المعلومات الأساسية</h3>
                                <div className="space-y-2">
                                    <InfoItem label="الاسم الكامل" value={displayData(currentStudent.student_name)} />
                                    <InfoItem label="تاريخ الميلاد" value={displayData(currentStudent.date_of_birth)} />
                                    <InfoItem label="الجنس" value={
                                        <Badge variant={currentStudent.gender === Gender.Male ? "info" : "secondary"}>
                                            {displayData(currentStudent.gender)}
                                        </Badge>
                                    } />
                                    <InfoItem label="المرحلة المرغوبة" value={
                                        <Badge variant="outline">
                                            {displayData(currentStudent.wished_level)}
                                        </Badge>
                                    } />
                                    <InfoItem label="الرقم الوطني" value={displayData(currentStudent.goverment_id)} />
                                    <InfoItem label="البريد الإلكتروني" value={displayData(currentStudent.email)} />
                                    <InfoItem label="المدرسة السابقة" value={displayData(currentStudent.referred_school)} />
                                    <InfoItem label="نسبة النجاح السابقة" value={displayData(currentStudent.success_percentage, undefined, '%')} />
                                    <InfoItem label="الحالة الصحية" value={displayData(currentStudent.medical_condition)} />
                                </div>
                            </div>

                            <Separator />

                            {/* Father Info Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">معلومات الأب</h3>
                                <div className="space-y-2">
                                    <InfoItem label="اسم الأب" value={displayData(currentStudent.father_name)} />
                                    <InfoItem label="الوظيفة" value={displayData(currentStudent.father_job)} />
                                    <InfoItem label="الهاتف" value={displayData(currentStudent.father_phone)} />
                                    <InfoItem label="واتساب" value={displayData(currentStudent.father_whatsapp)} />
                                    <InfoItem label="العنوان" value={displayData(currentStudent.father_address)} />
                                </div>
                            </div>

                            <Separator />

                            {/* Mother Info Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">معلومات الأم</h3>
                                <div className="space-y-2">
                                    <InfoItem label="اسم الأم" value={displayData(currentStudent.mother_name)} />
                                    <InfoItem label="الوظيفة" value={displayData(currentStudent.mother_job)} />
                                    <InfoItem label="الهاتف" value={displayData(currentStudent.mother_phone)} />
                                    <InfoItem label="واتساب" value={displayData(currentStudent.mother_whatsapp)} />
                                    <InfoItem label="العنوان" value={displayData(currentStudent.mother_address)} />
                                </div>
                            </div>

                            <Separator />

                            {/* Other Guardian Info Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">ولي الأمر الآخر</h3>
                                <div className="space-y-2">
                                    <InfoItem label="الاسم" value={displayData(currentStudent.other_parent)} />
                                    <InfoItem label="صلة القرابة" value={displayData(currentStudent.relation_of_other_parent)} />
                                    <InfoItem label="الوظيفة" value={displayData(currentStudent.relation_job)} />
                                    <InfoItem label="الهاتف" value={displayData(currentStudent.relation_phone)} />
                                    <InfoItem label="واتساب" value={displayData(currentStudent.relation_whatsapp)} />
                                </div>
                            </div>

                            <Separator />

                            {/* Approval Status Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">حالة القبول</h3>
                                <div className="space-y-2">
                                    <InfoItem label="الحالة" value={
                                        <Badge variant={currentStudent.approved ? "success" : "outline"}>
                                            {currentStudent.approved ? 'مقبول' : 'قيد المراجعة'}
                                        </Badge>
                                    } />
                                    <InfoItem label="تاريخ القبول" value={displayData(currentStudent.aproove_date)} />
                                    <InfoItem label="تم القبول بواسطة (ID)" value={displayData(currentStudent.approved_by_user?.toString())} />
                                    <InfoItem label="تم إرسال رسالة القبول" value={
                                        <Badge variant={currentStudent.message_sent ? "success" : "outline"}>
                                            {currentStudent.message_sent ? 'نعم' : 'لا'}
                                        </Badge>
                                    } />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            </div>
             {/* Action Pane Area */}
             <div className="lg:col-span-3">
                    <StudentActionPane student={currentStudent} currentEnrollmentId={currentEnrollmentRecord?.id} />
                </div>
        </div>
        </motion.div>
    );
};

export default StudentView;