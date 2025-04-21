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
import { EducationLevel, Gender, Student } from "@/types/student";
import dayjs from "dayjs";

export const StudentInfoTab = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<Student>();

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
                field.onChange(newValue ? newValue.format("YYYY-MM-DD") : null);
              }}
              label="تاريخ الميلاد"
              format="YYYY-MM-DD"
              slotProps={{
                textField: {
                  error: !!errors.date_of_birth,
                  helperText:
                    errors.date_of_birth?.message.toString() || undefined,
                  fullWidth: true,
                },
              }}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
       <Controller control={control} name="gender" render={({field})=>{
        return   <FormControl fullWidth>
        <InputLabel>الجنس</InputLabel>
        <Select label="الجنس" {...field}>
          <MenuItem value={Gender.Male}>{Gender.Male}</MenuItem>
          <MenuItem value={Gender.Female}>{Gender.Female}</MenuItem>
        </Select>
      </FormControl>
       }}></Controller>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          name="wished_level"
          control={control}
          render={({ field }) => {
            return (
              <FormControl fullWidth>
                <InputLabel>المرحله الدراسيه المرغوبه</InputLabel>
                <Select label="المرحله الدراسيه المرغوبه" {...field}>
                  <MenuItem value={EducationLevel.Secondary}>
                    {EducationLevel.Secondary}
                  </MenuItem>
                  <MenuItem value={EducationLevel.Intermediate}>
                    {EducationLevel.Intermediate}
                  </MenuItem>
                  <MenuItem value={EducationLevel.Primary}>
                    {EducationLevel.Primary}
                  </MenuItem>
                  <MenuItem value={EducationLevel.Kindergarten}>
                    {EducationLevel.Kindergarten}
                  </MenuItem>
                </Select>
              </FormControl>
            );
          }}
        ></Controller>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField {...register('medical_condition')} fullWidth label='الحاله الصحيه'></TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField {...register('goverment_id')} fullWidth label='الرقم الوطني'></TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField {...register('referred_school')} fullWidth label='اسم المدرسه السابقه'></TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField {...register('success_percentage')} fullWidth label='نسبه النجاح'></TextField>
      </Grid>
    </Grid>
  );
};
