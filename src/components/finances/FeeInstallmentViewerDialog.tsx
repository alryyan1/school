// src/components/finances/FeeInstallmentViewerDialog.tsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Tooltip,
    IconButton, // Import IconButton if using it for the PDF button
    Alert
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // PDF icon
import CloseIcon from '@mui/icons-material/Close'; // Icon for close button
import FeeInstallmentList from './FeeInstallmentList'; // Import the list component itself
import { webUrl } from '@/constants';
// Note: Removed unused imports like StudentAcademicYear, FeeInstallment types if not directly used here

interface FeeInstallmentViewerDialogProps {
    open: boolean;
    // Callback to signal if the underlying data *might* have changed (installments list needs refetch)
    onClose: (refetchInstallments?: boolean) => void;
    studentAcademicYearId: number | null; // ID of the enrollment record
    // Contextual information for the title
    studentName?: string;
    academicYearName?: string;
    gradeLevelName?: string;
}

const FeeInstallmentViewerDialog: React.FC<FeeInstallmentViewerDialogProps> = ({
    open,
    onClose,
    studentAcademicYearId,
    studentName,
    academicYearName,
    gradeLevelName
}) => {

    console.log(studentAcademicYearId ,'studentAcademicYearId?.id in viewerdialog ')

    // Handler for the Print PDF button
    const handlePrintStatement = () => {
        if (studentAcademicYearId) {
            // Construct the URL to the Laravel PDF generation route
            // Ensure the base URL is handled correctly (e.g., by environment variables or config)
            const pdfUrl = `${webUrl}enrollments/${studentAcademicYearId}/fee-statement-pdf`; // Relative URL assumes same origin or proxy setup
            // For different origins, use the full URL: const pdfUrl = `http://your-laravel-domain.com/enrollments/...`;

            // Open the PDF route in a new browser tab
            window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        } else {
            console.error("Cannot generate PDF: Missing student enrollment ID.");
            // Optionally show a snackbar error
        }
    };

    // Don't render the dialog content if the necessary ID isn't available
    if (!studentAcademicYearId) {
         // Or return null if the dialog shouldn't even appear without an ID
         // return null;
         // Alternatively, show disabled state if opened without ID (less likely)
    }

    return (
        // Use a wider dialog (e.g., lg) to accommodate the installment table comfortably
        <Dialog
            open={open}
            onClose={() => onClose(false)} // Signal false: closing manually doesn't imply data change
            maxWidth="lg"
            fullWidth
            dir="rtl" // Ensure Right-to-Left direction
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor:'divider', pb: 1.5 }}>
                {/* Title Section */}
                <Box>
                    كشف حساب الأقساط للطالب: {studentName ?? '...'}
                    <Typography variant="body2" color="text.secondary" component="div"> {/* Use component="div" */}
                        للعام الدراسي: {academicYearName ?? '...'} / الصف: {gradeLevelName ?? '...'}
                    </Typography>
                </Box>

                {/* Action Buttons in Title */}
                <Box>
                    <Tooltip title="طباعة كشف الحساب">
                        {/* Disable button if no enrollment ID */}
                        <Button
                            variant="outlined"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={handlePrintStatement}
                            size="small"
                            disabled={!studentAcademicYearId}
                            sx={{ ml: 1 }} // Add margin if needed
                        >
                            طباعة
                        </Button>
                    </Tooltip>
                     <IconButton onClick={() => onClose(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}> {/* Add padding top to content */}
                {/* Render the Installment List component inside */}
                {/* Pass the necessary enrollment ID and the onClose callback */}
                {studentAcademicYearId ? (
                    <FeeInstallmentList
                        studentAcademicYearId={studentAcademicYearId}
                        totalFeesAssigned={0} // Pass actual total fees if available/calculated
                        // The FeeInstallmentList now handles displaying/adding installments and payments
                        // It will open its OWN dialogs for adding/editing installments or payments
                    />
                ) : (
                    <Alert severity="warning">معرف تسجيل الطالب غير متوفر.</Alert>
                )}
            </DialogContent>

            <DialogActions sx={{borderTop: 1, borderColor:'divider', px: 3, py: 1.5}}>
                 {/* Simple close button, data saving happens within FeeInstallmentList's dialogs */}
                <Button onClick={() => onClose(false)} color="primary" variant="outlined">إغلاق</Button>
            </DialogActions>
        </Dialog>
    );
};

export default FeeInstallmentViewerDialog; // Export the renamed component