// src/components/finances/StudentFeePaymentList.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, CircularProgress, Alert, IconButton, Tooltip,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useStudentFeePaymentStore } from '@/stores/studentFeePaymentStore'; // Adjust path
import StudentFeePaymentFormDialog from './StudentFeePaymentFormDialog'; // Import Payment Form Dialog
import { StudentFeePayment } from '@/types/studentFeePayment'; // Adjust path
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { formatNumber } from '@/constants';

interface StudentFeePaymentListProps {
    feeInstallmentId: number; // ID of the parent installment
    onDataChange: () => void; // Callback to notify parent when data changes
}

const StudentFeePaymentList: React.FC<StudentFeePaymentListProps> = ({
    feeInstallmentId, onDataChange
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const { payments, loading, error, totalPaidForInstallment, fetchPayments, deletePayment } = useStudentFeePaymentStore();

    // State for this component's dialogs
    const [formOpen, setFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<StudentFeePayment | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<StudentFeePayment | null>(null);

    // Fetch payments when the installment ID changes
    useEffect(() => {
        if (feeInstallmentId) {
            fetchPayments(feeInstallmentId);
        }
        // Note: No cleanup needed here unless the store requires it explicitly
    }, [feeInstallmentId, fetchPayments]);

    // Form Dialog Handlers
    const handleOpenForm = (payment?: StudentFeePayment) => {
        setEditingPayment(payment || null);
        setFormOpen(true);
    };
    const handleCloseForm = (refetchNeeded = false) => {
        setFormOpen(false);
        setEditingPayment(null);
        // If the form signals success (refetchNeeded=true), call the parent's callback
        if (refetchNeeded) {
             onDataChange(); // Notify parent (StudentPaymentListDialog)
        }
    };

    // Delete Dialog Handlers
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
            if (success) {
                enqueueSnackbar('تم حذف الدفعة بنجاح', { variant: 'success' });
                onDataChange(); // Notify parent (StudentPaymentListDialog)
            } else {
                enqueueSnackbar(useStudentFeePaymentStore.getState().error || 'فشل حذف الدفعة', { variant: 'error' });
            }
            handleCloseDeleteDialog();
        }
    };

    // Render Logic
    return (
        <Box sx={{ mt: 1 }}> {/* Add some margin if needed */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>الدفعات المسجلة لهذا القسط</Typography>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                >
                    إضافة دفعة
                </Button>
            </Box>

            {/* Loading/Error */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={30}/></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Table */}
            {!loading && !error && (
                <>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small" aria-label="payments table">
                            <TableHead>
                                <TableRow sx={{bgcolor: 'grey.50'}}>
                                    <TableCell>تاريخ الدفعة</TableCell>
                                    <TableCell align="right">المبلغ</TableCell>
                                    <TableCell>ملاحظات</TableCell>
                                    <TableCell align="right">إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payments.length === 0 && (
                                    <TableRow><TableCell colSpan={4} align="center">لا توجد دفعات مسجلة.</TableCell></TableRow>
                                )}
                                {payments.map((payment) => (
                                    <TableRow key={payment.id} hover>
                                        <TableCell>{dayjs(payment.payment_date).format('YYYY/MM/DD')}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'medium' }}>{formatNumber(payment.amount)}</TableCell>
                                        <TableCell>{payment.notes || '-'}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0} justifyContent="flex-end">
                                                <Tooltip title="تعديل الدفعة">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenForm(payment)}>
                                                        <EditIcon fontSize="inherit"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="حذف الدفعة">
                                                    <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(payment)}>
                                                        <DeleteIcon fontSize="inherit"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {/* Total Row */}
                                {payments.length > 0 && (
                                      <TableRow sx={{ '& td': { borderTop: '1px solid rgba(224, 224, 224, 1)', fontWeight:'bold' } }}>
                                          <TableCell>إجمالي الدفعات لهذا القسط</TableCell>
                                          <TableCell align="right">{formatNumber(totalPaidForInstallment)}</TableCell>
                                          <TableCell colSpan={2}></TableCell>
                                      </TableRow>
                                 )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Payment Form Dialog - Renders only when needed */}
                    <StudentFeePaymentFormDialog
                        open={formOpen}
                        onClose={handleCloseForm} // Pass handler
                        feeInstallmentId={feeInstallmentId}
                        initialData={editingPayment}
                    />

                    {/* Delete Payment Dialog */}
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
        </Box>
    );
};

export default StudentFeePaymentList;