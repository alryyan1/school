// src/pages/settings/ClassroomList.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useClassroomStore } from '@/stores/classroomStore';
import { useSchoolStore } from '@/stores/schoolStore';
import { useGradeLevelStore } from '@/stores/gradeLevelStore';
import ClassroomFormDialog from '@/components/settings/ClassroomFormDialog';
import { Classroom } from '@/types/classroom';
import { useSnackbar } from 'notistack';

const ClassroomList: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { classrooms, loading, error, fetchClassrooms, deleteClassroom, clearClassrooms } = useClassroomStore();
    const { schools, fetchSchools: fetchSchoolList } = useSchoolStore();
    const { gradeLevels, fetchGradeLevels } = useGradeLevelStore();

    const [formOpen, setFormOpen] = useState(false);
    const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);

    // --- Filters State ---
    const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<number | ''>('');
    const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | ''>('');

    // Fetch initial dropdown data
    useEffect(() => {
        fetchSchoolList();
        fetchGradeLevels();
    }, [fetchSchoolList, fetchGradeLevels]);

    // Fetch classrooms when filters change
    useEffect(() => {
        // Only fetch if a school is selected (or fetch all if needed)
        if (selectedSchoolFilter) {
             fetchClassrooms({
                 school_id: selectedSchoolFilter || undefined,
                 grade_level_id: selectedGradeFilter || undefined,
             });
        } else {
            clearClassrooms(); // Clear list if no school selected
        }
    }, [selectedSchoolFilter, selectedGradeFilter, fetchClassrooms, clearClassrooms]);


    const handleOpenForm = (classroom?: Classroom) => {
        setEditingClassroom(classroom || null);
        setFormOpen(true);
    };
    const handleCloseForm = (shouldRefetch = false) => {
        setFormOpen(false);
        setEditingClassroom(null);
        // Refetch if an item was added/updated to ensure list is current for the filters
         if (shouldRefetch && selectedSchoolFilter) {
             fetchClassrooms({
                  school_id: selectedSchoolFilter || undefined,
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

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            {/* Header & Filters */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1">
                    الفصول الدراسية
                </Typography>
                <Stack direction="row" spacing={2}>
                     <FormControl sx={{ minWidth: 180 }} size="small">
                         <InputLabel id="school-flt-lbl">المدرسة</InputLabel>
                         <Select labelId="school-flt-lbl" label="المدرسة" value={selectedSchoolFilter} onChange={(e) => setSelectedSchoolFilter(e.target.value as number)}>
                             <MenuItem value=""><em>اختر مدرسة...</em></MenuItem>
                             {schools.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                         </Select>
                     </FormControl>
                     <FormControl sx={{ minWidth: 180 }} size="small">
                         <InputLabel id="grade-flt-lbl">المرحلة</InputLabel>
                         <Select labelId="grade-flt-lbl" label="المرحلة" value={selectedGradeFilter} onChange={(e) => setSelectedGradeFilter(e.target.value as number)}>
                              <MenuItem value=""><em>الكل</em></MenuItem>
                             {gradeLevels.map(gl => <MenuItem key={gl.id} value={gl.id}>{gl.name}</MenuItem>)}
                         </Select>
                     </FormControl>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()} disabled={!selectedSchoolFilter}> {/* Require school selection to add */}
                        إضافة فصل
                    </Button>
                </Stack>
            </Box>

            {/* Loading/Error/Info */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!loading && !selectedSchoolFilter && <Alert severity="info">الرجاء اختيار مدرسة لعرض الفصول الدراسية.</Alert>}


            {/* Table */}
            {!loading && !error && selectedSchoolFilter && (
                <Paper elevation={2}>
                    <TableContainer>
                        <Table sx={{ minWidth: 750 }} aria-label="classrooms table">
                            <TableHead sx={{ bgcolor: 'grey.100' }}>
                                <TableRow>
                                    <TableCell>اسم الفصل</TableCell>
                                    <TableCell>المرحلة (الصف)</TableCell>
                                    <TableCell>مدرس الفصل</TableCell>
                                    <TableCell align="center">السعة</TableCell>
                                    <TableCell align="right">إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {classrooms.length === 0 && (
                                    <TableRow><TableCell colSpan={5} align="center">لا توجد فصول دراسية لعرضها لهذه المدرسة/المرحلة.</TableCell></TableRow>
                                )}
                                {classrooms.map((classroom) => (
                                    <TableRow key={classroom.id} hover>
                                        <TableCell>{classroom.name}</TableCell>
                                        <TableCell>{classroom.grade_level?.name ?? 'N/A'}</TableCell>
                                        <TableCell>{classroom.homeroom_teacher?.name ?? <Box component="em" sx={{color: 'text.secondary'}}>غير محدد</Box>}</TableCell>
                                        <TableCell align="center">{classroom.capacity}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="تعديل">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenForm(classroom)}>
                                                        <EditIcon fontSize="inherit"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="حذف">
                                                    <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(classroom)}>
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
            <ClassroomFormDialog
                open={formOpen}
                onClose={() => handleCloseForm(true)} // Pass true to potentially refetch on close after save
                initialData={editingClassroom}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent><DialogContentText>هل أنت متأكد من حذف الفصل "{classroomToDelete?.name}"؟ تأكد من عدم وجود طلاب مسجلين به.</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                    <Button onClick={handleDeleteConfirm} color="error">حذف</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ClassroomList;