import { Controller, useFormContext } from 'react-hook-form';
import { TextField, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Gender } from '@/types/student';

export const StudentInfoTab = () => {
  const { control, register, formState: { errors } } = useFormContext();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="اسم الطالب رباعي"
          {...register("student_name")}
          error={!!errors.student_name}
          helperText={errors.student_name?.message as string}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="date_of_birth"
          control={control}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="تاريخ الميلاد"
              slotProps={{
                textField: {
                  error: !!errors.date_of_birth,
                  helperText: errors.date_of_birth?.message as string,
                  fullWidth: true
                }
              }}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>الجنس</InputLabel>
          <Select
            label="الجنس"
            defaultValue={Gender.Male}
            {...register("gender")}
          >
            <MenuItem value={Gender.Male}>{Gender.Male}</MenuItem>
            <MenuItem value={Gender.Female}>{Gender.Female}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};