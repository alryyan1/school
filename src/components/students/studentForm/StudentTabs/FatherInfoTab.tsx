import { useFormContext } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePhoneNumber } from '@/utils/validators';

export const FatherInfoTab = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="father_name">اسم الأب *</Label>
        <Input
          id="father_name"
          {...register("father_name", {
            required: {
              value: true,
              message: "اسم الأب مطلوب",
            },
            minLength: {
              value: 3,
              message: "يجب أن يكون اسم الأب على الأقل 3 أحرف",
            },
            pattern: {
              value: /^[\u0600-\u06FF\s]+$/,
              message: "يجب أن يحتوي الاسم على أحرف عربية فقط",
            },
          })}
          className={errors.father_name ? "border-red-500" : ""}
        />
        {errors.father_name && (
          <p className="text-sm text-red-500">{errors.father_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="father_job">وظيفة الأب *</Label>
        <Input
          id="father_job"
          {...register("father_job", {
            required: {
              value: true,
              message: "وظيفة الأب مطلوبة",
            },
            minLength: {
              value: 2,
              message: "يجب أن تكون الوظيفة على الأقل حرفين",
            },
          })}
          className={errors.father_job ? "border-red-500" : ""}
        />
        {errors.father_job && (
          <p className="text-sm text-red-500">{errors.father_job.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="father_address">عنوان الأب *</Label>
        <Input
          id="father_address"
          {...register("father_address", {
            required: {
              value: true,
              message: "عنوان الأب مطلوب",
            },
          })}
          className={errors.father_address ? "border-red-500" : ""}
        />
        {errors.father_address && (
          <p className="text-sm text-red-500">{errors.father_address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="father_phone">رقم هاتف الأب *</Label>
        <Input
          id="father_phone"
          type="tel"
          {...register("father_phone", {
            required: {
              value: true,
              message: "رقم هاتف الأب مطلوب",
            },
            validate: validatePhoneNumber,
          })}
          className={errors.father_phone ? "border-red-500" : ""}
        />
        {errors.father_phone && (
          <p className="text-sm text-red-500">{errors.father_phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="father_whatsapp">واتساب الأب</Label>
        <Input
          id="father_whatsapp"
          type="tel"
          {...register("father_whatsapp", {
            validate: (value) => !value || validatePhoneNumber(value) || "رقم واتساب غير صحيح",
          })}
          className={errors.father_whatsapp ? "border-red-500" : ""}
        />
        {errors.father_whatsapp && (
          <p className="text-sm text-red-500">{errors.father_whatsapp.message}</p>
        )}
      </div>
    </div>
  );
};