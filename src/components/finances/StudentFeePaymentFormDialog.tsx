// src/components/finances/StudentFeePaymentFormDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';

import { StudentFeePayment, StudentFeePaymentFormData, paymentMethod } from '@/types/studentFeePayment';
import { FeeInstallment } from '@/types/feeInstallment';
import { useStudentFeePaymentStore } from '@/stores/studentFeePaymentStore';
import { useSnackbar } from 'notistack';

interface StudentFeePaymentFormDialogProps {
    open: boolean;
    onClose: (refetchList?: boolean) => void;
    feeInstallmentId: number;
    installmentDetails?: Pick<FeeInstallment, 'amount_due' | 'amount_paid'>;
    initialData?: StudentFeePayment | null;
}

const paymentMethodOptions: {
    value: paymentMethod;
    label: string;
}[] = [
    { value: 'cash', label: 'نقدي' },
    { value: 'bank', label: 'تحويل بنكي' },
];

// Exclude fee_installment_id from the form data type itself
type DialogFormData = Omit<StudentFeePaymentFormData, 'fee_installment_id'>;

const StudentFeePaymentFormDialog: React.FC<StudentFeePaymentFormDialogProps> = ({
    open, onClose, feeInstallmentId, installmentDetails, initialData
}) => {
    const isEditMode = !!initialData;
    const { createPayment, updatePayment } = useStudentFeePaymentStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formError, setFormError] = useState<string | null>(null);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DialogFormData>({
        defaultValues: {
            amount: '',
            payment_date: dayjs().format('YYYY-MM-DD'),
            payment_method: 'cash',
            notes: '',
        }
    });

    // Calculate remaining amount for validation
    const amountDue = parseFloat(installmentDetails?.amount_due as string || 'Infinity');
    const amountPaid = parseFloat(installmentDetails?.amount_paid as string || '0');
    const currentPaymentAmount = isEditMode ? parseFloat(initialData?.amount as string || '0') : 0;
    const maxAllowedPayment = isEditMode ? (amountDue - amountPaid + currentPaymentAmount) : (amountDue - amountPaid);

    // Reset form when opening or data changes
    useEffect(() => {
        if (open) {
            setFormError(null);
            reset({
                amount: '',
                payment_date: dayjs().format('YYYY-MM-DD'),
                payment_method: 'cash',
                notes: '',
                ...(initialData ? {
                    amount: String(initialData.amount ?? ''),
                    payment_date: dayjs(initialData.payment_date).format('YYYY-MM-DD'),
                    notes: initialData.notes || '',
                    payment_method: initialData.payment_method,
                } : {}),
            });
        }
    }, [initialData, open, reset]);

    const onSubmit = async (data: DialogFormData) => {
        setFormError(null);
        const paymentAmount = Number(data.amount);

        // Additional client-side check (backend also validates)
        if (paymentAmount > maxAllowedPayment) {
            setFormError(`المبلغ يتجاوز المتبقي للقسط (${maxAllowedPayment.toFixed(2)}).`);
            return;
        }

        // Add fee_installment_id to the payload for create/update
        const submitData = {
            ...data,
            amount: paymentAmount,
            fee_installment_id: feeInstallmentId,
            payment_method: data.payment_method,
        };

        try {
            if (isEditMode && initialData) {
                const updatePayload = {
                    amount: submitData.amount,
                    payment_date: submitData.payment_date,
                    notes: submitData.notes,
                    payment_method: submitData.payment_method,
                };
                await updatePayment(initialData.id, updatePayload);
                enqueueSnackbar('تم تحديث الدفعة بنجاح', { variant: 'success' });
            } else {
                await createPayment(submitData as StudentFeePaymentFormData);
                enqueueSnackbar('تم إضافة الدفعة بنجاح', { variant: 'success' });
            }
            onClose(true);
        } catch (error: unknown) {
            console.error("Payment Form submission error:", error);
            const errorObj = error as { response?: { data?: { errors?: Record<string, string[]> } }; message?: string };
            const backendErrors = errorObj.response?.data?.errors;
            if (backendErrors) {
                setFormError(`فشل الحفظ: ${Object.values(backendErrors).flat().join('. ')}`);
            } else {
                setFormError(errorObj.message || 'حدث خطأ غير متوقع.');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose(false)} modal>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'تعديل سجل دفعة' : 'إضافة دفعة جديدة'}</DialogTitle>
                    <DialogDescription>
                        للقسط رقم: {feeInstallmentId}
                        <br />
                        المبلغ المتبقي من القسط: <strong>{maxAllowedPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> ل.س
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {formError && (
                            <Alert variant="destructive" className="mb-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Amount Field */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">المبلغ المدفوع *</Label>
                            <Controller
                                name="amount"
                                control={control}
                                rules={{
                                    required: 'المبلغ المدفوع مطلوب',
                                    min: { value: 0.01, message: 'المبلغ يجب أن يكون أكبر من صفر' }
                                }}
                                render={({ field }) => (
                                    <Input
                                        id="amount"
                                        type="number"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder="أدخل المبلغ المدفوع"
                                        min="0"
                                        step="0.01"
                                        className={cn(errors.amount && "border-destructive")}
                                        autoFocus
                                    />
                                )}
                            />
                            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
                        </div>

                        {/* Payment Date Field */}
                        <div className="space-y-2">
                            <Label htmlFor="payment_date">تاريخ الدفعة *</Label>
                            <Controller
                                name="payment_date"
                                control={control}
                                rules={{ required: 'تاريخ الدفعة مطلوب' }}
                                render={({ field }) => (
                                    <Input
                                        id="payment_date"
                                        type="date"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className={cn(errors.payment_date && "border-destructive")}
                                    />
                                )}
                            />
                            {errors.payment_date && <p className="text-xs text-destructive mt-1">{errors.payment_date.message}</p>}
                        </div>

                        {/* Payment Method Field */}
                        <div className="space-y-2">
                            <Label htmlFor="payment_method">طريقة الدفع *</Label>
                            <Controller
                                name="payment_method"
                                control={control}
                                rules={{ required: 'طريقة الدفع مطلوبة' }}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange} required>
                                        <SelectTrigger id="payment_method" className={cn(errors.payment_method && "border-destructive")}>
                                            <SelectValue placeholder="اختر طريقة الدفع..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethodOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.payment_method && <p className="text-xs text-destructive mt-1">{errors.payment_method.message}</p>}
                        </div>

                        {/* Notes Field */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        id="notes"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder="أدخل أي ملاحظات إضافية..."
                                        rows={3}
                                        className={cn(errors.notes && "border-destructive")}
                                    />
                                )}
                            />
                            {errors.notes && <p className="text-xs text-destructive mt-1">{errors.notes.message}</p>}
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>إلغاء</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'حفظ التعديلات' : 'إضافة دفعة'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default StudentFeePaymentFormDialog;