// src/components/teachers/TeacherForm.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ar";
dayjs.locale("ar");

// Material-UI components
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";

// Material-UI icons
import { PhotoCamera, Delete, Save, ArrowBack, Upload, Person } from "@mui/icons-material";

import { useTeacherStore } from "@/stores/teacherStore";
import { TeacherFormData } from "@/types/teacher";
import { Gender } from "@/types/student";
import { useSnackbar } from "notistack";
import axiosClient from "@/axios-client";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { webUrl } from "@/constants";

const today = dayjs().format("YYYY-MM-DD");

const TeacherForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isEditMode = !!id;
  const teacherId = id ? Number(id) : undefined;

  const {
    createTeacher,
    updateTeacher,
    getTeacherById,
    currentTeacher,
    resetCurrentTeacher,
  } = useTeacherStore();

  const [isFetchingData, setIsFetchingData] = useState(false);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Step-local state (isolated per tab)
  const [personal, setPersonal] = useState<{
    national_id: string;
    name: string;
    gender: Gender;
    birth_date: string;
    place_of_birth: string;
    nationality: string;
    document_type: "" | "جواز سفر" | "البطاقة الشخصية" | "الرقم الوطني";
    document_number: string;
    marital_status: "" | "ارمل" | "مطلق" | "متزوج" | "اعزب";
    number_of_children: number | "";
    children_in_school: number | "";
  }>({
      national_id: "",
      name: "",
    gender: ("ذكر" as Gender),
    birth_date: "",
    place_of_birth: "",
    nationality: "",
    document_type: "",
    document_number: "",
    marital_status: "",
    number_of_children: "",
    children_in_school: "",
  });

  const [contact, setContact] = useState<{
    phone: string;
    secondary_phone: string;
    whatsapp_number: string;
    email: string;
    address: string;
  }>({
    phone: "",
    secondary_phone: "",
    whatsapp_number: "",
      email: "",
    address: "",
  });

  const [education, setEducation] = useState<{
    highest_qualification: "" | "جامعي" | "ثانوي";
    academic_degree: "" | "دبلوم" | "بكالوريوس" | "ماجستير" | "دكتوراه";
    specialization: string;
    qualification: string;
  }>({
    highest_qualification: "",
    academic_degree: "",
    specialization: "",
      qualification: "",
  });

  const [experience, setExperience] = useState<{
    hire_date: string;
    appointment_date: string;
    years_of_teaching_experience: number | "";
    training_courses: string;
  }>({
    hire_date: today,
    appointment_date: "",
    years_of_teaching_experience: "",
    training_courses: "",
  });

  const [documents, setDocuments] = useState<{ photo: File | null }>({ photo: null });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [uploadedDocPaths, setUploadedDocPaths] = useState<string[]>([]);
  const [isDocsDialogOpen, setIsDocsDialogOpen] = useState(false);

  // Helpers
  const steps = isEditMode
    ? [
      "البيانات الشخصية",
      "بيانات التواصل",
      "المؤهلات العلمية",
      "الخبرة المهنية",
      "المستندات المطلوبة",
    ]
    : [
      "البيانات الشخصية",
      "بيانات التواصل",
      "المؤهلات العلمية",
      "الخبرة المهنية",
    ];

  const handleNext = () => {
    const valid = validateStep(activeStep);
    if (!valid) return;
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));
  const handleStepClick = (s: number) => setActiveStep(s);

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        if (!personal.national_id) return notify("الرقم الوطني مطلوب");
        if (!personal.name) return notify("الاسم الكامل مطلوب");
        if (!personal.gender) return notify("الجنس مطلوب");
        return true;
      case 1:
        if (!contact.email) return notify("البريد الإلكتروني مطلوب");
        return true;
      case 2:
        if (!education.qualification) return notify("المؤهل العلمي مطلوب");
        return true;
      case 3:
        if (!experience.hire_date) return notify("تاريخ التعيين مطلوب");
        return true;
      default:
        return true;
    }
  };

  const notify = (msg: string) => {
    enqueueSnackbar(msg, { variant: "error" });
    return false;
  };

  // Fetch data in Edit Mode -> hydrate local step states
  useEffect(() => {
    if (isEditMode && teacherId) {
      const fetchData = async () => {
        setIsFetchingData(true);
        resetCurrentTeacher();
        const teacherData = await getTeacherById(teacherId);
        setIsFetchingData(false);
        if (!teacherData) {
          enqueueSnackbar("المدرس المطلوب غير موجود", { variant: "error" });
          navigate("/teachers/list");
          return;
        }
        const t = teacherData.data as {
          national_id?: string; name?: string; gender?: Gender; birth_date?: string; place_of_birth?: string; nationality?: string;
          document_type?: "" | "جواز سفر" | "البطاقة الشخصية" | "الرقم الوطني"; document_number?: string; marital_status?: "" | "ارمل" | "مطلق" | "متزوج" | "اعزب";
          number_of_children?: number | null; children_in_school?: number | null; phone?: string; secondary_phone?: string; whatsapp_number?: string;
          email?: string; address?: string; highest_qualification?: "" | "جامعي" | "ثانوي"; academic_degree?: "" | "دبلوم" | "بكالوريوس" | "ماجستير" | "دكتوراه";
          specialization?: string; qualification?: string; hire_date?: string; appointment_date?: string; years_of_teaching_experience?: number | null;
          training_courses?: string; is_active?: boolean; photo_url?: string;
        };
        setPersonal({
          national_id: t.national_id || "",
          name: t.name || "",
          gender: ((t.gender ?? "ذكر") as Gender),
          birth_date: t.birth_date || "",
          place_of_birth: t.place_of_birth || "",
          nationality: t.nationality || "",
          document_type: (t.document_type as "" | "جواز سفر" | "البطاقة الشخصية" | "الرقم الوطني") || "",
          document_number: t.document_number || "",
          marital_status: (t.marital_status as "" | "ارمل" | "مطلق" | "متزوج" | "اعزب") || "",
          number_of_children: t.number_of_children ?? "",
          children_in_school: t.children_in_school ?? "",
        });
        setContact({
          phone: t.phone || "",
          secondary_phone: t.secondary_phone || "",
          whatsapp_number: t.whatsapp_number || "",
          email: t.email || "",
          address: t.address || "",
        });
        setEducation({
          highest_qualification: t.highest_qualification || "",
          academic_degree: t.academic_degree || "",
          specialization: t.specialization || "",
          qualification: t.qualification || "",
        });
        setExperience({
          hire_date: t.hire_date || today,
          appointment_date: t.appointment_date || "",
          years_of_teaching_experience: t.years_of_teaching_experience ?? "",
          training_courses: t.training_courses || "",
        });
        setIsActive(!!t.is_active);
        setPhotoPreview(t.photo_url || null);
      };
      fetchData();
    } else {
      resetCurrentTeacher();
    }
    return () => resetCurrentTeacher();
  }, [isEditMode, teacherId, getTeacherById, resetCurrentTeacher, enqueueSnackbar, navigate]);

  // Photo preview
  useEffect(() => {
    if (documents.photo instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(documents.photo);
    } else if (!documents.photo && isEditMode && currentTeacher?.data.photo_url) {
      setPhotoPreview(currentTeacher.data.photo_url);
    } else if (!documents.photo) {
      setPhotoPreview(null);
    }
  }, [documents.photo, currentTeacher, isEditMode]);

  // Submit (merge all local states)
  const onSubmit = async () => {
    setFormSubmitError(null);
    setFieldErrors({}); // Clear any previous field errors
    // Final validate current step
    if (!validateStep(activeStep)) return;

    const payload: TeacherFormData = {
      national_id: personal.national_id,
      name: personal.name,
      email: contact.email,
      phone: contact.phone || null,
      gender: personal.gender,
      birth_date: personal.birth_date || null,
      place_of_birth: personal.place_of_birth || null,
      nationality: personal.nationality || null,
      document_type: personal.document_type || null,
      document_number: personal.document_number || null,
      marital_status: personal.marital_status || null,
      number_of_children: personal.number_of_children === "" ? null : Number(personal.number_of_children),
      children_in_school: personal.children_in_school === "" ? null : Number(personal.children_in_school),
      secondary_phone: contact.secondary_phone || null,
      whatsapp_number: contact.whatsapp_number || null,
      qualification: education.qualification,
      highest_qualification: education.highest_qualification || null,
      specialization: education.specialization || null,
      academic_degree: education.academic_degree || null,
      hire_date: experience.hire_date,
      appointment_date: experience.appointment_date || null,
      years_of_teaching_experience:
        experience.years_of_teaching_experience === "" ? null : Number(experience.years_of_teaching_experience),
      training_courses: experience.training_courses || null,
      address: contact.address || null,
      photo: documents.photo || null,
      academic_qualifications_doc_path: null,
      personal_id_doc_path: null,
      cv_doc_path: null,
      is_active: isActive,
      photo_path: "",
    } as unknown as TeacherFormData;

    try {
      let result = null;
      if (isEditMode && teacherId) {
        result = await updateTeacher(teacherId, payload);
      } else {
        result = await createTeacher(payload);
      }

      // Only show success toast and navigate if the operation was successful
      if (result) {
        if (isEditMode) {
        enqueueSnackbar("تم تحديث بيانات المدرس بنجاح", { variant: "success" });
      } else {
        enqueueSnackbar("تم إضافة المدرس بنجاح", { variant: "success" });
      }
        navigate(`/teachers/${result.data.id}`);
      }
    } catch (error: unknown) {
      // Handle validation errors from Laravel
      const errorObj = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      
      if (errorObj.response?.data?.errors) {
        const errors = errorObj.response.data.errors;
        
        // Show the consolidated error message from backend
        if (errorObj.response.data.message) {
          enqueueSnackbar(errorObj.response.data.message, { 
        variant: "error",
            autoHideDuration: 8000 // Show for 8 seconds to allow reading
          });
        }
        
        // Set field-specific errors for highlighting
        const fieldErrorMap: Record<string, string> = {};
        Object.keys(errors).forEach(field => {
          if (Array.isArray(errors[field]) && errors[field].length > 0) {
            fieldErrorMap[field] = errors[field][0];
          }
        });
        setFieldErrors(fieldErrorMap);
        
        // Set the consolidated error message as form error
        setFormSubmitError(errorObj.response.data.message || "خطأ في التحقق من البيانات");
      } else {
        // Handle other types of errors
        const errorWithMessage = error as { message?: string; response?: { data?: { message?: string } } };
        const message = errorWithMessage.message || errorWithMessage.response?.data?.message || "حدث خطأ أثناء حفظ البيانات";
        setFormSubmitError(message);
        enqueueSnackbar(message, { variant: "error" });
      }
    }
  };

  // Renderers (controlled inputs per-step)
  const renderPersonal = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={personal.name}
            onChange={(e) => {
              setPersonal((p) => ({ ...p, name: e.target.value }));
              // Clear field error when user starts typing
              if (fieldErrors.name) {
                setFieldErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.name;
                  return newErrors;
                });
              }
            }}
            fullWidth
            label="الاسم الكامل *"
            placeholder="مثال: أحمد محمد علي"
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
          />
        </Box>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={personal.national_id}
            onChange={(e) => {
              setPersonal((p) => ({ ...p, national_id: e.target.value }));
              if (fieldErrors.national_id) {
                setFieldErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.national_id;
                  return newErrors;
                });
              }
            }}
            fullWidth
            label="الرقم الوطني *"
            placeholder="01234567890"
            error={!!fieldErrors.national_id}
            helperText={fieldErrors.national_id}
          />
        </Box>
     
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={personal.birth_date}
            onChange={(e) => setPersonal((p) => ({ ...p, birth_date: e.target.value }))}
            fullWidth
            type="date"
            label="تاريخ الميلاد"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={personal.place_of_birth}
            onChange={(e) => setPersonal((p) => ({ ...p, place_of_birth: e.target.value }))}
            fullWidth
            label="مكان الميلاد"
            placeholder="مثال: دمشق"
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={personal.nationality}
            onChange={(e) => setPersonal((p) => ({ ...p, nationality: e.target.value }))}
            fullWidth
            label="الجنسية"
            placeholder="مثال: سوري"
          />
        </Box>
        <Box sx={{ flex: "1 1 300px" }}>
          <FormControl fullWidth>
            <InputLabel>الجنس *</InputLabel>
            <Select
              label="الجنس *"
              value={personal.gender}
              onChange={(e) => setPersonal((p) => ({ ...p, gender: e.target.value as Gender }))}
            >
              <MenuItem value="ذكر">ذكر</MenuItem>
              <MenuItem value="انثي">أنثى</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <FormControl fullWidth>
            <InputLabel>نوع الوثيقة</InputLabel>
            <Select
              label="نوع الوثيقة"
              value={personal.document_type}
              onChange={(e) => setPersonal((p) => ({ ...p, document_type: e.target.value as "" | "جواز سفر" | "البطاقة الشخصية" | "الرقم الوطني" }))}
            >
              <MenuItem value="جواز سفر">جواز سفر</MenuItem>
              <MenuItem value="البطاقة الشخصية">البطاقة الشخصية</MenuItem>
              <MenuItem value="الرقم الوطني">الرقم الوطني</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={personal.document_number}
            onChange={(e) => setPersonal((p) => ({ ...p, document_number: e.target.value }))}
            fullWidth
            label="رقم الوثيقة"
            placeholder="رقم الوثيقة"
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <FormControl fullWidth>
            <InputLabel>الحالة الاجتماعية</InputLabel>
            <Select
              label="الحالة الاجتماعية"
              value={personal.marital_status}
              onChange={(e) => setPersonal((p) => ({ ...p, marital_status: e.target.value as "" | "ارمل" | "مطلق" | "متزوج" | "اعزب" }))}
            >
              <MenuItem value="اعزب">أعزب</MenuItem>
              <MenuItem value="متزوج">متزوج</MenuItem>
              <MenuItem value="مطلق">مطلق</MenuItem>
              <MenuItem value="ارمل">أرمل</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {personal.marital_status === "متزوج" && (
          <Box sx={{ flex: "1 1 300px" }}>
            <TextField
              value={personal.number_of_children}
              onChange={(e) =>
                setPersonal((p) => ({ ...p, number_of_children: e.target.value === "" ? "" : Number(e.target.value) }))
              }
              fullWidth
              type="number"
              label="عدد الأطفال"
            />
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={personal.children_in_school}
            onChange={(e) =>
              setPersonal((p) => ({ ...p, children_in_school: e.target.value === "" ? "" : Number(e.target.value) }))
            }
            fullWidth
            type="number"
            label="عدد الأطفال المسجلين في المدرسة"
          />
        </Box>
      </Box>
    </Box>
  );

  const renderContact = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={contact.phone}
            onChange={(e) => {
              setContact((c) => ({ ...c, phone: e.target.value }));
              // Clear field error when user starts typing
              if (fieldErrors.phone) {
                setFieldErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.phone;
                  return newErrors;
                });
              }
            }}
            fullWidth
            label="رقم الهاتف الأساسي"
            placeholder="09..."
            error={!!fieldErrors.phone}
            helperText={fieldErrors.phone}
          />
        </Box>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={contact.secondary_phone}
            onChange={(e) => {
              setContact((c) => ({ ...c, secondary_phone: e.target.value }));
              // Clear field error when user starts typing
              if (fieldErrors.secondary_phone) {
                setFieldErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.secondary_phone;
                  return newErrors;
                });
              }
            }}
            fullWidth
            label="رقم هاتف آخر"
            placeholder="09..."
            error={!!fieldErrors.secondary_phone}
            helperText={fieldErrors.secondary_phone}
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={contact.whatsapp_number}
            onChange={(e) => {
              setContact((c) => ({ ...c, whatsapp_number: e.target.value }));
              // Clear field error when user starts typing
              if (fieldErrors.whatsapp_number) {
                setFieldErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.whatsapp_number;
                  return newErrors;
                });
              }
            }}
            fullWidth
            label="رقم الواتساب"
            placeholder="09..."
            error={!!fieldErrors.whatsapp_number}
            helperText={fieldErrors.whatsapp_number}
          />
        </Box>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={contact.email}
            onChange={(e) => {
              setContact((c) => ({ ...c, email: e.target.value }));
              // Clear field error when user starts typing
              if (fieldErrors.email) {
                setFieldErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.email;
                  return newErrors;
                });
              }
            }}
            fullWidth
                      type="email"
            label="البريد الإلكتروني *"
                      placeholder="teacher@example.com"
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />
        </Box>
      </Box>
      <Box>
        <TextField
          value={contact.address}
          onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))}
          fullWidth
          multiline
          rows={3}
          label="العنوان الحالي بالتفصيل"
          placeholder="تفاصيل العنوان..."
        />
      </Box>
    </Box>
  );

  const renderEducation = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <FormControl fullWidth>
            <InputLabel>أعلى مؤهل علمي</InputLabel>
                    <Select
              label="أعلى مؤهل علمي"
              value={education.highest_qualification}
              onChange={(e) => setEducation((ed) => ({ ...ed, highest_qualification: e.target.value as "" | "جامعي" | "ثانوي" }))}
            >
              <MenuItem value="جامعي">جامعي</MenuItem>
              <MenuItem value="ثانوي">ثانوي</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flex: "1 1 300px" }}>
          <FormControl fullWidth>
            <InputLabel>الدرجة العلمية</InputLabel>
            <Select
              label="الدرجة العلمية"
              value={education.academic_degree}
              onChange={(e) => setEducation((ed) => ({ ...ed, academic_degree: e.target.value as "" | "دبلوم" | "بكالوريوس" | "ماجستير" | "دكتوراه" }))}
            >
              <MenuItem value="دبلوم">دبلوم</MenuItem>
              <MenuItem value="بكالوريوس">بكالوريوس</MenuItem>
              <MenuItem value="ماجستير">ماجستير</MenuItem>
              <MenuItem value="دكتوراه">دكتوراه</MenuItem>
                    </Select>
          </FormControl>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={education.specialization}
            onChange={(e) => setEducation((ed) => ({ ...ed, specialization: e.target.value }))}
            fullWidth
            label="التخصص"
            placeholder="مثال: عربي - انجليزي - رياضيات"
          />
        </Box>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={education.qualification}
            onChange={(e) => setEducation((ed) => ({ ...ed, qualification: e.target.value }))}
            fullWidth
            label="المؤهل العلمي *"
            placeholder="مثال: بكالوريوس تربية"
          />
        </Box>
      </Box>
    </Box>
  );

  const renderExperience = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={experience.hire_date}
            onChange={(e) => setExperience((ex) => ({ ...ex, hire_date: e.target.value }))}
            fullWidth
            type="date"
            label="تاريخ التعيين *"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={experience.appointment_date}
            onChange={(e) => setExperience((ex) => ({ ...ex, appointment_date: e.target.value }))}
            fullWidth
                      type="date"
            label="تاريخ التعيين بالمدرسة"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <TextField
            value={experience.years_of_teaching_experience}
            onChange={(e) =>
              setExperience((ex) => ({
                ...ex,
                years_of_teaching_experience: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            fullWidth
            type="number"
            label="عدد سنوات الخبرة في التدريس"
          />
        </Box>
      </Box>
      <Box>
        <TextField
          value={experience.training_courses}
          onChange={(e) => setExperience((ex) => ({ ...ex, training_courses: e.target.value }))}
          fullWidth
          multiline
          rows={3}
          label="الدورات التدريبية التربوية"
          placeholder="اذكر الدورات التدريبية التي حصلت عليها..."
        />
      </Box>
    </Box>
  );

  const renderDocuments = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom>
          الصورة الشخصية
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar src={photoPreview || undefined} sx={{ width: 80, height: 80 }}>
            <Person />
                </Avatar>
          <Box>
            <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                  {photoPreview ? "تغيير الصورة" : "اختيار صورة"}
              <input
                  type="file"
                hidden
                  ref={photoInputRef}
                  accept="image/*"
                  onChange={(e) =>
                  setDocuments({ photo: e.target.files?.[0] ?? null })
                  }
                />
            </Button>
                {photoPreview && (
              <IconButton
                    onClick={() => {
                  setDocuments({ photo: null });
                      setPhotoPreview(null);
                  if (photoInputRef.current) photoInputRef.current.value = "";
                }}
                color="error"
              >
                <Delete />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          المستندات المطلوبة
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload />}
            disabled={isUploadingDocs}
          >
            {isUploadingDocs ? "جارٍ رفع الملفات..." : "رفع مستندات المدرس (PDF)"}
            <input
              type="file"
              hidden
              accept=".pdf"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length === 0) return;
                if (!isEditMode || !teacherId) {
                  enqueueSnackbar("يرجى حفظ بيانات المدرس أولاً قبل رفع المستندات", { variant: "warning" });
                  return;
                }
                const formData = new FormData();
                files.forEach((file) => formData.append("documents[]", file));
                setIsUploadingDocs(true);
                try {
                  const { data } = await axiosClient.post(`/teachers/${teacherId}/documents`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  const paths: string[] = Array.isArray(data?.files) ? data.files : [];
                  setUploadedDocPaths(paths);
                  enqueueSnackbar("تم رفع المستندات بنجاح", { variant: "success" });
                } catch (err: unknown) {
                  const errorWithMessage = err as { response?: { data?: { message?: string } }; message?: string };
                  const message =
                    errorWithMessage.response?.data?.message || errorWithMessage.message || "فشل رفع المستندات";
                  enqueueSnackbar(message, { variant: "error" });
                } finally {
                  setIsUploadingDocs(false);
                  if (e.target) e.target.value = ""; // reset input
                }
              }}
            />
          </Button>
          {isEditMode && (
            <Button
              variant="contained"
              onClick={async () => {
                if (!teacherId) return;
                try {
                  const { data } = await axiosClient.get(`/teachers/${teacherId}/documents`);
                  const paths: string[] = Array.isArray(data?.files) ? data.files : [];
                  setUploadedDocPaths(paths);
                  setIsDocsDialogOpen(true);
                } catch {
                  enqueueSnackbar("تعذر تحميل قائمة المستندات", { variant: "error" });
                }
              }}
            >
              عرض المستندات
            </Button>
          )}
          {uploadedDocPaths.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              تم رفع {uploadedDocPaths.length} ملف(ات).
            </Typography>
          )}
        </Box>
      </Box>

      <Dialog open={isDocsDialogOpen} onClose={() => setIsDocsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>مستندات المدرس</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 2 }}>
            {uploadedDocPaths.length === 0 && (
              <Typography variant="body2" color="text.secondary">لا توجد مستندات</Typography>
            )}
            {uploadedDocPaths.map((path) => {
              const url = `${webUrl}storage/${path}`; // public disk URL
              const name = path.split('/').pop() || path;
              return (
                <Card key={path} variant="outlined">
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 1 }}>{name}</Typography>
                    <Button href={url} target="_blank" rel="noopener" size="small" variant="contained">
                      فتح PDF
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDocsDialogOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderPersonal();
      case 1:
        return renderContact();
      case 2:
        return renderEducation();
      case 3:
        return renderExperience();
      case 4:
        return renderDocuments();
      default:
        return null;
    }
  };

  // Loading & error states
  if (isFetchingData && isEditMode) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }} dir="rtl">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }} dir="rtl">
            <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate(isEditMode ? `/teachers/${teacherId}` : "/teachers/list")}
        sx={{ mb: 3 }}
      >
        {isEditMode ? "العودة لصفحة المدرس" : "العودة للقائمة"}
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? `تعديل بيانات المدرس: ${currentTeacher?.data.name || ""}` : "إضافة مدرس جديد"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          الرجاء ملء الحقول المطلوبة لـ {isEditMode ? "تحديث" : "إضافة"} المدرس.
        </Typography>

            {formSubmitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formSubmitError}
              </Alert>
            )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel onClick={() => handleStepClick(index)}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card>
          <CardContent>{getStepContent(activeStep)}</CardContent>
          <CardActions sx={{ justifyContent: "space-between", p: 3 }}>
            <Box>
              <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                السابق
              </Button>
              <Button variant="contained" onClick={handleNext} disabled={activeStep === steps.length - 1}>
                التالي
                </Button>
            </Box>
            {activeStep === steps.length - 1 && (
              <Button type="button" variant="contained" onClick={onSubmit} startIcon={<Save />}>
                  {isEditMode ? "حفظ التعديلات" : "إضافة مدرس"}
                  </Button>
              )}
          </CardActions>
      </Card>

        <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
          <FormControlLabel
            control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
            label="حالة الحساب نشطة"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherForm;
