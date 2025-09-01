// src/components/schools/SchoolForm.tsx (or pages/schools/SchoolFormPage.tsx)
import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Optional for page animations
import dayjs from 'dayjs';
import 'dayjs/locale/ar'; // For Arabic date formatting if needed by calendar
dayjs.locale('ar'); // Set global locale for dayjs

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// lucide-react icons
import { Upload, Building, XCircle, Save, ArrowRight, AlertCircle, AlertCircleIcon } from 'lucide-react';

import { useSchoolStore } from '@/stores/schoolStore';   // Adjust path
import { School, SchoolFormData } from '@/types/school'; // Adjust path
import { useSnackbar } from 'notistack'; // Still good for general notifications
import { CircularProgress } from '@mui/material';
import { User, UserApi } from '@/api/userApi';

const SchoolForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const isEditMode = !!id;
    const schoolId = id ? Number(id) : undefined;

    const { createSchool, updateSchool, getSchoolById, currentSchool, error: storeError, resetCurrentSchool } = useSchoolStore();

    const [isFetchingData, setIsFetchingData] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<SchoolFormData>({
        defaultValues: {
            name: '', code: 'sch-0000', address: ' -', phone: '', email: '-',
            principal_name: null, establishment_date: null, logo: null, logo_path: null, user_id: null, annual_fees: null
        }
    });

    const watchedLogo = watch('logo');

    // Fetch data in Edit Mode
    useEffect(() => {
        if (isEditMode && schoolId) {
            const fetchData = async () => {
                setIsFetchingData(true);
                resetCurrentSchool(); // Clear previous if any
                const schoolData = await getSchoolById(schoolId); // Assuming store updates currentSchool
                setIsFetchingData(false);
                if (!schoolData) { // Handle case where school not found
                    enqueueSnackbar('المدرسة المطلوبة غير موجودة', { variant: 'error'});
                    navigate('/schools/list');
                }
            };
            fetchData();
        } else {
            reset({ // Default for create mode
                name: '', code: '', address: '', phone: '', email: '',
                principal_name: null, establishment_date: null, logo: null, logo_path: null, user_id: null, annual_fees: null
            });
            setLogoPreview(null);
        }
        return () => resetCurrentSchool(); // Cleanup
    }, [schoolId, isEditMode, getSchoolById, reset, resetCurrentSchool, enqueueSnackbar, navigate]);

    // Populate form when currentSchool data arrives (for edit mode)
    useEffect(() => {
        if (isEditMode && currentSchool && currentSchool.id === schoolId) {
            reset({
                ...currentSchool,
                establishment_date: currentSchool.establishment_date ? dayjs(currentSchool.establishment_date).format('YYYY-MM-DD') : null,
                logo: null, // File input cannot be pre-filled programmatically for security
            });
            setLogoPreview(currentSchool.logo_url || null);
        }
    }, [currentSchool, isEditMode, reset, schoolId]);

    // Logo Preview Effect
    useEffect(() => {
        if (watchedLogo && watchedLogo instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(watchedLogo);
        } else if (!watchedLogo && isEditMode && currentSchool?.logo_url) {
            setLogoPreview(currentSchool.logo_url); // Revert to original if new file removed
        } else if (!watchedLogo) {
            setLogoPreview(null);
        }
    }, [watchedLogo, currentSchool, isEditMode]);

    // Load users for assignment
    useEffect(() => {
        const loadUsers = async () => {
            setUsersLoading(true);
            try {
                const response = await UserApi.getAll(1, {});
                setUsers(response.data.data || []);
            } catch (err) {
                console.error('Error loading users:', err);
            } finally {
                setUsersLoading(false);
            }
        };
        loadUsers();
    }, []);


    const onSubmit = async (data: SchoolFormData) => {
        setFormSubmitError(null);
        try {
            let result: School | null = null;
            // Exclude logo_path from submission, backend handles it
            const submitData = { ...data, logo_path: null };

            if (isEditMode && schoolId) {
                result = await updateSchool(schoolId, submitData);
                enqueueSnackbar('تم تحديث بيانات المدرسة بنجاح', { variant: 'success' });
            } else {
                result = await createSchool(submitData);
                enqueueSnackbar('تم إضافة المدرسة بنجاح', { variant: 'success' });
            }
            if (result) {
                navigate(`/schools/${result.id}`); // Navigate to view page
            }
        } catch (error: unknown) {
            console.error("School form submission error:", error);
            const backendErrors = (error as { response?: { data?: { errors?: Record<string, string[]> } } }).response?.data?.errors;
            if (backendErrors) {
                setFormSubmitError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
            } else {
                setFormSubmitError((error as Error).message || 'حدث خطأ غير متوقع.');
            }
        }
    };

    // --- Render Skeletons for Loading ---
    if (isFetchingData && isEditMode) {
        return (
            <div className="container max-w-3xl mx-auto py-8 px-4" dir="rtl">
                <Card className="w-full">
                    <CardHeader><Skeleton className="h-8 w-3/5" /></CardHeader>
                    <CardContent className="space-y-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                        <Skeleton className="h-20 w-full" /> {/* For textarea */}
                        <Skeleton className="h-12 w-24" /> {/* For Avatar area */}
                    </CardContent>
                    <CardFooter><Skeleton className="h-10 w-28" /></CardFooter>
                </Card>
            </div>
        );
    }
    // Handle initial store loading error if not editing
     if (storeError && !isEditMode) {
         return (
             <div className="container max-w-3xl mx-auto py-8 px-4" dir="rtl">
                 <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>خطأ</AlertTitle><AlertDescription>{storeError}</AlertDescription></Alert>
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
            <Button variant="outline" onClick={() => navigate(isEditMode ? `/schools/${schoolId}` : '/schools/list')} className="mb-6">
                <ArrowRight className="ml-2 h-4 w-4" />
                {isEditMode ? 'العودة لصفحة المدرسة' : 'العودة للقائمة'}
            </Button>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">{isEditMode ? `تعديل بيانات المدرسة: ${currentSchool?.name || ''}` : 'إضافة مدرسة جديدة'}</CardTitle>
                    <CardDescription>الرجاء ملء الحقول المطلوبة لـ {isEditMode ? 'تحديث' : 'إضافة'} المدرسة.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        {formSubmitError && (
                            <Alert variant="destructive">
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertTitle>خطأ في الإرسال</AlertTitle>
                                <AlertDescription>
                                    {formSubmitError}
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setFormSubmitError(null)}
                                        className="mt-2 h-auto p-1 text-xs hover:bg-transparent hover:text-destructive-foreground"
                                    >
                                        إغلاق
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">اسم المدرسة *</Label>
                                <Controller name="name" control={control} rules={{ required: 'اسم المدرسة مطلوب' }}
                                    render={({ field }) => <Input id="name" placeholder="مثال: مدرسة الأمل" {...field} className={cn(errors.name && "border-destructive")} />} />
                                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                            </div>
                            {/* Code */}
                            <div className="space-y-2">
                                <Label htmlFor="code">رمز المدرسة *</Label>
                                <Controller name="code" control={control} rules={{ required: 'رمز المدرسة مطلوب' }}
                                    render={({ field }) => <Input id="code" placeholder="مثال: SCH001" {...field} className={cn(errors.code && "border-destructive")} />} />
                                {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                            </div>
                        </div>

                        {/* Email & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني *</Label>
                                <Controller name="email" control={control} 
                                    render={({ field }) => <Input id="email" placeholder="email@example.com" {...field} className={cn(errors.email && "border-destructive")} />} />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">رقم الهاتف *</Label>
                                <Controller name="phone" control={control} rules={{ required: 'رقم الهاتف مطلوب' }}
                                    render={({ field }) => <Input id="phone" placeholder="مثال: 0912345678" {...field} className={cn(errors.phone && "border-destructive")} />} />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">العنوان *</Label>
                            <Controller name="address" control={control} rules={{ required: 'العنوان مطلوب' }}
                                render={({ field }) => <Textarea id="address" placeholder="تفاصيل العنوان..." {...field} className={cn("min-h-[80px]", errors.address && "border-destructive")} />} />
                            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                        </div>

                        {/* Principal Name & Establishment Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="principal_name">اسم المدير (اختياري)</Label>
                                <Controller name="principal_name" control={control}
                                    render={({ field }) => <Input id="principal_name" placeholder="اسم المدير..." {...field} value={field.value ?? ''} />} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="establishment_date">تاريخ التأسيس (اختياري)</Label>
                                <Controller name="establishment_date" control={control}
                                    render={({ field }) => (
                                        <Input 
                                            id="establishment_date" 
                                            type="date" 
                                            {...field} 
                                            value={field.value ?? ''} 
                                            className={cn(errors.establishment_date && "border-destructive")} 
                                        />
                                    )} />
                                {errors.establishment_date && <p className="text-xs text-destructive">{errors.establishment_date.message}</p>}
                            </div>
                        </div>

                                                 {/* Annual Fees */}
                         <div className="space-y-2">
                             <Label htmlFor="annual_fees">الرسوم السنوية (اختياري)</Label>
                             <Controller name="annual_fees" control={control}
                                 render={({ field }) => (
                                     <Input 
                                         id="annual_fees" 
                                         type="number" 
                                         step="0.01" 
                                         min="0"
                                         placeholder="مثال: 5,000.00" 
                                         {...field} 
                                         value={field.value ?? ''} 
                                         onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                     />
                                 )} />
                             {errors.annual_fees && <p className="text-xs text-destructive">{errors.annual_fees.message}</p>}
                         </div>

                        {/* User Assignment */}
                        <div className="space-y-2">
                            <Label htmlFor="user_id">المستخدم المسؤول (اختياري)</Label>
                            {usersLoading ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <Controller name="user_id" control={control}
                                    render={({ field }) => (
                                        <Select value={field.value?.toString() || ''} onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر مستخدم..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value=" ">بدون مستخدم</SelectItem>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name} ({user.username})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )} />
                            )}
                            {errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="logo">شعار المدرسة (اختياري)</Label>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 rounded-md">
                                    <AvatarImage src={logoPreview ?? undefined} alt="شعار المدرسة" />
                                    <AvatarFallback><Building className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                                </Avatar>
                                <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {logoPreview ? 'تغيير الشعار' : 'اختيار الشعار'}
                                </Button>
                                <Input
                                    id="logo" type="file" className="hidden" ref={logoInputRef}
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={(e) => setValue('logo', e.target.files ? e.target.files[0] : null, { shouldValidate: true })}
                                />
                                {logoPreview && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => { setValue('logo', null); setLogoPreview(null); if(logoInputRef.current) logoInputRef.current.value = '';}}>
                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                )}
                            </div>
                            {errors.logo && <p className="text-xs text-destructive">{errors.logo.message}</p>}
                        </div>

                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting || (isFetchingData && isEditMode)} className="min-w-[120px]">
                            {isSubmitting ? <CircularProgress size={20} className="text-primary-foreground" /> : <><Save className="ml-2 h-4 w-4" /> {isEditMode ? 'حفظ التعديلات' : 'إضافة المدرسة'}</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    );
};

export default SchoolForm;