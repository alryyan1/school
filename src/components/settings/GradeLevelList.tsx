// src/pages/settings/GradeLevelList.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack } from '@mui/icons-material';
import { useGradeLevelStore } from '@/stores/gradeLevelStore';
import GradeLevelForm from '@/components/settings/GradeLevelForm'; // Import the Form Dialog
import { GradeLevel } from '@/types/gradeLevel';
import { useSnackbar } from 'notistack';
import { NavLink } from 'react-router-dom';

const GradeLevelList: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { gradeLevels, loading, error, fetchGradeLevels, deleteGradeLevel } = useGradeLevelStore();
    const [formOpen, setFormOpen] = useState(false);
    const [editingGradeLevel, setEditingGradeLevel] = useState<GradeLevel | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [gradeLevelToDelete, setGradeLevelToDelete] = useState<GradeLevel | null>(null);

    useEffect(() => {
        fetchGradeLevels();
    }, [fetchGradeLevels]);

    const handleOpenForm = (gradeLevel?: GradeLevel) => {
        setEditingGradeLevel(gradeLevel || null);
        setFormOpen(true);
    };
    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingGradeLevel(null);
    };

    const handleOpenDeleteDialog = (gradeLevel: GradeLevel) => {
        setGradeLevelToDelete(gradeLevel);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setGradeLevelToDelete(null);
        setDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        if (gradeLevelToDelete) {
            const success = await deleteGradeLevel(gradeLevelToDelete.id);
            if (success) {
                 enqueueSnackbar('تم حذف المرحلة بنجاح', { variant: 'success' });
             } else {
                 // Show specific error from store (e.g., conflict error)
                 enqueueSnackbar(useGradeLevelStore.getState().error || 'فشل حذف المرحلة', { variant: 'error' });
             }
            handleCloseDeleteDialog();
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
                                        <NavLink  to={'..'}><ArrowBack/></NavLink>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    المراحل الدراسية (الصفوف)
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
                    إضافة مرحلة
                </Button>
            </Box>

            {/* Loading and Error States */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Table */}
            {!loading && !error && (
                <Paper elevation={2}>
                    
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="grade levels table">
                            <TableHead sx={{ bgcolor: 'grey.100' }}>
                                <TableRow>
                                    <TableCell>اسم المرحلة</TableCell>
                                    <TableCell>الرمز</TableCell>
                                    <TableCell>الوصف</TableCell>
                                    <TableCell align="right">إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                 {gradeLevels.length === 0 && (
                                     <TableRow><TableCell colSpan={4} align="center">لا توجد مراحل دراسية لعرضها.</TableCell></TableRow>
                                 )}
                                {gradeLevels.map((gradeLevel) => (
                                    <TableRow key={gradeLevel.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">{gradeLevel.name}</TableCell>
                                        <TableCell>{gradeLevel.code}</TableCell>
                                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {gradeLevel.description || '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="تعديل">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenForm(gradeLevel)}>
                                                        <EditIcon fontSize="inherit"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="حذف">
                                                    <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(gradeLevel)}>
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
            <GradeLevelForm
                open={formOpen}
                onClose={handleCloseForm}
                initialData={editingGradeLevel}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent><DialogContentText>هل أنت متأكد من حذف المرحلة "{gradeLevelToDelete?.name}"؟ تأكد من عدم وجود صفوف دراسية أو طلاب مسجلين مرتبطين بها.</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                    <Button onClick={handleDeleteConfirm} color="error">حذف</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GradeLevelList;