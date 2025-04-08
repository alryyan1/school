// src/pages/settings/SubjectList.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSubjectStore } from '@/stores/subjectStore';
import SubjectFormDialog from '@/components/settings/SubjectFormDialog'; // Import the Form Dialog
import { Subject } from '@/types/subject';
import { useSnackbar } from 'notistack';

const SubjectList: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { subjects, loading, error, fetchSubjects, deleteSubject } = useSubjectStore();
    const [formOpen, setFormOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const handleOpenForm = (subject?: Subject) => {
        setEditingSubject(subject || null);
        setFormOpen(true);
    };
    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingSubject(null);
    };

    const handleOpenDeleteDialog = (subject: Subject) => {
        setSubjectToDelete(subject);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setSubjectToDelete(null);
        setDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        if (subjectToDelete) {
            const success = await deleteSubject(subjectToDelete.id);
            if (success) {
                enqueueSnackbar('تم حذف المادة بنجاح', { variant: 'success' });
            } else {
                enqueueSnackbar(useSubjectStore.getState().error || 'فشل حذف المادة', { variant: 'error' });
            }
            handleCloseDeleteDialog();
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    المواد الدراسية
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
                    إضافة مادة
                </Button>
            </Box>

            {/* Loading and Error States */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Table */}
            {!loading && !error && (
                <Paper elevation={2}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="subjects table">
                            <TableHead sx={{ bgcolor: 'grey.100' }}>
                                <TableRow>
                                    <TableCell>اسم المادة</TableCell>
                                    <TableCell>الرمز</TableCell>
                                    <TableCell>الوصف</TableCell>
                                    {/* Add columns for is_active, type, etc. if needed */}
                                    <TableCell align="right">إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subjects.length === 0 && (
                                    <TableRow><TableCell colSpan={4} align="center">لا توجد مواد دراسية لعرضها.</TableCell></TableRow>
                                )}
                                {subjects.map((subject) => (
                                    <TableRow key={subject.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">{subject.name}</TableCell>
                                        <TableCell>{subject.code}</TableCell>
                                        <TableCell sx={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {subject.description || '-'}
                                        </TableCell>
                                        {/* Add cells for is_active, type, etc. if needed */}
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="تعديل">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenForm(subject)}>
                                                        <EditIcon fontSize="inherit"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="حذف">
                                                    <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(subject)}>
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
            <SubjectFormDialog
                open={formOpen}
                onClose={handleCloseForm}
                initialData={editingSubject}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent><DialogContentText>هل أنت متأكد من حذف المادة "{subjectToDelete?.name}"؟ تأكد من عدم ارتباطها بمعلمين أو مقررات.</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                    <Button onClick={handleDeleteConfirm} color="error">حذف</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SubjectList;