import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gender, Student } from "@/types/student";
import { useSchoolStore } from "@/stores/schoolStore";
import dayjs from "dayjs";
import { useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/ar";

export const StudentInfoTab = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<Student>();

  const { schools, fetchSchools } = useSchoolStore();

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="student_name">اسم الطالب رباعي *</Label>
        <Input
          id="student_name"
          {...register("student_name", {
            required: {
              value: true,
              message: "اسم الطالب مطلوب",
            },
            validate: {
              minWords: (value) => {
                const words = value
                  .trim()
                  .split(/\s+/)
                  .filter((word) => word.length > 0);
                return (
                  words.length >= 4 ||
                  "يجب إدخال الاسم الرباعي (4 كلمات على الأقل)"
                );
              },
            },
          })}
          className={errors.student_name ? "border-red-500" : ""}
        />
        {errors.student_name && (
          <p className="text-sm text-red-500">{errors.student_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_of_birth">تاريخ الميلاد *</Label>
        <Controller
          name="date_of_birth"
          control={control}
          
          rules={{
            required: "تاريخ الميلاد مطلوب",
            validate: (value) => {
              const date = dayjs(value);
              const today = dayjs();
              if (date.isAfter(today)) {
                return "تاريخ الميلاد لا يمكن أن يكون في المستقبل";
              }
              if (today.diff(date, "year") < 3) {
                return "الطالب يجب أن يكون عمره أكثر من 3 سنوات";
              }
              return true;
            },
          }}
          render={({ field }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
              <div>
                <DatePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue) => {
                    field.onChange(newValue ? newValue.format("YYYY-MM-DD") : "");
                  }}
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      id: "date_of_birth",
                      fullWidth: true,
                      error: Boolean(errors.date_of_birth),
                    },
                  }}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-red-500 mt-1">{errors.date_of_birth.message}</p>
                )}
              </div>
            </LocalizationProvider>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">الجنس *</Label>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                <SelectValue placeholder="اختر الجنس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.Male}>{Gender.Male}</SelectItem>
                <SelectItem value={Gender.Female}>{Gender.Female}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="wished_school">المدرسة المرغوبة *</Label>
        <Controller
          name="wished_school"
          control={control}
          rules={{ required: "المدرسة المرغوبة مطلوبة" }}
          render={({ field }) => (
            <Select 
              value={field.value?.toString() || ""} 
              onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
            >
              <SelectTrigger className={errors.wished_school ? "border-red-500" : ""}>
                <SelectValue placeholder="اختر المدرسة" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id.toString()}>
                    {school.name} ({school.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.wished_school && (
          <p className="text-sm text-red-500">{errors.wished_school.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="medical_condition">الحالة الصحية</Label>
        <Input
          id="medical_condition"
          {...register('medical_condition')}
          className={errors.medical_condition ? "border-red-500" : ""}
        />
        {errors.medical_condition && (
          <p className="text-sm text-red-500">{errors.medical_condition.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goverment_id">الرقم الوطني</Label>
        <Input
          id="goverment_id"
          {...register('goverment_id')}
          className={errors.goverment_id ? "border-red-500" : ""}
        />
        {errors.goverment_id && (
          <p className="text-sm text-red-500">{errors.goverment_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="referred_school">اسم المدرسة السابقة</Label>
        <Input
          id="referred_school"
          {...register('referred_school')}
          className={errors.referred_school ? "border-red-500" : ""}
        />
        {errors.referred_school && (
          <p className="text-sm text-red-500">{errors.referred_school.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="success_percentage">نسبة النجاح</Label>
        <Input
          id="success_percentage"
          type="number"
          min="0"
          max="100"
          {...register('success_percentage')}
          className={errors.success_percentage ? "border-red-500" : ""}
        />
        {errors.success_percentage && (
          <p className="text-sm text-red-500">{errors.success_percentage.message}</p>
        )}
      </div>
    </div>
  );
};
