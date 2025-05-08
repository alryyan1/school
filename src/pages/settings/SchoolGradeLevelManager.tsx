// src/pages/settings/SchoolGradeLevelManager.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, Paper,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Stack, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
    IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Grid,
    Divider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack } from '@mui/icons-material';
import { useSchoolStore } from '@/stores/schoolStore';       // Adjust path
import { useGradeLevelStore } from '@/stores/gradeLevelStore'; // Keep for getting ALL grades for assignment dialog
import { SchoolApi } from '@/api/schoolApi';                   // Use API directly here
import { GradeLevel } from '@/types/gradeLevel';             // Adjust path
import { useSnackbar } from 'notistack';
import { formatNumber } from '@/constants';
import AssignGradeLevelDialog from './AssignGradeLevelDialog';
import EditGradeFeeDialog from './EditGradeFeeDialog';
import { NavLink } from 'react-router-dom';

const SchoolGradeLevelManager: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();

    // --- State ---
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | ''>('');
    const [assignedGradeLevels, setAssignedGradeLevels] = useState<GradeLevel[]>([]); // Grades assigned to selected school (with pivot fees)
    const [loadingAssigned, setLoadingAssigned] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // Dialog States
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [editFeeDialogOpen, setEditFeeDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentGradeLevel, setCurrentGradeLevel] = useState<GradeLevel | null>(null); // For edit/delete context

    // --- Data from Stores ---
    const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
    // Fetch all grades for the assignment dialog
    const { gradeLevels: allGradeLevels, fetchGradeLevels } = useGradeLevelStore();

    // --- Effects ---
    // Fetch initial school and all grade level lists
    useEffect(() => {
        fetchSchools();
        fetchGradeLevels(); // Fetch all possible grades
    }, [fetchSchools, fetchGradeLevels]);

    // Fetch assigned grades when a school is selected
    const fetchAssigned = useCallback(async (schoolId: number) => {
        setLoadingAssigned(true);
        setError(null);
        try {
            const response = await SchoolApi.getAssignedGradeLevels(schoolId);
            console.log(response,'response')
            setAssignedGradeLevels(response.data.data ?? []);
        } catch (err: any) {
            console.error("Failed to fetch assigned grade levels", err);
            setError(err.response?.data?.message || 'فشل تحميل المراحل المعينة للمدرسة');
            setAssignedGradeLevels([]);
        } finally {
            setLoadingAssigned(false);
        }
    }, []); // No dependencies needed if SchoolApi is stable

    useEffect(() => {
        if (selectedSchoolId) {
            fetchAssigned(selectedSchoolId);
        } else {
            setAssignedGradeLevels([]); // Clear if no school selected
            setError(null);
        }
    }, [selectedSchoolId, fetchAssigned]);

    // --- Handlers ---
    const handleSchoolChange = (event: SelectChangeEvent<number>) => {
        
        setSelectedSchoolId(event.target.value as number );
        // Assigned grades will be fetched by the useEffect above
    };

    // Dialog Open/Close
    const handleOpenAssignDialog = () => setAssignDialogOpen(true);
    const handleCloseAssignDialog = (refetch = false) => {
        setAssignDialogOpen(false);
        if (refetch && selectedSchoolId) fetchAssigned(selectedSchoolId);
    };
    const handleOpenEditFeeDialog = (gradeLevel: GradeLevel) => {
        setCurrentGradeLevel(gradeLevel); // Set the grade with pivot data
        setEditFeeDialogOpen(true);
    };
    const handleCloseEditFeeDialog = (refetch = false) => {
        setEditFeeDialogOpen(false);
        setCurrentGradeLevel(null);
        if (refetch && selectedSchoolId) fetchAssigned(selectedSchoolId);
    };
    const handleOpenDeleteDialog = (gradeLevel: GradeLevel) => {
        setCurrentGradeLevel(gradeLevel);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setCurrentGradeLevel(null);
        setDeleteDialogOpen(false);
    };

    // Delete Action
    const handleDeleteConfirm = async () => {
        if (currentGradeLevel && selectedSchoolId) {
            try {
                await SchoolApi.detachGradeLevel(selectedSchoolId, currentGradeLevel.id);
                enqueueSnackbar('تم إلغاء تعيين المرحلة بنجاح', { variant: 'success' });
                fetchAssigned(selectedSchoolId); // Refetch the list
            } catch (err: any) {
                console.error("Detach error", err);
                 enqueueSnackbar(err.response?.data?.message || 'فشل إلغاء التعيين', { variant: 'error' });
            } finally {
                handleCloseDeleteDialog();
            }
        }
    };

    // Filter out already assigned grades for the Assign dialog
     const assignableGradeLevels = useMemo(() => {
         const assignedIds = new Set(assignedGradeLevels.map(gl => gl.id));
         return allGradeLevels.filter(gl => !assignedIds.has(gl.id));
     }, [allGradeLevels, assignedGradeLevels]);

    // --- Render ---
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }} dir="rtl">
            <NavLink to={'..'}><ArrowBack/></NavLink>
            <Typography variant="h4" component="h1" gutterBottom>
                إدارة المراحل الدراسية للمدارس
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                اختر مدرسة لعرض وتعديل المراحل الدراسية المعينة لها ورسومها الأساسية.
            </Typography>

            <Paper elevation={2} sx={{ p: {xs: 2, sm: 3} }}>
                <Grid container spacing={3} alignItems="center">
                    {/* School Selector */}
                    <Grid item xs={12} sm={8}>
                        <FormControl fullWidth required>
                            <InputLabel id="manage-grades-school-label">اختر المدرسة *</InputLabel>
                            <Select labelId="manage-grades-school-label" label="اختر المدرسة *" value={selectedSchoolId} onChange={handleSchoolChange} disabled={schoolsLoading}>
                                <MenuItem value="" disabled><em>-- اختر المدرسة --</em></MenuItem>
                                {schoolsLoading ? <MenuItem disabled>...</MenuItem> : schools.map(school => <MenuItem key={school.id} value={school.id}>{school.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* Assign Button */}
                    <Grid item xs={12} sm={4} sx={{ textAlign: { xs:'left', sm:'right'} }}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAssignDialog} disabled={!selectedSchoolId || assignableGradeLevels.length === 0}>
                            تعيين مرحلة جديدة
                        </Button>
                    </Grid>

                    {/* Assigned Grades Table */}
                    <Grid item xs={12}>
                         <Divider sx={{ my: 2 }} />
                         <Typography variant="h6" sx={{ mb: 2 }}>المراحل المعينة حالياً:</Typography>
                         {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                         {loadingAssigned && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}
                         {!loadingAssigned && !error && !selectedSchoolId && <Alert severity="info">اختر مدرسة لعرض المراحل.</Alert>}
                         {!loadingAssigned && !error && selectedSchoolId && (
                            <TableContainer component={Paper} elevation={1} variant="outlined">
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                                        <TableRow>
                                            <TableCell>المرحلة الدراسية</TableCell>
                                            <TableCell>الرمز</TableCell>
                                            <TableCell align="right">الرسوم الأساسية</TableCell>
                                            <TableCell align="center">إجراءات</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {assignedGradeLevels.length === 0 ? (
                                             <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>لا توجد مراحل معينة لهذه المدرسة.</TableCell></TableRow>
                                        ) : (
                                            assignedGradeLevels.map((grade) => (
                                                <TableRow key={grade.id} hover>
                                                    <TableCell>{grade.name}</TableCell>
                                                    <TableCell>{grade.code}</TableCell>
                                                    <TableCell align="right">{formatNumber(grade.assignment_details?.basic_fees)}</TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="تعديل الرسوم">
                                                            <IconButton size="small" color="primary" onClick={() => handleOpenEditFeeDialog(grade)}>
                                                                <EditIcon fontSize='small' />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="إلغاء تعيين المرحلة">
                                                            <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(grade)}>
                                                                <DeleteIcon fontSize='small' />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                         )}
                    </Grid>
                </Grid>
            </Paper>

             {/* Dialogs */}
             {selectedSchoolId && (
                 <AssignGradeLevelDialog
                     open={assignDialogOpen}
                     onClose={(refetch) => handleCloseAssignDialog(refetch)}
                     schoolId={selectedSchoolId}
                     availableGrades={assignableGradeLevels} // Pass only grades not already assigned
                     allGrades={allGradeLevels} // Pass all for potential future use? Maybe not needed
                 />
             )}

             {selectedSchoolId && currentGradeLevel && (
                 <EditGradeFeeDialog
                      open={editFeeDialogOpen}
                      onClose={(refetch) => handleCloseEditFeeDialog(refetch)}
                      schoolId={selectedSchoolId}
                      gradeLevel={currentGradeLevel} // Pass the grade level with its current pivot data
                 />
             )}


            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} dir="rtl">
                 <DialogTitle>تأكيد إلغاء التعيين</DialogTitle>
                 <DialogContent><DialogContentText>
                      هل أنت متأكد من إلغاء تعيين المرحلة "{currentGradeLevel?.name}" من هذه المدرسة؟
                      <br/>
                       <Typography variant="caption" color="error">
                           (تحذير: قد يؤثر هذا على الفصول أو تسجيلات الطلاب المرتبطة - تأكد من منطق الحذف في الخلفية)
                       </Typography>
                 </DialogContentText></DialogContent>
                 <DialogActions>
                     <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                     <Button onClick={handleDeleteConfirm} color="error">إلغاء التعيين</Button>
                 </DialogActions>
             </Dialog>

        </Container>
    );
};

export default SchoolGradeLevelManager;