// src/pages/exams/ExamList.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useExamStore } from '@/stores/examStore';
import { useSchoolStore } from '@/stores/schoolStore';
import ExamFormDialog from '@/components/exams/ExamFormDialog'; // Import Form Dialog
import { Exam } from '@/types/exam';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

const ExamList: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { exams, loading, error, fetchExams, deleteExam, clearExams } = useExamStore();
    const { schools, fetchSchools } = useSchoolStore();
    const [formOpen, setFormOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
    const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<number | ''>('');

    useEffect(() => {
        fetchSchools(); // Fetch schools for filter dropdown
    }, [fetchSchools]);

    useEffect(() => {
        // Fetch exams based on filter (or all if none selected initially)
         fetchExams({ school_id: selectedSchoolFilter || undefined });
         // Uncomment below if you want to clear list when no school selected
         // if (selectedSchoolFilter) {
         //    fetchExams({ school_id: selectedSchoolFilter });
         // } else {
         //    clearExams();
         // }
    }, [selectedSchoolFilter, fetchExams, clearExams]);

    const handleOpenForm = (exam?: Exam) => {
        setEditingExam(exam || null);
        setFormOpen(true);
    };
    const handleCloseForm = (shouldRefetch = true) => { // Refetch by default after save
        setFormOpen(false);
        setEditingExam(null);
         if (shouldRefetch) {
             fetchExams({ school_id: selectedSchoolFilter || undefined });
         }
    };

    const handleOpenDeleteDialog = (exam: Exam) => { /* ... */ setExamToDelete(exam); setDeleteDialogOpen(true); };
    const handleCloseDeleteDialog = () => { /* ... */ setExamToDelete(null); setDeleteDialogOpen(false); };
    const handleDeleteConfirm = async () => {
        if (examToDelete) {
            const success = await deleteExam(examToDelete.id);
            if (success) enqueueSnackbar('تم حذف دورة الامتحان بنجاح', { variant: 'success' });
            else enqueueSnackbar(useExamStore.getState().error || 'فشل حذف دورة الامتحان', { variant: 'error' });
            handleCloseDeleteDialog();
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            {/* Header & Filters */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap:'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1">
                    دورات الامتحانات
                </Typography>
                 <Stack direction="row" spacing={2}>
                      <FormControl sx={{ minWidth: 200 }} size="small">
                         <InputLabel id="exam-school-filter-label">المدرسة</InputLabel>
                         <Select labelId="exam-school-filter-label" label="المدرسة" value={selectedSchoolFilter} onChange={(e) => setSelectedSchoolFilter(e.target.value as number)}>
                             <MenuItem value=""><em>جميع المدارس</em></MenuItem>
                             {schools.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                         </Select>
                     </FormControl>
                     <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
                         إضافة دورة امتحان
                     </Button>
                 </Stack>
            </Box>

            {/* Loading/Error */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Table */}
            {!loading && !error && (
                <Paper elevation={2}>
                    <TableContainer>
                        <Table sx={{ minWidth: 750 }} aria-label="exams table">
                            <TableHead sx={{ bgcolor: 'grey.100' }}>
                                <TableRow>
                                    <TableCell>اسم الدورة</TableCell>
                                    <TableCell>المدرسة</TableCell>
                                    <TableCell align="center">تاريخ البداية</TableCell>
                                    <TableCell align="center">تاريخ النهاية</TableCell>
                                    <TableCell>الوصف</TableCell>
                                    <TableCell align="right">إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                 {exams.length === 0 && (
                                     <TableRow><TableCell colSpan={6} align="center">لا توجد دورات امتحانات لعرضها.</TableCell></TableRow>
                                 )}
                                {exams.map((exam) => (
                                    <TableRow key={exam.id} hover>
                                        <TableCell component="th" scope="row">{exam.name}</TableCell>
                                         <TableCell>{exam.school?.name ?? 'N/A'}</TableCell> {/* Show School Name */}
                                        <TableCell align="center">{dayjs(exam.start_date).format('YYYY/MM/DD')}</TableCell>
                                        <TableCell align="center">{dayjs(exam.end_date).format('YYYY/MM/DD')}</TableCell>
                                        <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {exam.description || '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="تعديل">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenForm(exam)}>
                                                        <EditIcon fontSize="inherit"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="حذف">
                                                    <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(exam)}>
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
            <ExamFormDialog
                open={formOpen}
                onClose={() => handleCloseForm(true)} // Refetch after close
                initialData={editingExam}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent><DialogContentText>هل أنت متأكد من حذف دورة الامتحان "{examToDelete?.name}"؟</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                    <Button onClick={handleDeleteConfirm} color="error">حذف</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ExamList;