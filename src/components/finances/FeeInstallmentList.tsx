// src/components/finances/FeeInstallmentList.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  AutoAwesome as GenerateIcon,
  WhatsApp as WhatsAppIcon 
} from "@mui/icons-material";
import { useFeeInstallmentStore } from "@/stores/feeInstallmentStore";
import FeeInstallmentFormDialog from "./FeeInstallmentFormDialog"; // Create this
import { FeeInstallment, InstallmentStatus } from "@/types/feeInstallment";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { formatNumber } from "@/constants";
import GenerateInstallmentsDialog from "./GenerateInstallmentsDialog";
import StudentPaymentListDialog from "./StudentPaymentListDialog";
import { NotificationApi } from "@/api/notificationApi";

interface FeeInstallmentListProps {
  studentAcademicYearId: number | null; // ID of the enrollment record
  totalFeesAssigned: number; // Example: Pass the total fee expected
}

const getStatusChipColor = (
  status: InstallmentStatus
): "success" | "warning" | "error" | "default" => {
  /* ... */
};

const FeeInstallmentList: React.FC<FeeInstallmentListProps> = ({
  studentAcademicYearId,
  totalFeesAssigned,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    installments,
    loading,
    error,
    totalDue,
    totalPaidOverall,
    fetchInstallments,
    deleteInstallment,
  } = useFeeInstallmentStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] =
    useState<FeeInstallment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [installmentToDelete, setInstallmentToDelete] =
    useState<FeeInstallment | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInstallmentForPayments, setSelectedInstallmentForPayments] =
    useState<FeeInstallment | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false); // <-- State for new dialog
  const [sendingWhatsAppId, setSendingWhatsAppId] = useState<number | null>(
    null
  ); // State to track sending
  const handleOpenGenerateDialog = () => setGenerateDialogOpen(true);
  const handleCloseGenerateDialog = (refetch = false) => {
    setGenerateDialogOpen(false);
    if (refetch && studentAcademicYearId) {
      fetchInstallments(studentAcademicYearId); // Refetch after generation
    }
  };
  useEffect(() => {
    if (studentAcademicYearId) {
      fetchInstallments(studentAcademicYearId);
    }
  }, [studentAcademicYearId, fetchInstallments]);

  const handleOpenForm = (installment?: FeeInstallment) => {
    setEditingInstallment(installment || null);
    setFormOpen(true);
  };
  const handleCloseForm = (refetch = false) => {
    setFormOpen(false);
    setEditingInstallment(null);
    if (refetch && studentAcademicYearId)
      fetchInstallments(studentAcademicYearId);
  };
  // ... delete dialog handlers ...
  const handleOpenPaymentDialog = (installment: FeeInstallment) => {
    setSelectedInstallmentForPayments(installment);
    setPaymentDialogOpen(true);
  };
  const handleClosePaymentDialog = (refetchInstallments = false) => {
    setPaymentDialogOpen(false);
    setSelectedInstallmentForPayments(null);
    // Refetch installments if a payment was made/deleted to update amount_paid/status
    if (refetchInstallments && studentAcademicYearId)
      fetchInstallments(studentAcademicYearId);
  };
  // --- NEW: Handler for sending WhatsApp Reminder ---
  const handleSendReminder = async (installment: FeeInstallment) => {
    if (!installment || sendingWhatsAppId === installment.id) return;

    setSendingWhatsAppId(installment.id); // Set loading state for this specific row
    try {
      const response = await NotificationApi.sendInstallmentReminder(
        installment.id
      );
      enqueueSnackbar(response.data.message || "تم إرسال التذكير بنجاح", {
        variant: "success",
      });
    } catch (error: any) {
      console.error("Send WhatsApp Reminder error:", error);
      const msg = error.response?.data?.message || "فشل إرسال رسالة WhatsApp.";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSendingWhatsAppId(null); // Clear loading state
    }
  };
  return (
    <Paper style={{ direction: "rtl" }} elevation={3} sx={{ p: 2, mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">جدول الأقساط</Typography>
        <Stack direction="row" spacing={1}>
          {/* Show generate button only if NO installments exist */}
          {installments.length === 0 && !loading && studentAcademicYearId && (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<GenerateIcon />}
              onClick={handleOpenGenerateDialog}
              disabled={loading}
            >
              إنشاء جدول تلقائي
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            disabled={!studentAcademicYearId || loading}
          >
            إضافة قسط يدوي
          </Button>
        </Stack>
      </Box>

      {loading && <CircularProgress size={24} />}
      {!loading && error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && studentAcademicYearId && (
        <>
          <TableContainer>
            <Table size="small">
              {/* ... Table Head ... */}
              <TableHead>
                <TableRow>
                  <TableCell>العنوان</TableCell>
                  <TableCell align="center">تاريخ الاستحقاق</TableCell>
                  <TableCell align="right">المبلغ المستحق</TableCell>
                  <TableCell align="right">المبلغ المدفوع</TableCell>
                  <TableCell align="right">المتبقي</TableCell>
                  <TableCell align="center">الحالة</TableCell>
                  <TableCell align="center">الدفعات</TableCell>
                  <TableCell align="right">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {installments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      لم يتم تحديد أقساط لهذا التسجيل.
                    </TableCell>
                  </TableRow>
                )}
                {installments.map((inst) => {
                  const remaining =
                    parseFloat(inst.amount_due as string) -
                    parseFloat(inst.amount_paid as string);
                    const isLoadingWhatsApp = sendingWhatsAppId === inst.id; // Check if this row is loading
                  return (
                    <TableRow key={inst.id} hover>
                      <TableCell>{inst.title}</TableCell>
                      <TableCell align="center">
                        {dayjs(inst.due_date).format("YYYY/MM/DD")}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(inst.amount_due)}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(inst.amount_paid)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            remaining <= 0 ? "success.main" : "text.primary",
                        }}
                      >
                        {formatNumber(remaining)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={inst.status}
                          size="small"
                          color={getStatusChipColor(inst.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="عرض/إضافة الدفعات لهذا القسط">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenPaymentDialog(inst)}
                          >
                            <PaymentIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0}
                          justifyContent="flex-end"
                        >
                          {/* WhatsApp Button */}
                          <Tooltip title="إرسال تذكير WhatsApp لولي الأمر">
                            <span>
                              {" "}
                              {/* Span needed for disabled button tooltip */}
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleSendReminder(inst)}
                                disabled={isLoadingWhatsApp} // Disable while sending
                              >
                                {isLoadingWhatsApp ? (
                                  <CircularProgress size={18} color="inherit" />
                                ) : (
                                  <WhatsAppIcon fontSize="inherit" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="تعديل القسط">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenForm(inst)}
                            >
                              <EditIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف القسط">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                /* handleOpenDeleteDialog(inst) */
                              }}
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Total Row */}
                {installments.length > 0 && (
                  <TableRow
                    sx={{
                      "& td": {
                        borderTop: "2px solid black",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    <TableCell colSpan={2}>الإجمالي</TableCell>
                    <TableCell align="right">
                      {formatNumber(totalDue)}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(totalPaidOverall)}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(totalDue - totalPaidOverall)}
                    </TableCell>
                    <TableCell colSpan={3}></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Render Generate Dialog */}
          {studentAcademicYearId && (
            <GenerateInstallmentsDialog
              open={generateDialogOpen}
              onClose={handleCloseGenerateDialog}
              studentAcademicYearId={studentAcademicYearId}
              defaultTotalAmount={
                totalFeesAssigned > 0 ? totalFeesAssigned : undefined
              } // Pass total fee if available
            />
          )}
          {/* Dialogs */}
          {studentAcademicYearId && (
            <FeeInstallmentFormDialog
              open={formOpen}
              onClose={(r) => handleCloseForm(r)}
              studentAcademicYearId={studentAcademicYearId}
              initialData={editingInstallment}
            />
          )}
          {/* ... Delete Dialog ... */}

          {/* Payments Dialog */}
          {selectedInstallmentForPayments && (
            <StudentPaymentListDialog
              open={paymentDialogOpen}
              onClose={(r) => handleClosePaymentDialog(r)} // Pass flag to refetch installments
              installment={selectedInstallmentForPayments}
            />
          )}
        </>
      )}
    </Paper>
  );
};
export default FeeInstallmentList;
