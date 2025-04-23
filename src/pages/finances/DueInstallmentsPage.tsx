// src/pages/finances/DueInstallmentsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton,
    Tooltip, Paper, TableContainer, Table, TableHead, TableRow, TableCell,
    TableBody, Stack, Checkbox, FormControlLabel // Added Checkbox, FormControlLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send'; // Send icon
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useDueInstallmentsStore } from '@/stores/dueInstallmentsStore'; // Adjust path
import { NotificationApi } from '@/api/notificationApi'; // Adjust path
import { FeeInstallment } from '@/types/feeInstallment'; // Adjust path
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { formatNumber } from '@/constants';

const DueInstallmentsPage: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();

    // --- Store Data ---
    const { dueInstallments, loading, error, fetchDueSoon } = useDueInstallmentsStore();

    // --- Local State ---
    const [selectedInstallmentIds, setSelectedInstallmentIds] = useState<number[]>([]);
    const [isSendingAll, setIsSendingAll] = useState(false);
    const [sendingIndividualId, setSendingIndividualId] = useState<number | null>(null);

    // --- Effects ---
    // Fetch data on mount
    useEffect(() => {
        fetchDueSoon(); // Fetch installments due in next 7 days (default)
    }, [fetchDueSoon]);

    // --- Handlers ---

    // Checkbox handling
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedInstallmentIds(dueInstallments.map((inst) => inst.id));
        } else {
            setSelectedInstallmentIds([]);
        }
    };

    const handleSelectOne = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const selectedIndex = selectedInstallmentIds.indexOf(id);
        let newSelected: number[] = [];

        if (selectedIndex === -1) { // Not currently selected, add it
            newSelected = newSelected.concat(selectedInstallmentIds, id);
        } else { // Already selected, remove it
            newSelected = selectedInstallmentIds.filter(selectedId => selectedId !== id);
        }
        setSelectedInstallmentIds(newSelected);
    };

    // Send Logic
    const sendReminders = async (installmentIds: number[]) => {
        if (installmentIds.length === 0) {
            enqueueSnackbar('الرجاء تحديد قسط واحد على الأقل لإرسال التذكير.', { variant: 'warning' });
            return;
        }

        // Determine if sending all or individual
        const isBulk = installmentIds.length > 1 || (installmentIds.length === 1 && installmentIds[0] !== sendingIndividualId);
        if(isBulk) setIsSendingAll(true); // Set bulk sending state

        let successCount = 0;
        let errorCount = 0;
        let firstErrorMessage = '';

        // Send requests sequentially or in parallel (sequential is simpler here)
        for (const id of installmentIds) {
             // If sending individual, ensure the correct button shows loading
             if (!isBulk) setSendingIndividualId(id);
             try {
                 await NotificationApi.sendInstallmentReminder(id);
                 successCount++;
             } catch (err: any) {
                  console.error(`Error sending reminder for installment ${id}:`, err);
                  errorCount++;
                  if (!firstErrorMessage) {
                      firstErrorMessage = err.response?.data?.message || err.message || 'فشل إرسال بعض التذكيرات';
                  }
             } finally {
                  if (!isBulk) setSendingIndividualId(null); // Clear individual loading state
             }
             // Optional delay between messages if needed by WAAPI provider
             // await new Promise(res => setTimeout(res, 200));
        }

         if(isBulk) setIsSendingAll(false); // Clear bulk sending state

        // Show summary notification
        if (successCount > 0 && errorCount === 0) {
            enqueueSnackbar(`تم إرسال ${successCount} تذكير بنجاح.`, { variant: 'success' });
        } else if (successCount > 0 && errorCount > 0) {
            enqueueSnackbar(`تم إرسال ${successCount} تذكير بنجاح، وفشل إرسال ${errorCount}. الخطأ الأول: ${firstErrorMessage}`, { variant: 'warning', persist: true });
        } else if (errorCount > 0) {
             enqueueSnackbar(`فشل إرسال جميع التذكيرات (${errorCount}). الخطأ الأول: ${firstErrorMessage}`, { variant: 'error', persist: true });
        }
        setSelectedInstallmentIds([]); // Clear selection after sending
    };


    // --- Derived State ---
    const isSelected = (id: number) => selectedInstallmentIds.indexOf(id) !== -1;
    const numSelected = selectedInstallmentIds.length;
    const rowCount = dueInstallments.length;

    // --- Render ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} dir="rtl">
            {/* Header */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                 <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" component="h1">
                        الأقساط المستحقة قريباً (30 يوم)
                    </Typography>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={isSendingAll ? <CircularProgress size={20} color="inherit"/> : <SendIcon />}
                        onClick={() => sendReminders(selectedInstallmentIds)}
                        disabled={numSelected === 0 || isSendingAll || loading}
                    >
                        إرسال تذكير WhatsApp للمحددين ({numSelected})
                    </Button>
                 </Stack>
             </Paper>

            {/* Loading/Error */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Table */}
            {!loading && !error && (
                <Paper elevation={2}>
                    <TableContainer>
                        <Table sx={{ minWidth: 750 }} aria-label="due installments table" size="small">
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Tooltip title={numSelected === rowCount && rowCount > 0 ? "إلغاء تحديد الكل" : "تحديد الكل"}>
                                            <Checkbox
                                                color="primary"
                                                indeterminate={numSelected > 0 && numSelected < rowCount}
                                                checked={rowCount > 0 && numSelected === rowCount}
                                                onChange={handleSelectAll}
                                                inputProps={{ 'aria-label': 'تحديد جميع الأقساط' }}
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>الطالب</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>المدرسة/العام</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>القسط</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">تاريخ الاستحقاق</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">المبلغ المتبقي</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">إرسال فردي</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dueInstallments.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>لا توجد أقساط مستحقة خلال الأيام السبعة القادمة.</TableCell></TableRow>
                                ) : (
                                    dueInstallments.map((inst) => {
                                        const isItemSelected = isSelected(inst.id);
                                        const labelId = `due-checkbox-${inst.id}`;
                                        const remaining = parseFloat(inst.amount_due as string) - parseFloat(inst.amount_paid as string);
                                        const isLoadingIndividual = sendingIndividualId === inst.id;

                                        return (
                                            <TableRow
                                                key={inst.id} hover role="checkbox"
                                                aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        color="primary"
                                                        checked={isItemSelected}
                                                        onChange={(event) => handleSelectOne(event, inst.id)}
                                                        inputProps={{ 'aria-labelledby': labelId }}
                                                    />
                                                </TableCell>
                                                <TableCell component="th" id={labelId} scope="row">
                                                    {inst.student_enrollment?.student?.student_name ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {inst.student_enrollment?.school?.name ?? '-'} / {inst.student_enrollment?.academic_year?.name ?? '-'}
                                                </TableCell>
                                                <TableCell>{inst.title}</TableCell>
                                                <TableCell align="center">{dayjs(inst.due_date).format('YYYY/MM/DD')}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'medium', color: 'warning.dark' }}>
                                                    {formatNumber(remaining)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="إرسال تذكير لهذا القسط فقط">
                                                         <span> {/* Span needed for disabled button tooltip */}
                                                            <IconButton
                                                                 size="small" color="success"
                                                                 onClick={() => sendReminders([inst.id])}
                                                                 disabled={isLoadingIndividual || isSendingAll} // Disable if bulk or this one sending
                                                            >
                                                                {isLoadingIndividual ? <CircularProgress size={18} color="inherit"/> : <WhatsAppIcon fontSize="inherit"/>}
                                                            </IconButton>
                                                         </span>
                                                     </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Container>
    );
};

export default DueInstallmentsPage;