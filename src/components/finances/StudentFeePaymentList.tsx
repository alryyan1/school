// src/components/finances/StudentFeePaymentList.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, CircularProgress, Alert, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useStudentFeePaymentStore } from '@/stores/studentFeePaymentStore';
import StudentFeePaymentFormDialog from './StudentFeePaymentFormDialog'; // Import Form Dialog
import { StudentFeePayment } from '@/types/studentFeePayment';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { formatNumber } from '@/constants';
import { EnrollableStudent, StudentAcademicYear } from '@/types/studentAcademicYear';

interface StudentFeePaymentListProps {
    enrollment:StudentAcademicYear;
    studentAcademicYearId: number | null; // The ID of the student's enrollment record
    title?: string; // Optional title for the section
}



const StudentFeePaymentList: React.FC<StudentFeePaymentListProps> = ({ studentAcademicYearId,enrollment, title = "سجل الدفعات" }) => {
    const { enqueueSnackbar } = useSnackbar();
    const { payments, loading, error, totalPaid, fetchPayments, deletePayment } = useStudentFeePaymentStore();
    const [formOpen, setFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<StudentFeePayment | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<StudentFeePayment | null>(null);

    useEffect(() => {
        if (studentAcademicYearId) {
            fetchPayments(studentAcademicYearId);
        }
        // Optionally clear payments when ID becomes null/undefined
        // return () => { if (!studentAcademicYearId) clearPayments(); }
    }, [studentAcademicYearId, fetchPayments]);

    const handleOpenForm = (payment?: StudentFeePayment) => {
        setEditingPayment(payment || null);
        setFormOpen(true);
    };
    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingPayment(null);
    };

    const handleOpenDeleteDialog = (payment: StudentFeePayment) => {
        setPaymentToDelete(payment);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setPaymentToDelete(null);
        setDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        if (paymentToDelete) {
            const success = await deletePayment(paymentToDelete.id);
            if (success) enqueueSnackbar('تم حذف الدفعة بنجاح', { variant: 'success' });
            else enqueueSnackbar(useStudentFeePaymentStore.getState().error || 'فشل حذف الدفعة', { variant: 'error' });
            handleCloseDeleteDialog();
        }
    };
    let totalPayments = 0;
    return (
        <Paper style={{direction:'rtl'}} elevation={3} sx={{ p: 2, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{title}</Typography>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                    disabled={!studentAcademicYearId} // Disable if no enrollment selected
                >
                    إضافة دفعة
                </Button>
            </Box>

            {/* Loading/Error */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={30}/></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!loading && !studentAcademicYearId && <Alert severity="info">الرجاء تحديد تسجيل الطالب أولاً لعرض الدفعات.</Alert>}

            {/* Table */}
            {!loading && !error && studentAcademicYearId && (
                <>
                    <TableContainer>
                        <Table size="small" aria-label="payments table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>تاريخ الدفعة</TableCell>
                                    <TableCell align="center">المبلغ</TableCell>
                                    <TableCell align="center">المتبقي</TableCell>
                                    <TableCell>ملاحظات</TableCell>
                                    <TableCell align="center">إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payments.length === 0 && (
                                    <TableRow><TableCell colSpan={4} align="center">لا توجد دفعات مسجلة.</TableCell></TableRow>
                                )}
                                {payments.map((payment) =>{

                             
                                    totalPayments+= Number(payment.amount ) ;
                                    return ( 
                                        <TableRow key={payment.id} hover>
                                            <TableCell>{dayjs(payment.payment_date).format('YYYY/MM/DD')}</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'medium' ,fontSize:'1.5rem'}}>{formatNumber(payment.amount)}</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'medium',fontSize:'1.5rem' }}>{formatNumber(Number(enrollment.fees) - Number(totalPayments) )}</TableCell>
                                            <TableCell>{payment.notes || '-'}</TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={0} justifyContent="flex-end">
                                                    <Tooltip title="تعديل">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenForm(payment)}>
                                                            <EditIcon fontSize="inherit"/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="حذف">
                                                        <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(payment)}>
                                                            <DeleteIcon fontSize="inherit"/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {/* Total Row */}
                                 {payments.length > 0 && (
                                      <TableRow sx={{ '& td': { borderTop: '2px solid black', fontWeight:'bold' } }}>
                                          <TableCell>الإجمالي المدفوع</TableCell>
                                          <TableCell align="center">{formatNumber(totalPaid)}</TableCell>
                                          <TableCell colSpan={2}></TableCell>
                                      </TableRow>
                                 )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Form Dialog - Renders only when needed */}
                     {studentAcademicYearId && (
                          <StudentFeePaymentFormDialog
                              open={formOpen}
                              onClose={handleCloseForm}
                              studentAcademicYearId={studentAcademicYearId}
                              initialData={editingPayment}
                          />
                     )}

                    {/* Delete Dialog */}
                    <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                        <DialogContent><DialogContentText>هل أنت متأكد من حذف هذه الدفعة؟</DialogContentText></DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                            <Button onClick={handleDeleteConfirm} color="error">حذف</Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Paper>
    );
};

export default StudentFeePaymentList;