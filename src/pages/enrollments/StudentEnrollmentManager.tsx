// src/pages/enrollments/StudentEnrollmentManager.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAcademicYearStore } from '@/stores/academicYearStore';
import { useGradeLevelStore } from '@/stores/gradeLevelStore';
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore';
import EnrollmentFormDialog from '@/components/enrollments/EnrollmentFormDialog';
import UpdateEnrollmentDialog from '@/components/enrollments/UpdateEnrollmentDialog';
import { StudentAcademicYear } from '@/types/studentAcademicYear';
import { AcademicYear } from '@/types/academicYear';
import { GradeLevel } from '@/types/gradeLevel';
import { useSnackbar } from 'notistack';

// Helper to get status chip color
const getStatusColor = (status: string): "success" | "info" | "warning" | "error" | "default" => {
    switch (status) {
        case 'active': return 'success';
        case 'graduated': return 'info';
        case 'transferred': return 'warning';
        case 'withdrawn': return 'error';
        default: return 'default';
    }
};


const StudentEnrollmentManager: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();

    // --- State for selections ---
    const [selectedYearId, setSelectedYearId] = useState<number | ''>('');
    const [selectedGradeId, setSelectedGradeId] = useState<number | ''>('');

    // --- Get data/actions from stores ---
    const { academicYears, fetchAcademicYears } = useAcademicYearStore();
    const { gradeLevels, fetchGradeLevels } = useGradeLevelStore();
    const { enrollments, loading, error, fetchEnrollments, deleteEnrollment, clearEnrollments } = useStudentEnrollmentStore();

    // --- State for Dialogs ---
    const [enrollFormOpen, setEnrollFormOpen] = useState(false);
    const [updateFormOpen, setUpdateFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentEnrollment, setCurrentEnrollment] = useState<StudentAcademicYear | null>(null);

     // --- Fetch initial dropdown lists ---
     useEffect(() => {
         fetchAcademicYears();
         fetchGradeLevels();
     }, [fetchAcademicYears, fetchGradeLevels]);

     // --- Fetch enrollments when filters change ---
     useEffect(() => {
         if (selectedYearId && selectedGradeId) {
             fetchEnrollments({
                 academic_year_id: selectedYearId,
                 grade_level_id: selectedGradeId,
             });
         } else {
             clearEnrollments(); // Clear list if selection is incomplete
         }
     }, [selectedYearId, selectedGradeId, fetchEnrollments, clearEnrollments]);


    // --- Dialog Handlers ---
    const handleOpenEnrollForm = () => setEnrollFormOpen(true);
    const handleCloseEnrollForm = () => setEnrollFormOpen(false);

    const handleOpenUpdateForm = (enrollment: StudentAcademicYear) => {
        setCurrentEnrollment(enrollment);
        setUpdateFormOpen(true);
    };
    const handleCloseUpdateForm = () => {
        setUpdateFormOpen(false);
        setCurrentEnrollment(null);
    };

    const handleOpenDeleteDialog = (enrollment: StudentAcademicYear) => {
        setCurrentEnrollment(enrollment);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setCurrentEnrollment(null);
        setDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        if (currentEnrollment) {
            const success = await deleteEnrollment(currentEnrollment.id);
            if (success) enqueueSnackbar('تم حذف التسجيل بنجاح', { variant: 'success' });
            else enqueueSnackbar(useStudentEnrollmentStore.getState().error || 'فشل حذف التسجيل', { variant: 'error' });
            handleCloseDeleteDialog();
        }
    };

    // Find selected objects for passing to dialog
     const selectedAcademicYearObj = academicYears.find(ay => ay.id === selectedYearId) || null;
     const selectedGradeLevelObj = gradeLevels.find(gl => gl.id === selectedGradeId) || null;

    return (
        <Container style={{direction:'rtl'}} maxWidth="xl" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            {/* Header & Filters */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1">
                    إدارة تسجيل الطلاب السنوي
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                     <FormControl sx={{ minWidth: 200 }} size="small">
                         <InputLabel id="enroll-ay-select-label">العام الدراسي</InputLabel>
                         <Select labelId="enroll-ay-select-label" label="العام الدراسي" value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value as number)}>
                             <MenuItem value="" disabled><em>اختر عاماً...</em></MenuItem>
                             {academicYears.map(ay => <MenuItem key={ay.id} value={ay.id}>{ay.name}</MenuItem>)}
                         </Select>
                     </FormControl>
                      <FormControl sx={{ minWidth: 200 }} size="small">
                         <InputLabel id="enroll-gl-select-label">المرحلة الدراسية</InputLabel>
                         <Select labelId="enroll-gl-select-label" label="المرحلة الدراسية" value={selectedGradeId} onChange={(e) => setSelectedGradeId(e.target.value as number)}>
                              <MenuItem value="" disabled><em>اختر مرحلة...</em></MenuItem>
                             {gradeLevels.map(gl => <MenuItem key={gl.id} value={gl.id}>{gl.name}</MenuItem>)}
                         </Select>
                     </FormControl>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenEnrollForm} disabled={!selectedYearId || !selectedGradeId}>
                        تسجيل طالب
                    </Button>
                </Stack>
            </Box>

            {/* Loading/Error/Info */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!loading && (!selectedYearId || !selectedGradeId) && <Alert severity="info">الرجاء تحديد العام الدراسي والمرحلة لعرض الطلاب المسجلين.</Alert>}


             {/* Enrollments Table */}
             {!loading && !error && selectedYearId && selectedGradeId && (
                 <Paper elevation={2}>
                     <TableContainer>
                         <Table sx={{ minWidth: 750 }} aria-label="student enrollments table">
                             <TableHead sx={{ bgcolor: 'grey.100' }}>
                                 <TableRow>
                                     <TableCell>الكود</TableCell>
                                     <TableCell>اسم الطالب</TableCell>
                                     <TableCell>الرقم الوطني</TableCell>
                                     <TableCell>الفصل</TableCell>
                                     <TableCell align='center'>الحالة</TableCell>
                                     <TableCell align="right">إجراءات</TableCell>
                                 </TableRow>
                             </TableHead>
                             <TableBody>
                                 {enrollments.length === 0 && (
                                     <TableRow><TableCell colSpan={5} align="center">لا يوجد طلاب مسجلون لهذه المرحلة في هذا العام.</TableCell></TableRow>
                                 )}
                                 {enrollments.map((enrollment) => (
                                     <TableRow key={enrollment.id} hover>
                                         <TableCell>{enrollment.id}</TableCell>
                                         <TableCell>{enrollment.student?.student_name ?? 'N/A'}</TableCell>
                                         <TableCell>{enrollment.student?.goverment_id || '-'}</TableCell>
                                         <TableCell>{enrollment.classroom?.name ?? <Box component="em" sx={{color: 'text.secondary'}}>غير محدد</Box>}</TableCell>
                                          <TableCell align='center'>
                                              <Chip label={enrollment.status} color={getStatusColor(enrollment.status)} size="small"/>
                                          </TableCell>
                                         <TableCell align="right">
                                             <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                 <Tooltip title="تعديل الحالة/الفصل">
                                                     <IconButton size="small" color="primary" onClick={() => handleOpenUpdateForm(enrollment)}>
                                                         <EditIcon fontSize="inherit"/>
                                                     </IconButton>
                                                 </Tooltip>
                                                 <Tooltip title="حذف التسجيل">
                                                     <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(enrollment)}>
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


              {/* --- Dialogs --- */}
               <EnrollmentFormDialog
                 open={enrollFormOpen}
                 onClose={handleCloseEnrollForm}
                 selectedAcademicYear={selectedAcademicYearObj}
                 selectedGradeLevel={selectedGradeLevelObj}
               />

               <UpdateEnrollmentDialog
                    open={updateFormOpen}
                    onClose={handleCloseUpdateForm}
                    enrollmentData={currentEnrollment}
               />

             {/* Delete Confirmation Dialog */}
             <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                 <DialogTitle>تأكيد حذف التسجيل</DialogTitle>
                 <DialogContent><DialogContentText>هل أنت متأكد من حذف تسجيل الطالب "{currentEnrollment?.student?.student_name}" من العام الدراسي "{currentEnrollment?.academic_year?.name}"?</DialogContentText></DialogContent>
                 <DialogActions>
                     <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                     <Button onClick={handleDeleteConfirm} color="error">حذف التسجيل</Button>
                 </DialogActions>
             </Dialog>

        </Container>
    );
};

export default StudentEnrollmentManager;