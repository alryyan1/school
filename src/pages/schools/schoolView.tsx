// src/pages/schools/SchoolView.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator"; // For dividers
import { cn } from "@/lib/utils";

// lucide-react icons
import { Edit3, ArrowRight, Building, Phone, User, CalendarDays, AlertCircle } from 'lucide-react';

import { useSchoolStore } from '@/stores/schoolStore';   // Adjust path
import dayjs from 'dayjs'; // For date formatting
import { webUrl } from '@/constants';

const displayData = (data: string | number | null | undefined, placeholder = 'غير محدد', suffix = '') => {
    return data ? `${data}${suffix}` : placeholder;
};

// Simple component for displaying info items consistently
const InfoItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ElementType, iconClass?: string }> = ({ label, value, icon: Icon, iconClass }) => (
    <div className="flex items-start space-x-3 space-x-reverse"> {/* RTL space */}
        {Icon && <Icon className={cn("h-5 w-5 mt-1 text-muted-foreground", iconClass)} />}
        <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base text-foreground">
                {typeof value === 'string' || typeof value === 'number' ? value : value}
            </p>
        </div>
    </div>
);

const SchoolView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const schoolId = Number(id);

    const { currentSchool, loading, error, getSchoolById, resetCurrentSchool } = useSchoolStore();

    useEffect(() => {
        if (schoolId) {
            getSchoolById(schoolId);
        }
        return () => resetCurrentSchool();
    }, [schoolId, getSchoolById, resetCurrentSchool]);


    if (loading && !currentSchool) { // Show skeleton only on initial load
        return (
            <div className="container max-w-3xl mx-auto py-8 px-4" dir="rtl">
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <Skeleton className="h-8 w-3/5" />
                        <Skeleton className="h-10 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex items-center space-x-6 space-x-reverse">
                             <Skeleton className="h-24 w-24 rounded-md" />
                             <div className="space-y-2 flex-1">
                                 <Skeleton className="h-6 w-4/5" />
                                 <Skeleton className="h-4 w-2/5" />
                             </div>
                        </div>
                        <Separator />
                        {[...Array(4)].map((_, i) => (
                             <div key={i} className="space-y-2">
                                 <Skeleton className="h-4 w-1/4" />
                                 <Skeleton className="h-5 w-3/4" />
                             </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
             <div className="container max-w-3xl mx-auto py-8 px-4" dir="rtl">
                <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>خطأ</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
                <Button variant="outline" onClick={() => navigate('/schools/list')} className="mt-4"><ArrowRight className="ml-2 h-4 w-4"/>العودة للقائمة</Button>
             </div>
        );
    }

    if (!currentSchool) {
        return (
             <div className="container max-w-3xl mx-auto py-8 px-4" dir="rtl">
                <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>تنبيه</AlertTitle><AlertDescription>لم يتم العثور على بيانات المدرسة.</AlertDescription></Alert>
                <Button variant="outline" onClick={() => navigate('/schools/list')} className="mt-4"><ArrowRight className="ml-2 h-4 w-4"/>العودة للقائمة</Button>
             </div>
        );
    }
  console.log(currentSchool, 'currentSchool')
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container max-w-3xl mx-auto py-8 px-4" dir="rtl"
        >
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                    <div>
                        <CardTitle className="text-2xl font-bold">{currentSchool.name}</CardTitle>
                        <CardDescription>الرمز: {currentSchool.code}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/schools/list')}>
                            <ArrowRight className="ml-2 h-4 w-4" /> العودة للقائمة
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/schools/${currentSchool.id}/edit`)}>
                            <Edit3 className="ml-2 h-4 w-4" /> تعديل
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* Logo Section */}
                        <div className="md:col-span-1 flex flex-col items-center">
                            <Avatar className="h-32 w-32 rounded-md mb-4 border">
                                <AvatarImage src={`${webUrl}${currentSchool.logo_url ?? undefined}`} alt={currentSchool.name} />
                                <AvatarFallback><Building className="h-16 w-16 text-muted-foreground" /></AvatarFallback>
                            </Avatar>
                             {/* You can add other summary info here if needed */}
                        </div>

                        {/* Details Section */}
                        <div className="md:col-span-2 grid gap-y-5">
                            <InfoItem label="العنوان" value={displayData(currentSchool.address)} icon={Building} />

                            <InfoItem label="رقم الهاتف" value={
                                <a href={`tel:${currentSchool.phone}`} className="hover:underline text-primary">
                                    {displayData(currentSchool.phone)}
                                </a>
                            } icon={Phone} />
                            <InfoItem label="اسم المدير" value={displayData(currentSchool.principal_name)} icon={User} />
                            <InfoItem label="تاريخ التأسيس" value={displayData(currentSchool.establishment_date ? dayjs(currentSchool.establishment_date).format('DD / MMMM / YYYY') : null)} icon={CalendarDays} />
                            <InfoItem label="الرسوم السنوية" value={
                                currentSchool.annual_fees ? (
                                    <span className="font-mono text-green-600 dark:text-green-400">
                                        {currentSchool.annual_fees.toLocaleString('en-US')} جنيه
                                    </span>
                                ) : (
                                    'غير محدد'
                                )
                            } icon={Building} />
                             {/* <InfoItem label="الحالة" value={
                                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", currentSchool.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400")}>
                                    {currentSchool.is_active ? "نشطة" : "غير نشطة"}
                                </span>
                            } icon={currentSchool.is_active ? CheckCircle2 : XCircle} /> */}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                    <p className="text-xs text-muted-foreground">
                        آخر تحديث: {displayData(currentSchool.updated_at ? dayjs(currentSchool.updated_at).format('DD MMM YYYY, hh:mm A') : null)}
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default SchoolView;