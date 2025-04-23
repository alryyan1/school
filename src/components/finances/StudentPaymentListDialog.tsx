// src/components/finances/StudentPaymentListDialog.tsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton, // For close button
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Close icon
import StudentFeePaymentList from './StudentFeePaymentList'; // The actual list/management component
import { FeeInstallment } from '@/types/feeInstallment';     // Adjust path
import { formatNumber } from '@/constants';
import dayjs from 'dayjs';

interface StudentPaymentListDialogProps {
    open: boolean;
    /** Callback to close the dialog. Receives 'true' if installment data might have changed due to payment actions. */
    onClose: (refetchInstallments?: boolean) => void;
    /** The specific installment object for which to display/manage payments */
    installment: FeeInstallment | null;
}

const StudentPaymentListDialog: React.FC<StudentPaymentListDialogProps> = ({
    open,
    onClose,
    installment
}) => {

    // Don't render anything if the dialog isn't open or no installment data is provided
    if (!open || !installment) {
        return null;
    }

    // Handler for the main close button in actions
    const handleClose = () => {
        onClose(false); // Signal false: closing manually doesn't imply data change inside
    };

    // Handler for when the embedded component signals data change
    const handleDataChange = () => {
        onClose(true); // Signal true: close dialog AND tell parent to refetch installments
    };

    const amountDue = parseFloat(installment.amount_due as string || '0');
    const amountPaid = parseFloat(installment.amount_paid as string || '0');

    return (
        // Use medium or large width to comfortably fit the payments table
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth dir="rtl">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                    سجل الدفعات للقسط: {installment.title}
                    <Typography variant="body2" color="text.secondary" component="div">
                        المبلغ المستحق: <Typography component="span" sx={{ fontWeight: 'medium', color: 'text.primary' }}>{formatNumber(amountDue)}</Typography>
                         |
                        المدفوع: <Typography component="span" sx={{ fontWeight: 'medium', color: amountPaid >= amountDue ? 'success.main' : 'text.primary' }}>{formatNumber(amountPaid)}</Typography>
                        | 
                        تاريخ الاستحقاق: <Typography component="span" sx={{ fontWeight: 'medium', color: 'text.primary' }}>{dayjs(installment.due_date).format('YYYY-MM-DD')}</Typography>
                    </Typography>
                </Box>
                 <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider /> {/* Separator */}
            <DialogContent sx={{ pt: 1, pb: 1 }}> {/* Adjust padding */}
                {/*
                 * Render the Payment List component inside.
                 * Pass the ID of the current installment.
                 * Pass the callback function that signals when a payment
                 * has been added/edited/deleted.
                 */}
                <StudentFeePaymentList
                    feeInstallmentId={installment.id}
                    onDataChange={handleDataChange} // Pass the callback here
                />
            </DialogContent>
             <DialogActions sx={{ borderTop: 1, borderColor:'divider', px: 3, py: 1.5}}>
                <Button onClick={handleClose} color="primary" variant="outlined">إغلاق</Button>
            </DialogActions>
        </Dialog>
    );
};

export default StudentPaymentListDialog;