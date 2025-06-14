// src/components/teachers/TeacherForm.tsx (or pages/teachers/TeacherFormPage.tsx)
import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import "dayjs/locale/ar";
dayjs.locale("ar");

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // For is_active
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// lucide-react icons
import {
  Upload,
  User,
  XCircle,
  Save,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useTeacherStore } from "@/stores/teacherStore"; // Adjust path
import { TeacherFormData } from "@/types/teacher"; // Adjust path
import { Gender } from "@/types/student"; // Import Gender enum
import { useSnackbar } from "notistack";

const TeacherForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isEditMode = !!id;
  const teacherId = id ? Number(id) : undefined;

  const {
    createTeacher,
    updateTeacher,
    getTeacherById,
    currentTeacher,
    error: storeError,
    resetCurrentTeacher,
  } = useTeacherStore();

  const [isFetchingData, setIsFetchingData] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormData>({
    defaultValues: {
      national_id: "",
      name: "",
      email: "",
      phone: null,
      gender: "ذكر" as Gender,
      birth_date: null,
      qualification: "",
      hire_date: dayjs().format("YYYY-MM-DD"),
      address: null,
      photo: null,
      is_active: true,
    },
  });

  const watchedPhoto = watch("photo");

  // Fetch data in Edit Mode
  useEffect(() => {
    if (isEditMode && teacherId) {
      const fetchData = async () => {
        setIsFetchingData(true);
        resetCurrentTeacher();
        const teacherData = await getTeacherById(teacherId); // Store updates currentTeacher
        setIsFetchingData(false);
        if (!teacherData) {
          enqueueSnackbar("المدرس المطلوب غير موجود", { variant: "error" });
          navigate("/settings/teachers/list");
        }
      };
      fetchData();
    } else {
      reset({
        // Default for create mode
        national_id: "",
        name: "",
        email: "",
        phone: null,
        gender: "ذكر" as Gender,
        birth_date: null,
        qualification: "",
        hire_date: dayjs().format("YYYY-MM-DD"),
        address: null,
        photo: null,
        is_active: true,
      });
      setPhotoPreview(null);
    }
    return () => resetCurrentTeacher();
  }, [
    teacherId,
    isEditMode,
    getTeacherById,
    reset,
    resetCurrentTeacher,
    enqueueSnackbar,
    navigate,
  ]);

  // Populate form when currentTeacher data arrives (for edit mode)
  useEffect(() => {
    if (isEditMode && currentTeacher && currentTeacher.data.id === teacherId) {
      reset({
        ...currentTeacher.data,
        birth_date: currentTeacher.data.birth_date
          ? dayjs(currentTeacher.data.birth_date).format("YYYY-MM-DD")
          : null,
        hire_date: currentTeacher.data.hire_date
          ? dayjs(currentTeacher.data.hire_date).format("YYYY-MM-DD")
          : "",
        photo: null, // File input cannot be pre-filled
      });
      setPhotoPreview(currentTeacher.data.photo_url || null);
    }
  }, [currentTeacher, isEditMode, reset, teacherId]);

  // Photo Preview Effect
  useEffect(() => {
    if (watchedPhoto && watchedPhoto instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(watchedPhoto);
    } else if (!watchedPhoto && isEditMode && currentTeacher?.data.photo_url) {
      setPhotoPreview(currentTeacher.data.photo_url);
    } else if (!watchedPhoto) {
      setPhotoPreview(null);
    }
  }, [watchedPhoto, currentTeacher, isEditMode]);

  // --- Form Submission ---
  const onSubmit = async (data: TeacherFormData) => {
    setFormSubmitError(null);
    try {
      let result = null;

      if (isEditMode && teacherId) {
        result = await updateTeacher(teacherId, data);
        enqueueSnackbar("تم تحديث بيانات المدرس بنجاح", { variant: "success" });
      } else {
        result = await createTeacher(data);
        enqueueSnackbar("تم إضافة المدرس بنجاح", { variant: "success" });
      }
      if (result) {
        navigate(`/settings/teachers/${result.data.id}`); // Navigate to view page
      }
    } catch (error) {
      setFormSubmitError(error.message || "حدث خطأ أثناء حفظ البيانات");
      enqueueSnackbar(error.message || "فشل في حفظ البيانات", {
        variant: "error",
      });
    }
  };

  // --- Render Skeletons for Loading ---
  if (isFetchingData && isEditMode) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4" dir="rtl">
        <Skeleton className="h-10 w-32 mb-6" />
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (storeError && !isEditMode) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4" dir="rtl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{storeError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-3xl mx-auto py-8 px-4"
      dir="rtl"
    >
      <Button
        variant="outline"
        onClick={() =>
          navigate(
            isEditMode
              ? `/settings/teachers/${teacherId}`
              : "/settings/teachers/list"
          )
        }
        className="mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />{" "}
        {isEditMode ? "العودة لصفحة المدرس" : "العودة للقائمة"}
      </Button>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditMode
              ? `تعديل بيانات المدرس: ${currentTeacher?.data.name || ""}`
              : "إضافة مدرس جديد"}
          </CardTitle>
          <CardDescription>
            الرجاء ملء الحقول المطلوبة لـ {isEditMode ? "تحديث" : "إضافة"}{" "}
            المدرس.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {formSubmitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>خطأ في الحفظ</AlertTitle>
                <AlertDescription>{formSubmitError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* National ID */}
              <div className="space-y-2">
                <Label htmlFor="national_id">الرقم الوطني *</Label>
                <Controller
                  name="national_id"
                  control={control}
                  rules={{ required: "الرقم الوطني مطلوب" }}
                  render={({ field }) => (
                    <Input
                      id="national_id"
                      placeholder="01234567890"
                      {...field}
                      className={cn(errors.national_id && "border-destructive")}
                    />
                  )}
                />
                {errors.national_id && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.national_id.message}
                  </p>
                )}
              </div>
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل *</Label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "الاسم الكامل مطلوب" }}
                  render={({ field }) => (
                    <Input
                      id="name"
                      placeholder="مثال: أحمد محمد علي"
                      {...field}
                      className={cn(errors.name && "border-destructive")}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "البريد مطلوب",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "صيغة بريد غير صحيحة",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      placeholder="teacher@example.com"
                      {...field}
                      className={cn(errors.email && "border-destructive")}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="phone"
                      placeholder="09..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">الجنس *</Label>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: "الجنس مطلوب" }}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "ذكر"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="gender"
                        className={cn(errors.gender && "border-destructive")}
                      >
                        <SelectValue placeholder="اختر الجنس..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ذكر">ذكر</SelectItem>
                        <SelectItem value="انثي">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>
              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="birth_date">تاريخ الميلاد (اختياري)</Label>
                <Controller
                  name="birth_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="birth_date"
                      type="date"
                      {...field}
                      value={field.value || ""}
                      className={cn(
                        "w-full",
                        errors.birth_date && "border-destructive"
                      )}
                    />
                  )}
                />
                {errors.birth_date && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.birth_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Qualification & Hire Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">المؤهل العلمي *</Label>
                <Controller
                  name="qualification"
                  control={control}
                  rules={{ required: "المؤهل مطلوب" }}
                  render={({ field }) => (
                    <Input
                      id="qualification"
                      placeholder="مثال: بكالوريوس تربية"
                      {...field}
                      className={cn(
                        errors.qualification && "border-destructive"
                      )}
                    />
                  )}
                />
                {errors.qualification && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.qualification.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hire_date">تاريخ التعيين *</Label>
                <Controller
                  name="hire_date"
                  control={control}
                  rules={{ required: "تاريخ التعيين مطلوب" }}
                  render={({ field }) => (
                    <Input
                      id="hire_date"
                      type="date"
                      {...field}
                      value={field.value || ""}
                      className={cn(
                        "w-full",
                        errors.hire_date && "border-destructive"
                      )}
                    />
                  )}
                />
                {errors.hire_date && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.hire_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">العنوان (اختياري)</Label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="address"
                    placeholder="تفاصيل العنوان..."
                    {...field}
                    value={field.value ?? ""}
                    className="min-h-[80px]"
                  />
                )}
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="photo">الصورة الشخصية (اختياري)</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 rounded-md">
                  <AvatarImage
                    src={photoPreview ?? undefined}
                    alt="صورة المدرس"
                  />
                  <AvatarFallback>
                    <User className="h-10 w-10 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />{" "}
                  {photoPreview ? "تغيير الصورة" : "اختيار صورة"}
                </Button>
                <Input
                  id="photo"
                  type="file"
                  className="hidden"
                  ref={photoInputRef}
                  accept="image/*"
                  onChange={(e) =>
                    setValue("photo", e.target.files?.[0] ?? null, {
                      shouldValidate: true,
                    })
                  }
                />
                {photoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setValue("photo", null);
                      setPhotoPreview(null);
                      if (photoInputRef.current)
                        photoInputRef.current.value = "";
                    }}
                  >
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
              {errors.photo && (
                <p className="text-xs text-destructive mt-1">
                  {errors.photo.message}
                </p>
              )}
            </div>

            {/* Is Active Switch */}
            <div className="flex items-center space-x-2 space-x-reverse pt-2">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                حالة الحساب نشطة
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitting || (isFetchingData && isEditMode)}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />{" "}
                  {isEditMode ? "حفظ التعديلات" : "إضافة مدرس"}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default TeacherForm;
