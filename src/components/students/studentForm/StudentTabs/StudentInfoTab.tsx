import { Controller, useFormContext } from "react-hook-form";
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Gender } from "@/types/student";
import dayjs from "dayjs";

export const StudentInfoTab = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="اسم الطالب رباعي"
          {...register("student_name", {
            required: {
              value: true,
              message: "اسم الطالب مطلوب",
            },
            validate: {
              minWords: (value) => {
                // Split by whitespace and filter out empty strings
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
          error={!!errors.student_name}
          helperText={errors.student_name?.message.toString() || undefined}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
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
            <DatePicker
              {...field}
              value={field.value ? dayjs(field.value) : null}
              onChange={(newValue) => {
                field.onChange(newValue ? newValue.format('YYYY-MM-DD') : null);
              }}
              label="تاريخ الميلاد"
              format="YYYY-MM-DD"
              slotProps={{
                textField: {
                  error: !!errors.date_of_birth,
                  helperText: errors.date_of_birth?.message.toString() || undefined,
                  fullWidth: true,
                },
              }}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>الجنس</InputLabel>
          <Select label="الجنس"  {...register("gender")}>
            <MenuItem value="ذكر">ذكر</MenuItem>
            <MenuItem value="انثي">أنثى</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
