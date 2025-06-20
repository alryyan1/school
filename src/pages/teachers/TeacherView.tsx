// src/components/teachers/TeacherView.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// lucide-react icons
import { Edit, ArrowLeft, User, AlertCircle, Calendar, Mail, Phone, MapPin, GraduationCap, Briefcase } from 'lucide-react';

import { useTeacherStore } from '@/stores/teacherStore';

// Helper function to display data or a placeholder
const displayData = (data: string | null | undefined, placeholder = 'غير محدد') => {
    return data || placeholder;
};

const TeacherView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        currentTeacher,
        loading,
        error,
        getTeacherById,
        resetCurrentTeacher
    } = useTeacherStore();

    useEffect(() => {
        const teacherId = parseInt(id ?? '', 10);
        if (!isNaN(teacherId)) {
            getTeacherById(teacherId);
        } else {
            console.error("Invalid Teacher ID provided in URL");
            navigate('/teachers/list');
        }
        return () => resetCurrentTeacher(); // Cleanup
    }, [id, getTeacherById, resetCurrentTeacher, navigate]);

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-8 px-4" dir="rtl">
                <div className="space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-4">
                                    <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                                    <Skeleton className="h-6 w-20 mx-auto" />
                                </div>
                                <div className="md:col-span-3 space-y-4">
                                    {[...Array(8)].map((_, i) => (
                                        <Skeleton key={i} className="h-4 w-full" />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-4xl mx-auto py-8 px-4" dir="rtl">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!currentTeacher) {
        return (
            <div className="container max-w-4xl mx-auto py-8 px-4" dir="rtl">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>تحذير</AlertTitle>
                    <AlertDescription>لم يتم العثور على المدرس.</AlertDescription>
                </Alert>
            </div>
        );
    }

    const teacherName = currentTeacher.data.name || "مدرس";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container max-w-4xl mx-auto py-8 px-4"
            dir="rtl"
        >
            {/* Header with navigation */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">ملف المدرس: {currentTeacher.data.name}</h1>
                <div className="flex gap-2">
                        <Button
                        variant="outline"
                        onClick={() => navigate('/teachers/list')}
                    >
                        <ArrowLeft className="ml-2 h-4 w-4" />
                            العودة للقائمة
                        </Button>
                        <Button
                        onClick={() => navigate(`/teachers/${currentTeacher.data.id}/edit`)}
                        >
                        <Edit className="ml-2 h-4 w-4" />
                            تعديل
                        </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">معلومات المدرس</CardTitle>
                    <CardDescription>
                        عرض تفصيلي لبيانات المدرس ومعلوماته الشخصية والوظيفية
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Profile Image Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-32 w-32">
                                <AvatarImage 
                                    src={currentTeacher.data.photo_url || undefined} 
                            alt={teacherName}
                                />
                                <AvatarFallback className="text-2xl">
                                    <User className="h-16 w-16" />
                                </AvatarFallback>
                            </Avatar>
                            <Badge 
                                variant={currentTeacher.data.is_active ? "default" : "secondary"}
                                className={currentTeacher.data.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}
                            >
                                {currentTeacher.data.is_active ? 'الحساب نشط' : 'الحساب غير نشط'}
                            </Badge>
                        </div>

                    {/* Details Section */}
                        <div className="md:col-span-3 space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <User className="ml-2 h-5 w-5" />
                                    المعلومات الأساسية
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">الاسم الكامل</p>
                                        <p className="text-sm">{displayData(currentTeacher.data.name)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">الرقم الوطني</p>
                                        <p className="text-sm">{displayData(currentTeacher.data.national_id)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center">
                                            <Mail className="ml-1 h-4 w-4" />
                                            البريد الإلكتروني
                                        </p>
                                        <p className="text-sm">{displayData(currentTeacher.data.email)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center">
                                            <Phone className="ml-1 h-4 w-4" />
                                            رقم الهاتف
                                        </p>
                                        <p className="text-sm">{displayData(currentTeacher.data.phone)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">الجنس</p>
                                        <p className="text-sm">{displayData(currentTeacher.data.gender)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center">
                                            <Calendar className="ml-1 h-4 w-4" />
                                            تاريخ الميلاد
                                        </p>
                                        <p className="text-sm">
                                            {currentTeacher.data.birth_date 
                                                ? dayjs(currentTeacher.data.birth_date).format('DD/MM/YYYY')
                                                : 'غير محدد'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Professional Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Briefcase className="ml-2 h-5 w-5" />
                                    المعلومات الوظيفية
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center">
                                            <GraduationCap className="ml-1 h-4 w-4" />
                                            المؤهل العلمي
                                        </p>
                                        <p className="text-sm">{displayData(currentTeacher.data.qualification)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center">
                                            <Calendar className="ml-1 h-4 w-4" />
                                            تاريخ التعيين
                                        </p>
                                        <p className="text-sm">
                                            {currentTeacher.data.hire_date 
                                                ? dayjs(currentTeacher.data.hire_date).format('DD/MM/YYYY')
                                                : 'غير محدد'
                                            }
                                        </p>
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center">
                                            <MapPin className="ml-1 h-4 w-4" />
                                            العنوان
                                        </p>
                                        <p className="text-sm">{displayData(currentTeacher.data.address)}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* System Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">معلومات النظام</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</p>
                                        <p className="text-sm text-muted-foreground">
                                            {currentTeacher.data.created_at 
                                                ? dayjs(currentTeacher.data.created_at).format('DD/MM/YYYY hh:mm A')
                                                : 'غير محدد'
                                            }
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">آخر تحديث</p>
                                        <p className="text-sm text-muted-foreground">
                                            {currentTeacher.data.updated_at 
                                                ? dayjs(currentTeacher.data.updated_at).format('DD/MM/YYYY hh:mm A')
                                                : 'غير محدد'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TeacherView;