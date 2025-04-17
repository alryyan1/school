// src/pages/settings/ClassroomList.tsx (or similar path)
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton,
    Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Stack, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useClassroomStore } from '@/stores/classroomStore';   // Adjust path
import { useSchoolStore } from '@/stores/schoolStore';       // Adjust path
import { useGradeLevelStore } from '@/stores/gradeLevelStore'; // Adjust path
import ClassroomFormDialog from '@/components/settings/ClassroomFormDialog'; // Adjust path
import { Classroom } from '@/types/classroom';               // Adjust path
import { useSnackbar } from 'notistack';

const ClassroomList: React.FC = () => {
    // --- Hooks ---
    const { enqueueSnackbar } = useSnackbar();

    // --- Local State ---
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | ''>('');
    const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | ''>(''); // Filter optional
    const [formOpen, setFormOpen] = useState(false);
    const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);

    // --- Data from Stores ---
    const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
    const { gradeLevels, fetchGradeLevels } = useGradeLevelStore(); // Get all grade levels for filtering
    const { classrooms, loading, error, fetchClassrooms, deleteClassroom, clearClassrooms } = useClassroomStore();

    // --- Effects ---
    // Fetch initial dropdown data
    useEffect(() => {
        fetchSchools();
        fetchGradeLevels(); // Fetch all grades for filter dropdown
    }, [fetchSchools, fetchGradeLevels]);

    // Fetch classrooms when filters change
    useEffect(() => {
        // Only fetch if a school is selected
        if (selectedSchoolId) {
            fetchClassrooms({
                school_id: selectedSchoolId,
                grade_level_id: selectedGradeFilter || undefined, // Pass grade filter if selected
            });
        } else {
            clearClassrooms(); // Clear list if no school selected
        }
    }, [selectedSchoolId, selectedGradeFilter, fetchClassrooms, clearClassrooms]);

    // --- Handlers ---
    const handleSchoolChange = (event: SelectChangeEvent<number>) => {
        setSelectedSchoolId(event.target.value as number | '');
        setSelectedGradeFilter(''); // Reset grade filter when school changes
    };

    const handleGradeFilterChange = (event: SelectChangeEvent<number>) => {
         setSelectedGradeFilter(event.target.value as number | '');
    };

    const handleOpenForm = (classroom?: Classroom) => {
        setEditingClassroom(classroom || null);
        setFormOpen(true);
    };

    const handleCloseForm = (refetch = false) => {
        setFormOpen(false);
        setEditingClassroom(null);
        if (refetch && selectedSchoolId) { // Refetch only if a school is selected
            fetchClassrooms({
                school_id: selectedSchoolId,
                grade_level_id: selectedGradeFilter || undefined,
            });
        }
    };

    const handleOpenDeleteDialog = (classroom: Classroom) => {
        setClassroomToDelete(classroom);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setClassroomToDelete(null);
        setDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        if (classroomToDelete) {
            const success = await deleteClassroom(classroomToDelete.id);
            if (success) {
                enqueueSnackbar('تم حذف الفصل بنجاح', { variant: 'success' });
            } else {
                enqueueSnackbar(useClassroomStore.getState().error || 'فشل حذف الفصل', { variant: 'error' });
            }
            handleCloseDeleteDialog();
        }
    };

    // --- Render ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} dir="rtl">
            {/* Header & Filters */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                 <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <Typography variant="h5" component="h1">
                        إدارة الفصول الدراسية
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                        {/* School Filter */}
                        <FormControl sx={{ minWidth: 180 }} size="small" required>
                            <InputLabel id="classroom-school-filter-label">المدرسة *</InputLabel>
                            <Select labelId="classroom-school-filter-label" label="المدرسة *" value={selectedSchoolId} onChange={handleSchoolChange} disabled={schoolsLoading}>
                                <MenuItem value="" disabled><em>اختر مدرسة...</em></MenuItem>
                                {schoolsLoading ? <MenuItem disabled>...</MenuItem> : schools.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        {/* Grade Level Filter */}
                        <FormControl sx={{ minWidth: 180 }} size="small" disabled={!selectedSchoolId}>
                            <InputLabel id="classroom-grade-filter-label">المرحلة الدراسية</InputLabel>
                            <Select labelId="classroom-grade-filter-label" label="المرحلة الدراسية" value={selectedGradeFilter} onChange={handleGradeFilterChange}>
                                 <MenuItem value=""><em>(جميع المراحل)</em></MenuItem>
                                {gradeLevels.map(gl => <MenuItem key={gl.id} value={gl.id}>{gl.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        {/* Add Classroom Button */}
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()} disabled={!selectedSchoolId} size="medium">
                            إضافة فصل
                        </Button>
                    </Stack>
                 </Stack>
            </Paper>

            {/* Loading/Error/Info */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!loading && !selectedSchoolId && <Alert severity="info">الرجاء اختيار مدرسة لعرض الفصول الدراسية.</Alert>}

            {/* Table */}
            {!loading && !error && selectedSchoolId && (
                <Paper elevation={2} sx={{ overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 750 }} aria-label="classrooms table" size="small">
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>اسم الفصل</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>المرحلة (الصف)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>مدرس الفصل</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">السعة</TableCell>
                                    {/* Removed School column as it's filtered */}
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {classrooms.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>لا توجد فصول دراسية لعرضها حسب الفلتر المحدد.</TableCell></TableRow>
                                ) : (
                                    classrooms.map((classroom) => (
                                        <TableRow key={classroom.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell component="th" scope="row">{classroom.name}</TableCell>
                                            <TableCell>{classroom.grade_level?.name ?? '-'}</TableCell>
                                            <TableCell>{classroom.homeroom_teacher?.name ?? <Box component="em" sx={{ color: 'text.disabled' }}>غير محدد</Box>}</TableCell>
                                            <TableCell align="center">{classroom.capacity}</TableCell>
                                            <TableCell align="right">
                                                 <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                     <Tooltip title="تعديل الفصل">
                                                         <IconButton size="small" color="primary" onClick={() => handleOpenForm(classroom)}>
                                                             <EditIcon fontSize="inherit"/>
                                                         </IconButton>
                                                     </Tooltip>
                                                     <Tooltip title="حذف الفصل">
                                                         <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(classroom)}>
                                                             <DeleteIcon fontSize="inherit"/>
                                                         </IconButton>
                                                     </Tooltip>
                                                 </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Form Dialog */}
            {/* Pass schoolId for context, especially for validating teacher/grade assignment */}
             <ClassroomFormDialog
                open={formOpen}
                onClose={(refetch) => handleCloseForm(refetch)}
                initialData={editingClassroom}
                schoolId={selectedSchoolId} // Pass selected school ID
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} dir="rtl">
                 <DialogTitle>تأكيد الحذف</DialogTitle>
                 <DialogContent><DialogContentText>
                      هل أنت متأكد من حذف الفصل الدراسي "{classroomToDelete?.name}"؟
                      <br/>
                      <Typography variant="caption" color="error">
                          (تحذير: لا يمكن حذف الفصل إذا كان هناك طلاب مسجلون به.)
                      </Typography>
                 </DialogContentText></DialogContent>
                 <DialogActions>
                     <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                     <Button onClick={handleDeleteConfirm} color="error">تأكيد الحذف</Button>
                 </DialogActions>
             </Dialog>
        </Container>
    );
};

export default ClassroomList;