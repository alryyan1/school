import { Grid, Typography } from '@mui/material'
import React from 'react'

function ConfirmTab() {
  return (
    <Grid container spacing={3}>
    <Typography variant="h6" component="h3" gutterBottom>
      ملخص الأخطاء:
    </Typography>
    {Object.keys(errors).length > 0 ? (
      Object.keys(errors).map((errorKey) => (
        <Typography key={errorKey} color="error" variant="body2">
          - {errors[errorKey as keyof typeof errors]?.message}
        </Typography>
      ))
    ) : (
      <Typography>لا توجد أخطاء.</Typography>
    )}
    <Grid item xs={12}>
      <Button type="submit" variant="contained" color="primary">
        إضافة الطالب
      </Button>
    </Grid>
  </Grid>
  )
}

export default ConfirmTab