// src/components/enrollments/EnrollmentFormDialog.tsx
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import {
  StudentEnrollmentFormData,
  EnrollableStudent,
  EnrollmentStatus,
} from "@/types/studentAcademicYear";

import { useClassroomStore } from "@/stores/classroomStore"; // To get classrooms
import { AcademicYear } from "@/types/academicYear";
import { GradeLevel } from "@/types/gradeLevel";
import { useSnackbar } from "notistack";
import { useStudentEnrollmentStore } from "@/stores/studentEnrollmentStore";

interface EnrollmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  selectedAcademicYear: AcademicYear | null;
  selectedGradeLevel: GradeLevel | null;
}

const statusOptions: EnrollmentStatus[] = [
  "active",
  "transferred",
  "graduated",
  "withdrawn",
];

const EnrollmentFormDialog: React.FC<EnrollmentFormDialogProps> = ({
  open,
  onClose,
  selectedAcademicYear,
  selectedGradeLevel,
}) => {
  const {
    enrollStudent,
    fetchEnrollableStudents,
    enrollableStudents,
    loadingEnrollable,
  } = useStudentEnrollmentStore();
  const { classrooms, fetchClassrooms: fetchGradeClassrooms } =
    useClassroomStore();
  const { enqueueSnackbar } = useSnackbar();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentEnrollmentFormData>({
    defaultValues: {
      student_id: "", // Use '' or null, handle conversion
      academic_year_id: selectedAcademicYear?.id || "",
      grade_level_id: selectedGradeLevel?.id || "",
      classroom_id: null, // Default to null
      status: "active",
    },
  });

  // Fetch enrollable students and classrooms when dialog opens with valid selections
  // Fetch data and Reset form logic
  useEffect(() => {
    if (open) {
      setFormError(null); // Clear previous errors

      // Prepare default values based on props
      const defaults: Partial<StudentEnrollmentFormData> = {
        student_id: "", // Reset student selection
        academic_year_id: selectedAcademicYear?.id || "",
        grade_level_id: selectedGradeLevel?.id || "",
        school_id: selectedAcademicYear?.school_id || "", // Get school from year
        classroom_id: null, // Default to no classroom
        status: "active",
      };
      reset(defaults); // Reset the form

      // Fetch necessary data for dropdowns/autocompletes
      if (selectedAcademicYear?.id && selectedAcademicYear?.school_id) {
        fetchEnrollableStudents(
          selectedAcademicYear.id,
          selectedAcademicYear.school_id
        );
      }
      if (selectedGradeLevel?.id && selectedAcademicYear?.school_id) {
        fetchGradeClassrooms({
          grade_level_id: selectedGradeLevel.id,
          school_id: selectedAcademicYear.school_id,
        });
      }
    }
  }, [
    open,
    selectedAcademicYear,
    selectedGradeLevel,
    reset,
    fetchEnrollableStudents,
    fetchGradeClassrooms,
  ]);

  const onSubmit = async (data: StudentEnrollmentFormData) => {
    setFormError(null);
    // Ensure IDs are numbers
    const submitData = {
      ...data,
      student_id: Number(data.student_id),
      academic_year_id: Number(data.academic_year_id),
      grade_level_id: Number(data.grade_level_id),
      school_id: Number(data.school_id),
      classroom_id: data.classroom_id ? Number(data.classroom_id) : null,
    };

    // Validate essential IDs before submitting
    if (
      !submitData.student_id ||
      !submitData.academic_year_id ||
      !submitData.grade_level_id ||
      !submitData.school_id
    ) {
      setFormError("بيانات غير مكتملة (الطالب، العام، المرحلة، المدرسة).");
      return;
    }

    try {
      await enrollStudent(submitData);
      enqueueSnackbar("تم تسجيل الطالب بنجاح", { variant: "success" });
      onClose();
    } catch (error: any) {
      console.error("Enrollment Form submission error:", error);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setFormError(`فشل التسجيل: ${Object.values(backendErrors).flat().join('. ')}`);
      } else {
        setFormError(error.message || "حدث خطأ غير متوقع.");
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle>
            تسجيل طالب جديد في {selectedGradeLevel?.name ?? '...'} للعام {selectedAcademicYear?.name ?? '...'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
                {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}
                <Grid container spacing={2.5} sx={{ pt: 1 }}>

                    {/* Student Selection */}
                    <Grid item xs={12}>
                         <Controller
                            name="student_id"
                            control={control}
                            rules={{ required: 'الطالب مطلوب' }}
                            render={({ field }) => (
                                 <Autocomplete
                                    options={enrollableStudents}
                                    loading={loadingEnrollable}
                                    getOptionLabel={(option) => `${option.student_name} (${option.goverment_id || 'لا يوجد رقم وطني'})`}
                                    value={enrollableStudents.find(s => s.id === Number(field.value)) || null} // Match value
                                    onChange={(event, newValue) => {
                                         field.onChange(newValue ? newValue.id : ''); // Update RHF field with ID
                                    }}
                                    renderInput={(params) =>
                                         <TextField {...params} label="الطالب *" required error={!!errors.student_id} helperText={errors.student_id?.message}
                                             InputProps={{
                                                 ...params.InputProps,
                                                 endAdornment: (
                                                     <React.Fragment>
                                                         {loadingEnrollable ? <CircularProgress color="inherit" size={20} /> : null}
                                                         {params.InputProps.endAdornment}
                                                     </React.Fragment>
                                                 ),
                                             }}
                                         />}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    noOptionsText="لا يوجد طلاب متاحون لهذا العام"
                                    disabled={loadingEnrollable}
                                 />
                             )} />
                     </Grid>

                     {/* Classroom Selection */}
                    <Grid item xs={12} sm={6}>
                         <Controller
                            name="classroom_id"
                            control={control}
                            render={({ field }) => (
                                 <FormControl fullWidth error={!!errors.classroom_id}>
                                     <InputLabel id="classroom-select-label">الفصل (اختياري)</InputLabel>
                                     <Select
                                        labelId="classroom-select-label"
                                        label="الفصل (اختياري)"
                                        {...field}
                                        value={field.value || ''} // Handle null value
                                     >
                                         <MenuItem value=""><em>بدون فصل</em></MenuItem>
                                         {/* Filter classrooms based on selected grade? Assumes classrooms fetched match grade */}
                                         {classrooms.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                     </Select>
                                     {errors.classroom_id && <FormHelperText>{errors.classroom_id.message}</FormHelperText>}
                                 </FormControl>
                            )} />
                    </Grid>

                    {/* Status Selection */}
                    <Grid item xs={12} sm={6}>
                         <Controller
                            name="status"
                            control={control}
                            rules={{ required: 'الحالة مطلوبة' }}
                            render={({ field }) => (
                                 <FormControl fullWidth error={!!errors.status}>
                                     <InputLabel id="status-select-label">الحالة *</InputLabel>
                                     <Select labelId="status-select-label" label="الحالة *" {...field} >
                                        {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                     </Select>
                                     {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                                 </FormControl>
                            )} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit" disabled={isSubmitting}>إلغاء</Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || loadingEnrollable}>
                    {isSubmitting ? <CircularProgress size={22} /> : 'تسجيل الطالب'}
                </Button>
            </DialogActions>
        </form>
    </Dialog>
);
};

export default EnrollmentFormDialog;
