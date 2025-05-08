// src/pages/settings/AcademicYearList.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon, RadioButtonUnchecked as RadioButtonUncheckedIcon, ArrowBack } from '@mui/icons-material';
import { useAcademicYearStore } from '@/stores/academicYearStore';
import { useSchoolStore } from '@/stores/schoolStore'; // Import school store
import AcademicYearForm from '@/components/settings/AcademicYearForm'; // Import the Form Dialog
import { AcademicYear } from '@/types/academicYear';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { NavLink } from 'react-router-dom';

const AcademicYearList: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { academicYears, loading, error, fetchAcademicYears, deleteAcademicYear } = useAcademicYearStore();
    const { schools, fetchSchools: fetchSchoolList, loading: schoolsLoading } = useSchoolStore(); // Get schools and fetch function
    const [formOpen, setFormOpen] = useState(false);
    const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
    const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<number | ''>(''); // State for filter

    // Fetch schools on mount
    useEffect(() => {
        fetchSchoolList();
    }, [fetchSchoolList]);

     // Fetch academic years when filter changes or initially
     useEffect(() => {
         fetchAcademicYears(selectedSchoolFilter || undefined); // Pass filter value or undefined
     }, [selectedSchoolFilter, fetchAcademicYears]);


    const handleOpenForm = (year?: AcademicYear) => {
        setEditingYear(year || null);
        setFormOpen(true);
    };
    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingYear(null);
    };

    const handleOpenDeleteDialog = (year: AcademicYear) => {
        setYearToDelete(year);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setYearToDelete(null);
        setDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        if (yearToDelete) {
            const success = await deleteAcademicYear(yearToDelete.id);
            if (success) enqueueSnackbar('تم حذف العام الدراسي بنجاح', { variant: 'success' });
             else enqueueSnackbar(useAcademicYearStore.getState().error || 'فشل حذف العام الدراسي', { variant: 'error' }); // Show specific error from store if delete fails
            handleCloseDeleteDialog();
        }
    };

     // Handle filter change
     const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
         setSelectedSchoolFilter(event.target.value as number | '');
     };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
                        <NavLink to={'..'}><ArrowBack/></NavLink>
            
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1">
                    الأعوام الدراسية
                </Typography>
                 {/* School Filter Dropdown */}
                 <FormControl sx={{ minWidth: 200 }} size="small">
                     <InputLabel id="school-filter-label">تصفية حسب المدرسة</InputLabel>
                     <Select
                         labelId="school-filter-label"
                         label="تصفية حسب المدرسة"
                         value={selectedSchoolFilter}
                         onChange={handleFilterChange}
                         disabled={schoolsLoading}
                     >
                         <MenuItem value=""><em>جميع المدارس</em></MenuItem>
                         {schools.map((school) => (
                             <MenuItem key={school.id} value={school.id}>{school.name}</MenuItem>
                         ))}
                     </Select>
                 </FormControl>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
                    إضافة عام دراسي
                </Button>
            </Box>

            {/* Loading and Error States */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Table */}
            {!loading && !error && (
                <Paper elevation={2}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="academic years table">
                            <TableHead sx={{ bgcolor: 'grey.100' }}>
                                <TableRow>
                                    <TableCell>اسم العام الدراسي</TableCell>
                                     <TableCell>المدرسة</TableCell>
                                    <TableCell align="center">تاريخ البداية</TableCell>
                                    <TableCell align="center">تاريخ النهاية</TableCell>
                                    <TableCell align="center">الحالي؟</TableCell>
                                    <TableCell align="right">إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {academicYears.length === 0 && (
                                     <TableRow><TableCell colSpan={6} align="center">لا توجد أعوام دراسية لعرضها.</TableCell></TableRow>
                                 )}
                                {academicYears.map((year) => (
                                    <TableRow key={year.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">{year.name}</TableCell>
                                         <TableCell>{year.school?.name || 'N/A'}</TableCell> {/* Display school name */}
                                        <TableCell align="center">{dayjs(year.start_date).format('YYYY/MM/DD')}</TableCell>
                                        <TableCell align="center">{dayjs(year.end_date).format('YYYY/MM/DD')}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title={year.is_current ? 'العام الدراسي الحالي' : 'ليس العام الحالي'}>
                                                 {year.is_current ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="disabled"/>}
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="تعديل">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenForm(year)}>
                                                        <EditIcon fontSize="inherit"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="حذف">
                                                    <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(year)}>
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
            <AcademicYearForm
                open={formOpen}
                onClose={handleCloseForm}
                initialData={editingYear}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent><DialogContentText>هل أنت متأكد من حذف العام الدراسي "{yearToDelete?.name}"؟</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                    <Button onClick={handleDeleteConfirm} color="error" >حذف</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AcademicYearList;