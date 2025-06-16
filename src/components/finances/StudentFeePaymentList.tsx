// src/components/finances/StudentFeePaymentList.tsx
import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"; // shadcn Table
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"; // For actions
import {
    Dialog as ShadcnDialog, DialogClose, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle as ShadcnDialogTitle
} from "@/components/ui/dialog"; // shadcn Dialog
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// lucide-react icons
import { PlusCircle, MoreHorizontal, Edit3, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { useStudentFeePaymentStore } from '@/stores/studentFeePaymentStore';
import StudentFeePaymentFormDialog from './StudentFeePaymentFormDialog';
import { StudentFeePayment } from '@/types/studentFeePayment';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

interface StudentFeePaymentListProps {
    feeInstallmentId: number | null; // ID of the parent installment
    onDataChange: () => void;     // Callback to notify parent (e.g., FeeInstallmentViewerDialog) when data changes
    // Optional: Pass installment details if needed for display or context
    // installmentTitle?: string;
    // installmentAmountDue?: number | string;
}

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const StudentFeePaymentList: React.FC<StudentFeePaymentListProps> = ({
    feeInstallmentId,
    onDataChange,
    // installmentTitle,
    // installmentAmountDue
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const {
        payments, loading, error, totalPaidForInstallment,
        fetchPayments, deletePayment, clearPayments
    } = useStudentFeePaymentStore();

    // --- Local State for Dialogs ---
    const [formOpen, setFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<StudentFeePayment | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<StudentFeePayment | null>(null);

    // --- Effects ---
    // Fetch payments when the installment ID changes
    useEffect(() => {
        if (feeInstallmentId) {
            fetchPayments(feeInstallmentId);
        } else {
            clearPayments(); // Clear if no installment selected
        }
        // Cleanup when component unmounts or feeInstallmentId changes
        return () => {
            if (!feeInstallmentId) clearPayments(); // Also clear on unmount if id was null
        }
    }, [feeInstallmentId, fetchPayments, clearPayments]);

    // --- Handlers ---
    const handleOpenForm = (payment?: StudentFeePayment) => {
        setEditingPayment(payment || null);
        setFormOpen(true);
    };

    const handleCloseForm = (refetchNeeded = false) => {
        setFormOpen(false);
        setEditingPayment(null);
        if (refetchNeeded) {
            onDataChange(); // Notify parent that data changed (which should refetch installments)
            if (feeInstallmentId) fetchPayments(feeInstallmentId); // Also refetch payments for this installment
        }
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
            if (success) {
                enqueueSnackbar('تم حذف الدفعة بنجاح', { variant: 'success' });
                onDataChange(); // Notify parent
            } else {
                enqueueSnackbar(useStudentFeePaymentStore.getState().error || 'فشل حذف الدفعة', { variant: 'error' });
            }
            handleCloseDeleteDialog();
        }
    };

    // --- Render Logic ---
    return (
        <div className="mt-1" dir="rtl"> {/* Removed Paper, DialogContent provides container */}
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-foreground">الدفعات المسجلة لهذا القسط</h3>
                <Button
                    onClick={() => handleOpenForm()}
                    disabled={!feeInstallmentId || loading}
                    size="sm"
                >
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة دفعة
                </Button>
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="mr-2 text-muted-foreground">جاري تحميل الدفعات...</span>
                </div>
            )}
            {!loading && error && (
                <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {!loading && !error && !feeInstallmentId && (
                <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>معرف القسط غير متوفر لعرض الدفعات.</AlertDescription>
                </Alert>
            )}

            {/* Table */}
            {!loading && !error && feeInstallmentId && (
                <>
                    <div className="border rounded-lg overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">تاريخ الدفعة</TableHead>
                                    <TableHead className="text-center">المبلغ</TableHead>
                                    <TableHead className="text-center">طريقة الدفع</TableHead>
                                    <TableHead className="text-center">ملاحظات</TableHead>
                                    <TableHead className="text-left w-[80px]">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">لا توجد دفعات مسجلة لهذا القسط.</TableCell></TableRow>
                                ) : (
                                    payments.map((payment) => (
                                        <motion.tr key={payment.id} variants={itemVariants} initial="hidden" animate="visible" className="hover:bg-muted/50">
                                            <TableCell className='text-center'>{dayjs(payment.payment_date).format('YYYY/MM/DD')}</TableCell>
                                            <TableCell className="text-center font-medium">{payment.amount || 0} ريال</TableCell>
                                            <TableCell className='text-center'>
                                                <Badge variant={payment.payment_method === 'cash' ? "default" : "secondary"}>
                                                    {payment.payment_method === 'cash' ? 'نقداً' : 'تحويل بنكي'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-center">{payment.notes || '-'}</TableCell>
                                            <TableCell className="text-center w-[80px]">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                         <DropdownMenuItem onSelect={() => handleOpenForm(payment)}><Edit3 className="ml-2 h-4 w-4"/> تعديل الدفعة</DropdownMenuItem>
                                                         <DropdownMenuSeparator />
                                                         <DropdownMenuItem onSelect={() => handleOpenDeleteDialog(payment)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="ml-2 h-4 w-4"/> حذف الدفعة</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                                {/* Total Row for this Installment's Payments */}
                                {payments.length > 0 && (
                                    <TableRow className="bg-muted/50 hover:bg-muted/60">
                                        <TableCell colSpan={1} className="font-semibold">إجمالي دفعات هذا القسط</TableCell>
                                        <TableCell className="text-right font-semibold">{totalPaidForInstallment || 0} ريال</TableCell>
                                        <TableCell colSpan={3}></TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Payment Form Dialog - Renders only when feeInstallmentId is valid */}
                    {feeInstallmentId && (
                         <StudentFeePaymentFormDialog
                             open={formOpen}
                             onClose={handleCloseForm}
                             feeInstallmentId={feeInstallmentId}
                             initialData={editingPayment}
                         />
                    )}

                    {/* Delete Payment Dialog */}
                    <ShadcnDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="sm:max-w-md" dir="rtl">
                            <DialogHeader>
                                <ShadcnDialogTitle>تأكيد حذف الدفعة</ShadcnDialogTitle>
                                <DialogDescription>هل أنت متأكد من حذف هذه الدفعة؟ لا يمكن التراجع عن هذا الإجراء.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2 sm:justify-start">
                                 <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                                 <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>تأكيد الحذف</Button>
                            </DialogFooter>
                        </DialogContent>
                    </ShadcnDialog>
                </>
            )}
        </div>
    );
};

export default StudentFeePaymentList;