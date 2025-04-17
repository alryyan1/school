// src/pages/settings/ClassroomList.tsx (or similar path)
import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton,
    Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Stack, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useClassroomStore } from '@/stores/classroomStore';   // Adjust path
import { useSchoolStore } from '@/stores/schoolStore';       // Adjust path
// Removed: useGradeLevelStore - Fetching specific grades now
import { useSettingsStore } from '@/stores/settingsStore';   // Import settings store
import { SchoolApi } from '@/api/schoolApi';                   // Import School API to fetch grades
import ClassroomFormDialog from '@/components/settings/ClassroomFormDialog'; // Adjust path
import { Classroom } from '@/types/classroom';               // Adjust path
import { GradeLevel } from '@/types/gradeLevel';             // Adjust path
import { useSnackbar } from 'notistack';

const ClassroomList: React.FC = () => {
    // --- Hooks ---
    const { enqueueSnackbar } = useSnackbar();

    // --- Global Settings ---
    // Use Zustand's selector to get the initial value and subscribe to changes if needed,
    // or just get initial state if it won't change often while viewing this page.
    const initialActiveSchoolId = useSettingsStore.getState().activeSchoolId; // Get initial default

    // --- Local State ---
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | ''>(initialActiveSchoolId ?? '');
    const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | ''>('');
    // State for Grade Levels specific to the selected school
    const [availableGradeLevels, setAvailableGradeLevels] = useState<GradeLevel[]>([]);
    const [loadingGradeLevels, setLoadingGradeLevels] = useState<boolean>(false);
    // Dialog states
    const [formOpen, setFormOpen] = useState(false);
    const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);

    // --- Data from Stores ---
    const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
    const { classrooms, loading, error, fetchClassrooms, deleteClassroom, clearClassrooms } = useClassroomStore();

    // --- Effects ---
    // Fetch schools on mount
    useEffect(() => {
        fetchSchools();
    }, [fetchSchools]);

    // Fetch school-specific Grade Levels when school selection changes
    const fetchSchoolGrades = useCallback(async (schoolId: number) => {
        setLoadingGradeLevels(true);
        setAvailableGradeLevels([]); // Clear previous grades
        try {
            const response = await SchoolApi.getAssignedGradeLevels(schoolId);
            setAvailableGradeLevels(response.data.data ?? []);
        } catch (err) {
            console.error("Failed to fetch grade levels for school", err);
            enqueueSnackbar('فشل تحميل المراحل الدراسية لهذه المدرسة', { variant: 'error' });
            setAvailableGradeLevels([]);
        } finally {
            setLoadingGradeLevels(false);
        }
    }, [enqueueSnackbar]); // useCallback prevents unnecessary refetching if dependencies are stable

    // Fetch classrooms when filters change, and fetch grades when school changes
    useEffect(() => {
        if (selectedSchoolId) {
            // Fetch grades for the selected school
            fetchSchoolGrades(selectedSchoolId);
            // Fetch classrooms based on current school and grade filters
            fetchClassrooms({
                school_id: selectedSchoolId,
                grade_level_id: selectedGradeFilter || undefined,
            });
        } else {
            // Clear data if no school is selected
            clearClassrooms();
            setAvailableGradeLevels([]);
            setSelectedGradeFilter(''); // Reset grade filter
        }
    }, [selectedSchoolId, selectedGradeFilter, fetchClassrooms, clearClassrooms, fetchSchoolGrades]);


    // --- Handlers ---
    const handleSchoolChange = (event: SelectChangeEvent<number>) => {
        setSelectedSchoolId(event.target.value as number | '');
        setSelectedGradeFilter(''); // Reset grade filter when school changes
        // Fetching logic handled by useEffect
    };

    const handleGradeFilterChange = (event: SelectChangeEvent<number>) => {
         setSelectedGradeFilter(event.target.value as number | '');
         // Fetching logic handled by useEffect
    };

    const handleOpenForm = (classroom?: Classroom) => {
        // For create mode, ensure a grade level is selected first
        if (!isEditMode && !selectedGradeFilter) {
             enqueueSnackbar('الرجاء تحديد المرحلة الدراسية أولاً لإضافة فصل.', { variant: 'warning'});
             return;
         }
        setEditingClassroom(classroom || null);
        setFormOpen(true);
    };
    const isEditMode = !!editingClassroom; // Recalculate based on state

    const handleCloseForm = (refetch = false) => {
        setFormOpen(false);
        setEditingClassroom(null);
        if (refetch && selectedSchoolId) {
            fetchClassrooms({
                school_id: selectedSchoolId,
                grade_level_id: selectedGradeFilter || undefined,
            });
        }
    };

    const handleOpenDeleteDialog = (classroom: Classroom) => { /* ... */ setClassroomToDelete(classroom); setDeleteDialogOpen(true); };
    const handleCloseDeleteDialog = () => { /* ... */ setClassroomToDelete(null); setDeleteDialogOpen(false); };
    const handleDeleteConfirm = async () => { /* ... delete logic ... */ };

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
                        {/* Grade Level Filter (Uses school-specific grades) */}
                        <FormControl sx={{ minWidth: 180 }} size="small" disabled={!selectedSchoolId || loadingGradeLevels}>
                            <InputLabel id="classroom-grade-filter-label">المرحلة الدراسية</InputLabel>
                            <Select labelId="classroom-grade-filter-label" label="المرحلة الدراسية" value={selectedGradeFilter} onChange={handleGradeFilterChange}>
                                <MenuItem value=""><em>(جميع المراحل)</em></MenuItem>
                                {loadingGradeLevels ? <MenuItem disabled><em>جاري التحميل...</em></MenuItem> :
                                availableGradeLevels.length === 0 ? <MenuItem disabled><em>(لا مراحل لهذه المدرسة)</em></MenuItem> :
                                availableGradeLevels.map(gl => <MenuItem key={gl.id} value={gl.id}>{gl.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        {/* Add Classroom Button */}
                        <Button
                             variant="contained"
                             startIcon={<AddIcon />}
                             onClick={() => handleOpenForm()}
                             // Disable if no school OR no grade is selected
                             disabled={!selectedSchoolId || !selectedGradeFilter || loadingGradeLevels}
                             size="medium"
                             title={(!selectedSchoolId || !selectedGradeFilter) ? "اختر المدرسة والمرحلة أولاً" : "إضافة فصل جديد لهذه المرحلة"}
                        >
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
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {classrooms.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>لا توجد فصول دراسية لعرضها حسب الفلتر المحدد.</TableCell></TableRow>
                                ) : (
                                    classrooms.map((classroom) => (
                                        <TableRow key={classroom.id} hover>
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
            {/* Pass selectedSchoolId and selectedGradeFilter for Create mode context */}
            <ClassroomFormDialog
                open={formOpen}
                onClose={(refetch) => handleCloseForm(refetch)}
                initialData={editingClassroom}
                // Pass the REQUIRED context for creating
                // Ensure IDs are numbers or handle potential '' value in the dialog
                schoolId={Number(selectedSchoolId) || null}
                gradeLevelId={Number(selectedGradeFilter) || null}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} dir="rtl">
                { /* ... Delete Dialog content ... */ }
            </Dialog>
        </Container>
    );
};

export default ClassroomList;