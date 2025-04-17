// src/pages/exams/ExamSchedulePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Divider, Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useExamStore } from '@/stores/examStore'; // To get Exam details
import { useExamScheduleStore } from '@/stores/examScheduleStore'; // To manage schedule items
import ExamScheduleFormDialog from '@/components/exams/ExamScheduleFormDialog'; // Import Form Dialog
import { ExamSchedule } from '@/types/examSchedule';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

const ExamSchedulePage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>(); // Get examId from route
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    // State for dialogs
    const [formOpen, setFormOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ExamSchedule | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<ExamSchedule | null>(null);

    // Exam details store (we need the main Exam object)
    // Assuming exam store can fetch single exam by ID, if not, adjust fetch logic
    const { exams: examList, fetchExams: fetchExamList } = useExamStore(); // Might need a getExamById action
    const exam = examList.find(e => e.id === Number(examId)); // Find exam details

    // Schedule store
    const { schedules, loading, error, fetchSchedules, deleteSchedule } = useExamScheduleStore();

    // Fetch exam details and schedules
    useEffect(() => {
         // Fetch list if exam not found locally (or implement getExamById in examStore)
         if (!exam) {
             fetchExamList();
         }
        if (examId) {
            fetchSchedules(Number(examId));
        }
    }, [examId, fetchSchedules, exam, fetchExamList]);

    // --- Dialog Handlers ---
    const handleOpenForm = (schedule?: ExamSchedule) => {
        setEditingSchedule(schedule || null);
        setFormOpen(true);
    };
    const handleCloseForm = (refetch = false) => {
        setFormOpen(false);
        setEditingSchedule(null);
        if (refetch && examId) {
            fetchSchedules(Number(examId)); // Refetch list on success
        }
    };

    const handleOpenDeleteDialog = (schedule: ExamSchedule) => {
        setScheduleToDelete(schedule);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setScheduleToDelete(null);
        setDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        if (scheduleToDelete) {
            const success = await deleteSchedule(scheduleToDelete.id);
            if (success) enqueueSnackbar('تم حذف الموعد بنجاح', { variant: 'success' });
            else enqueueSnackbar(useExamScheduleStore.getState().error || 'فشل حذف الموعد', { variant: 'error' });
            handleCloseDeleteDialog();
        }
    };


    // --- Render ---
    if (!examId) return <Container sx={{ mt: 4 }}><Alert severity="error">معرف دورة الامتحان غير موجود.</Alert></Container>;
    // Add loading state for exam details if fetched async
    if (!exam) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;


    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" component="h1">
                    جدول الامتحانات: {exam.name}
                </Typography>
                 <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/settings/exams')}>
                     العودة لقائمة الدورات
                 </Button>
            </Box>
             <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                 المدرسة: {exam.school?.name ?? 'N/A'} | الفترة: {dayjs(exam.start_date).format('YYYY/MM/DD')} - {dayjs(exam.end_date).format('YYYY/MM/DD')}
             </Typography>

             <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                 <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
                    إضافة موعد امتحان
                 </Button>
             </Box>


            {/* Loading/Error States */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Schedule Table */}
            {!loading && !error && (
                <Paper elevation={2}>
                    <TableContainer>
                        <Table sx={{ minWidth: 900 }} aria-label="exam schedule table" size="small">
                            <TableHead sx={{ bgcolor: 'grey.100' }}>
                                <TableRow>
                                    <TableCell>المادة</TableCell>
                                    <TableCell>المرحلة</TableCell>
                                    <TableCell>الفصل</TableCell>
                                    <TableCell>المراقب</TableCell>
                                    <TableCell align="center">التاريخ</TableCell>
                                    <TableCell align="center">الوقت</TableCell>
                                    <TableCell align="center">العلامة العظمى</TableCell>
                                    <TableCell align="center">علامة النجاح</TableCell>
                                    <TableCell align="right">إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {schedules.length === 0 && (
                                    <TableRow><TableCell colSpan={9} align="center">لا توجد مواعيد امتحانات مضافة لهذه الدورة.</TableCell></TableRow>
                                )}
                                {schedules.map((schedule) => (
                                    <TableRow key={schedule.id} hover>
                                        <TableCell>{schedule.subject?.name ?? '-'}</TableCell>
                                        <TableCell>{schedule.grade_level?.name ?? '-'}</TableCell>
                                        <TableCell>{schedule.classroom?.name ?? '-'}</TableCell>
                                        <TableCell>{schedule.teacher?.name ?? '-'}</TableCell>
                                        <TableCell align="center">{dayjs(schedule.exam_date).format('YYYY/MM/DD')}</TableCell>
                                        <TableCell align="center">{schedule.start_time.substring(0,5)} - {schedule.end_time.substring(0,5)}</TableCell>
                                        <TableCell align="center">{schedule.max_marks}</TableCell>
                                        <TableCell align="center">{schedule.pass_marks ?? '-'}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Tooltip title="تعديل الموعد">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenForm(schedule)}>
                                                        <EditIcon fontSize="inherit"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="حذف الموعد">
                                                    <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(schedule)}>
                                                        <DeleteIcon fontSize="inherit"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Form Dialog */}
            {/* Pass examId and schoolId to the form */}
            {exam && (
                 <ExamScheduleFormDialog
                     open={formOpen}
                     onClose={(refetch) => handleCloseForm(refetch)}
                     initialData={editingSchedule}
                     examId={exam.id}
                     schoolId={exam.school_id}
                 />
            )}


            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                 <DialogContent><DialogContentText>هل أنت متأكد من حذف موعد امتحان مادة "{scheduleToDelete?.subject?.name}"؟</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                    <Button onClick={handleDeleteConfirm} color="error">حذف</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ExamSchedulePage;