import { useFormContext } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateArabicName, validatePhoneNumber } from '@/utils/validators';

export const MotherInfoTab = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Mother's Name */}
      <div className="space-y-2">
        <Label htmlFor="mother_name">اسم الأم *</Label>
        <Input
          id="mother_name"
          {...register("mother_name", {
            required: "اسم الأم مطلوب",
            validate: {
              arabicName: validateArabicName,
              minLength: (v) => v.length >= 3 || "يجب أن يكون الاسم 3 أحرف على الأقل"
            }
          })}
          className={errors.mother_name ? "border-red-500" : ""}
        />
        {errors.mother_name && (
          <p className="text-sm text-red-500">{errors.mother_name.message as string}</p>
        )}
      </div>

      {/* Mother's Job */}
      <div className="space-y-2">
        <Label htmlFor="mother_job">وظيفة الأم *</Label>
        <Input
          id="mother_job"
          {...register("mother_job", {
            required: "وظيفة الأم مطلوبة",
          })}
          className={errors.mother_job ? "border-red-500" : ""}
        />
        {errors.mother_job && (
          <p className="text-sm text-red-500">{errors.mother_job.message as string}</p>
        )}
      </div>

      {/* Mother's Address */}
      <div className="space-y-2">
        <Label htmlFor="mother_address">عنوان الأم *</Label>
        <Input
          id="mother_address"
          {...register("mother_address", {
            required: "عنوان الأم مطلوب",
          })}
          className={errors.mother_address ? "border-red-500" : ""}
        />
        {errors.mother_address && (
          <p className="text-sm text-red-500">{errors.mother_address.message as string}</p>
        )}
      </div>

      {/* Mother's Phone */}
      <div className="space-y-2">
        <Label htmlFor="mother_phone">رقم هاتف الأم *</Label>
        <Input
          id="mother_phone"
          type="tel"
          {...register("mother_phone", {
            required: "رقم الهاتف مطلوب",
            validate: validatePhoneNumber
          })}
          className={errors.mother_phone ? "border-red-500" : ""}
        />
        {errors.mother_phone && (
          <p className="text-sm text-red-500">{errors.mother_phone.message as string}</p>
        )}
      </div>

      {/* Mother's WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="mother_whatsapp">واتساب الأم</Label>
        <Input
          id="mother_whatsapp"
          type="tel"
          {...register("mother_whatsapp", {
            validate: (value) => 
              !value || validatePhoneNumber(value) || "رقم واتساب غير صحيح"
          })}
          className={errors.mother_whatsapp ? "border-red-500" : ""}
        />
        {errors.mother_whatsapp && (
          <p className="text-sm text-red-500">{errors.mother_whatsapp.message as string}</p>
        )}
      </div>
    </div>
  );
};