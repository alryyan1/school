import { useFormContext } from "react-hook-form";
import { TextField, Grid } from "@mui/material";

export const AdditionalInfoTab = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="ولي أمر آخر"
          {...register("other_parent")}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="صلة ولي الأمر الآخر"
          {...register("relation_of_other_parent")}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="وظيفة ولي الأمر الآخر"
          {...register("relation_job")}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="رقم هاتف ولي الأمر الآخر"
          {...register("relation_phone")}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="واتساب ولي الأمر الآخر"
          {...register("relation_whatsapp")}
        />
      </Grid>
    </Grid>
  );
};
