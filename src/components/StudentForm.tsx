import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "dayjs/plugin/localeData";
import "dayjs/plugin/localizedFormat";
import { EducationLevel, Gender, Student } from "../types/student";
import axiosClient from "../axios-client";

const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  direction: "rtl",
}));

const localStorageKey = "studentFormData";

const initialStudentState: Omit<Student, "id" | "created_at" | "updated_at"|"aproove_date"> = {
  student_name: "",
  father_name: "",
  father_job: "",
  father_address: "",
  father_phone: "",
  father_whatsapp: "",
  mother_name: "",
  mother_job: "",
  mother_address: "",
  mother_phone: "",
  mother_whatsapp: "",
  email: "",
  date_of_birth: dayjs().format("YYYY-MM-DD"),
  gender: Gender.Male,
  closest_name: "",
  closest_phone: "",
  referred_school: "",
  success_percentage: "",
  medical_condition: "",
  other_parent: "",
  relation_of_other_parent: "",
  relation_job: "",
  relation_phone: "",
  relation_whatsapp: "",
  image: "",
  approved: false,
  approved_by_user: null,
  message_sent: false,
  goverment_id: "",
  wished_level: EducationLevel.Primary,
};

const StudentForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<Omit<Student, "id" | "created_at" | "updated_at">>({
    defaultValues: initialStudentState,
    mode: "onBlur",
  });

  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const storedData = localStorage.getItem(localStorageKey);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        Object.keys(parsedData).forEach((key) => {
          setValue(key as any, parsedData[key]);
        });
        setValue("date_of_birth", parsedData.date_of_birth);
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
        clearLocalStorageAndForm();
      }
    }
  }, [setValue]);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(watch()));
  }, [watch()]);

  const isTabError = (tabNumber: number) => {
    switch (tabNumber) {
      case 0:
        return !!errors.student_name;
      case 1:
        return (
          !!errors.father_name ||
          !!errors.father_job ||
          !!errors.father_address ||
          !!errors.father_phone
        );
      case 2:
        return (
          !!errors.mother_name ||
          !!errors.mother_job ||
          !!errors.mother_address ||
          !!errors.mother_phone
        );
   
      default:
        return false;
    }
  };

  const clearLocalStorageAndForm = () => {
    localStorage.removeItem(localStorageKey);
    reset(initialStudentState);
    setActiveTab(0);
  };

  const onSubmit = async (
    data: Omit<Student, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const response = await axiosClient.post("/students", data);
      console.log("Student created:", response.data);
      clearLocalStorageAndForm();
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setValue("date_of_birth", date.format("YYYY-MM-DD"));
      setSelectedDate(date);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <StyledContainer>
        <Typography variant="h5" component="h2" gutterBottom>
          إضافة طالب جديد
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={clearLocalStorageAndForm}
          sx={{ marginBottom: 2 }}
        >
          مسح البيانات المحفوظة
        </Button>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
            sx={{ mb: 2 }}
          >
            <Tab
              label={
                <>
                  <span style={{ color: isTabError(0) ? "red" : "" }}>
                    معلومات الطالب
                  </span>
                </>
              }
            />
            <Tab
              label={
                <>
                  <span style={{ color: isTabError(1) ? "red" : "" }}>
                    معلومات الأب
                  </span>
                </>
              }
            />
            <Tab
              label={
                <>
                  <span style={{ color: isTabError(2) ? "red" : "" }}>
                    معلومات الأم
                  </span>
                </>
              }
            />
            <Tab
              label={
                <>
                  <span style={{ color: isTabError(3) ? "red" : "" }}>
                    معلومات إضافية
                  </span>
                </>
              }
            />
            <Tab label="تأكيد" />
          </Tabs>

          {activeTab === 0 && (
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
                  helperText={errors.student_name?.message}
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
                      label="تاريخ الميلاد"
                      format="YYYY-MM-DD"
                      value={selectedDate}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          error: !!errors.date_of_birth,
                          helperText: errors.date_of_birth?.message,
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
                  <Select
                    label="الجنس"
                    defaultValue="ذكر"
                    {...register("gender")}
                  >
                    <MenuItem value="ذكر">ذكر</MenuItem>
                    <MenuItem value="أنثى">أنثى</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
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
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="اسم الأم"
                  {...register("mother_name", {
                    required: {
                      value: true,
                      message: "اسم الأم مطلوب",
                    },
                    minLength: {
                      value: 3,
                      message: "يجب أن يكون اسم الأم على الأقل 3 أحرف",
                    },
                    pattern: {
                      value: /^[\u0600-\u06FF\s]+$/,
                      message: "يجب أن يحتوي الاسم على أحرف عربية فقط",
                    },
                  })}
                  error={!!errors.mother_name}
                  helperText={errors.mother_name?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="وظيفة الأم"
                  {...register("mother_job", {
                    required: {
                      value: true,
                      message: "وظيفة الأم مطلوبة",
                    },
                    minLength: {
                      value: 2,
                      message: "يجب أن تكون الوظيفة على الأقل حرفين",
                    },
                  })}
                  error={!!errors.mother_job}
                  helperText={errors.mother_job?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="عنوان الأم"
                  {...register("mother_address", {
                    required: {
                      value: true,
                      message: "عنوان الأم مطلوب",
                    },
                    minLength: {
                      value: 5,
                      message: "يجب أن يكون العنوان على الأقل 5 أحرف",
                    },
                  })}
                  error={!!errors.mother_address}
                  helperText={errors.mother_address?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="رقم هاتف الأم"
                  {...register("mother_phone", {
                    required: {
                      value: true,
                      message: "رقم هاتف الأم مطلوب",
                    },
                    pattern: {
                        value: /^(0|09)\d{8}$/,
                        message:
                          "يجب أن يكون رقم هاتف  صحيح (يبدأ بـ 0 أو 09 ويتكون من 10 أرقام)",
                      },
                  })}
                  error={!!errors.mother_phone}
                  helperText={errors.mother_phone?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="واتساب الأم"
                  {...register("mother_whatsapp", {
                    pattern: {
                      value: /^(0|09)\d{8}$/,
                      message:
                        "يجب أن يكون رقم هاتف  صحيح (يبدأ بـ 0 أو 09 ويتكون من 10 أرقام)",
                    },
                  })}
                  error={!!errors.mother_whatsapp}
                  helperText={errors.mother_whatsapp?.message}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
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
                  {...register("relation_phone",)}
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
          )}

          {activeTab === 4 && (
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
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              disabled={activeTab === 0}
              onClick={() => setActiveTab(activeTab - 1)}
              variant="contained"
            >
              السابق
            </Button>
            <Button
              disabled={activeTab === 4}
              onClick={() => setActiveTab(activeTab + 1)}
              variant="contained"
            >
              التالي
            </Button>
          </Box>
        </form>
      </StyledContainer>
    </LocalizationProvider>
  );
};

export default StudentForm;
