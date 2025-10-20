// src/pages/teachers/TeacherView.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Divider,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import { ArrowBack, Edit, CalendarMonth, Mail, Phone, Place, School, Work, Person } from '@mui/icons-material';
import { useTeacherStore } from '@/stores/teacherStore';

dayjs.locale('ar');

const formatDate = (d?: string | null) => (d ? dayjs(d).format('DD/MM/YYYY') : 'غير محدد');
const show = (v?: string | number | null) => (v === undefined || v === null || v === '' ? 'غير محدد' : String(v));

const LabelRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode; ltr?: boolean }> = ({ label, value, icon, ltr = false }) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
    {icon}
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>{label}</Typography>
    <Typography variant="body2" sx={{ direction: ltr ? 'ltr' : 'rtl', textAlign: ltr ? 'left' : 'right' }}>{value}</Typography>
  </Stack>
);

const TeacherView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
  const { currentTeacher, loading, error, getTeacherById, resetCurrentTeacher } = useTeacherStore();

    useEffect(() => {
        const teacherId = parseInt(id ?? '', 10);
        if (!isNaN(teacherId)) {
            getTeacherById(teacherId);
        } else {
            navigate('/teachers/list');
        }
    return () => resetCurrentTeacher();
    }, [id, getTeacherById, resetCurrentTeacher, navigate]);

    if (loading) {
        return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }} dir="rtl">
        <CircularProgress />
      </Box>
    );
  }
    if (error) {
        return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }} dir="rtl">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
    if (!currentTeacher) {
        return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }} dir="rtl">
        <Alert severity="warning">لم يتم العثور على المدرس.</Alert>
      </Box>
    );
  }

  const t = currentTeacher.data as {
    id: number;
    name?: string;
    national_id?: string;
    email?: string;
    phone?: string;
    gender?: string;
    birth_date?: string | null;
    place_of_birth?: string | null;
    nationality?: string | null;
    document_type?: string | null;
    document_number?: string | null;
    marital_status?: string | null;
    number_of_children?: number | null;
    children_in_school?: number | null;
    secondary_phone?: string | null;
    whatsapp_number?: string | null;
    qualification?: string;
    highest_qualification?: string | null;
    specialization?: string | null;
    academic_degree?: string | null;
    hire_date?: string | null;
    appointment_date?: string | null;
    years_of_teaching_experience?: number | null;
    training_courses?: string | null;
    address?: string | null;
    photo_url?: string | null;
    is_active?: boolean;
  };

    return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }} dir="rtl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">ملف المدرس: {t.name || 'مدرس'}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/teachers/list')}>
                            العودة للقائمة
                        </Button>
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/teachers/${t.id}/edit`)}>
                            تعديل
                        </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' }, gap: 3 }}>
          <Box>
            <Stack alignItems="center" spacing={2}>
              <Avatar src={t.photo_url || undefined} sx={{ width: 120, height: 120 }}>
                <Person />
              </Avatar>
              <Chip
                label={t.is_active ? 'الحساب نشط' : 'الحساب غير نشط'}
                color={t.is_active ? 'success' : 'default'}
                variant={t.is_active ? 'filled' : 'outlined'}
              />
            </Stack>
          </Box>
          <Box>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardHeader title="المعلومات الأساسية" />
                <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <LabelRow label="الاسم الكامل" value={show(t.name)} icon={<Person fontSize="small" />} />
                  <LabelRow label="الرقم الوطني" value={show(t.national_id)} />
                  <LabelRow label="البريد الإلكتروني" value={show(t.email)} icon={<Mail fontSize="small" />} ltr={true} />
                  <LabelRow label="رقم الهاتف" value={show(t.phone)} icon={<Phone fontSize="small" />} ltr={true} />
                  <LabelRow label="الجنس" value={show(t.gender)} />
                  <LabelRow label="تاريخ الميلاد" value={formatDate(t.birth_date)} icon={<CalendarMonth fontSize="small" />} />
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardHeader title="بيانات التواصل" />
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <LabelRow label="هاتف آخر" value={show(t.secondary_phone)} ltr={true} />
                  <LabelRow label="رقم الواتساب" value={show(t.whatsapp_number)} ltr={true} />
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <LabelRow label="العنوان" value={show(t.address)} icon={<Place fontSize="small" />} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardHeader title="المؤهلات العلمية" />
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <LabelRow label="أعلى مؤهل" value={show(t.highest_qualification)} icon={<School fontSize="small" />} />
                  <LabelRow label="الدرجة العلمية" value={show(t.academic_degree)} />
                  <LabelRow label="التخصص" value={show(t.specialization)} />
                  <LabelRow label="المؤهل" value={show(t.qualification)} />
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardHeader title="الخبرة الوظيفية" />
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <LabelRow label="تاريخ التعيين" value={formatDate(t.hire_date)} icon={<CalendarMonth fontSize="small" />} />
                  <LabelRow label="تاريخ التعيين بالمدرسة" value={formatDate(t.appointment_date)} icon={<CalendarMonth fontSize="small" />} />
                  <LabelRow label="سنوات الخبرة" value={show(t.years_of_teaching_experience)} icon={<Work fontSize="small" />} />
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <LabelRow label="الدورات التدريبية" value={show(t.training_courses)} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="معلومات إضافية" />
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <LabelRow label="مكان الميلاد" value={show(t.place_of_birth)} />
                  <LabelRow label="الجنسية" value={show(t.nationality)} />
                  <LabelRow label="نوع الوثيقة" value={show(t.document_type)} />
                  <LabelRow label="رقم الوثيقة" value={show(t.document_number)} />
                  <LabelRow label="الحالة الاجتماعية" value={show(t.marital_status)} />
                  <LabelRow label="عدد الأطفال" value={show(t.number_of_children)} />
                  <LabelRow label="أطفال بالمدرسة" value={show(t.children_in_school)} />
                </Box>
                </CardContent>
            </Card>

            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/teachers/${t.id}/edit`)}>
                تعديل
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
    );
};

export default TeacherView;