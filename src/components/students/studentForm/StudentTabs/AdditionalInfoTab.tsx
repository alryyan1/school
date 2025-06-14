import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const AdditionalInfoTab = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="other_parent">ولي أمر آخر</Label>
        <Input
          id="other_parent"
          {...register("other_parent")}
          className={errors.other_parent ? "border-red-500" : ""}
        />
        {errors.other_parent && (
          <p className="text-sm text-red-500">{errors.other_parent.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="relation_of_other_parent">صلة ولي الأمر الآخر</Label>
        <Input
          id="relation_of_other_parent"
          {...register("relation_of_other_parent")}
          className={errors.relation_of_other_parent ? "border-red-500" : ""}
        />
        {errors.relation_of_other_parent && (
          <p className="text-sm text-red-500">{errors.relation_of_other_parent.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="relation_job">وظيفة ولي الأمر الآخر</Label>
        <Input
          id="relation_job"
          {...register("relation_job")}
          className={errors.relation_job ? "border-red-500" : ""}
        />
        {errors.relation_job && (
          <p className="text-sm text-red-500">{errors.relation_job.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="relation_phone">رقم هاتف ولي الأمر الآخر</Label>
        <Input
          id="relation_phone"
          type="tel"
          {...register("relation_phone")}
          className={errors.relation_phone ? "border-red-500" : ""}
        />
        {errors.relation_phone && (
          <p className="text-sm text-red-500">{errors.relation_phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="relation_whatsapp">واتساب ولي الأمر الآخر</Label>
        <Input
          id="relation_whatsapp"
          type="tel"
          {...register("relation_whatsapp")}
          className={errors.relation_whatsapp ? "border-red-500" : ""}
        />
        {errors.relation_whatsapp && (
          <p className="text-sm text-red-500">{errors.relation_whatsapp.message}</p>
        )}
      </div>
    </div>
  );
};
