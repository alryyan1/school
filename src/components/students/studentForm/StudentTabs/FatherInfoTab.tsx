import { useFormContext } from 'react-hook-form';
import { TextField, Grid } from '@mui/material';

export const FatherInfoTab = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
  <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="اسم الأب"
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
                  error={!!errors.father_name}
                  helperText={errors.father_name?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="وظيفة الأب"
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
                  error={!!errors.father_job}
                  helperText={errors.father_job?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="عنوان الأب"
                  {...register("father_address", {
                    required: {
                      value: true,
                      message: "عنوان الأب مطلوب",
                    },
                    minLength: {
                      value: 5,
                      message: "يجب أن يكون العنوان على الأقل 5 أحرف",
                    },
                  })}
                  error={!!errors.father_address}
                  helperText={errors.father_address?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="رقم هاتف الأب"
                  {...register("father_phone", {
                    required: {
                      value: true,
                      message: "رقم هاتف الأب مطلوب",
                    },
                    pattern: {
                      value: /^(0|09)\d{8}$/,
                      message:
                        "يجب أن يكون رقم هاتف  صحيح (يبدأ بـ 0 أو 09 ويتكون من 10 أرقام)",
                    },
                  })}
                  error={!!errors.father_phone}
                  helperText={errors.father_phone?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="واتساب الأب"
                  {...register("father_whatsapp", {
                    pattern: {
                      value: /^(0|09)\d{8}$/,
                      message:
                        "يجب أن يكون رقم هاتف  صحيح (يبدأ بـ 0 أو 09 ويتكون من 10 أرقام)",
                    },
                  })}
                  error={!!errors.father_whatsapp}
                  helperText={errors.father_whatsapp?.message}
                />
              </Grid>
            </Grid>
  );
};