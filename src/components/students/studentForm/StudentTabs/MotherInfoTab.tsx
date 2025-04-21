import { useFormContext } from 'react-hook-form';
import { TextField, Grid } from '@mui/material';
import { validateArabicName, validatePhoneNumber } from '@/utils/validators';

export const MotherInfoTab = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Grid container spacing={3}>
      {/* Mother's Name */}
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="اسم الأم"
          {...register("mother_name", {
            required: "اسم الأم مطلوب",
            validate: {
              arabicName: validateArabicName,
              minLength: (v) => v.length >= 3 || "يجب أن يكون الاسم 3 أحرف على الأقل"
            }
          })}
          error={!!errors.mother_name}
          helperText={errors.mother_name?.message as string}
        />
      </Grid>

      {/* Mother's Job */}
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="وظيفة الأم"
          {...register("mother_job", {
            required: "وظيفة الأم مطلوبة",
         
          })}
          error={!!errors.mother_job}
          helperText={errors.mother_job?.message as string}
        />
      </Grid>

      {/* Mother's Address */}
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="عنوان الأم"
          {...register("mother_address", {
            required: "عنوان الأم مطلوب",
         
          })}
          error={!!errors.mother_address}
          helperText={errors.mother_address?.message as string}
        />
      </Grid>

      {/* Mother's Phone */}
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="رقم هاتف الأم"
          {...register("mother_phone", {
            required: "رقم الهاتف مطلوب",
            validate: validatePhoneNumber
          })}
          error={!!errors.mother_phone}
          helperText={errors.mother_phone?.message as string}
        />
      </Grid>

      {/* Mother's WhatsApp */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="واتساب الأم"
          {...register("mother_whatsapp", {
            validate: (value) => 
              !value || validatePhoneNumber(value) || "رقم واتساب غير صحيح"
          })}
          error={!!errors.mother_whatsapp}
          helperText={errors.mother_whatsapp?.message as string}
        />
      </Grid>
    </Grid>
  );
};