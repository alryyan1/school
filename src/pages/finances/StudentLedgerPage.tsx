// src/pages/finances/StudentLedgerPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLedgerStore } from "@/stores/ledgerStore";
import { useDeportationLedgerStore } from "@/stores/deportationLedgerStore";
import { CreateLedgerEntryRequest } from "@/types/ledger";
import { Plus, Calculator, CreditCard, FileText, DollarSign, ArrowRight, User, Hash, Printer, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { webUrl } from "@/constants";
import { deleteLedgerEntry } from "@/api/ledgerDeletions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Helper function to format numbers with thousands separator
const numberWithCommas = (x: number): string => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const StudentLedgerPage: React.FC = () => {
  const { enrollmentId, studentName } = useParams<{ enrollmentId: string; studentName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect if this is a deportation ledger route
  const isDeportationLedger = location.pathname.includes('student-deportation-ledger');
  
  // Use the appropriate store based on route
  const regularLedgerStore = useLedgerStore();
  const deportationLedgerStore = useDeportationLedgerStore();
  
  const { 
    currentLedger, 
    loading, 
    error, 
    fetchEnrollmentLedger, 
    createLedgerEntry 
  } = isDeportationLedger ? deportationLedgerStore : regularLedgerStore;

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CreateLedgerEntryRequest>({
    enrollment_id: Number(enrollmentId),
    transaction_type: 'fee',
    description: '',
    amount: 0,
    transaction_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    payment_method: 'cash',
  });

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentLedger(Number(enrollmentId));
    }
  }, [enrollmentId, fetchEnrollmentLedger]);

  // Decode the student name from URL
  const decodedStudentName = studentName ? decodeURIComponent(studentName) : 'اسم الطالب';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        payment_method: formData.transaction_type === 'payment' ? formData.payment_method : null,
      } as any;

      await createLedgerEntry(payload);
      setShowAddForm(false);
      setFormData({
        enrollment_id: Number(enrollmentId),
        transaction_type: 'fee',
        description: '',
        amount: 0,
        transaction_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        payment_method: 'cash',
      });
    } catch (error) {
      console.error('Failed to create ledger entry:', error);
    }
  };

  const handleGeneratePdf = () => {
    if (enrollmentId) {
      // Simply open the PDF URL in a new tab (web route, no auth required)
      const pdfUrl = isDeportationLedger 
        ? `${webUrl}student-deportation-ledgers/enrollment/${enrollmentId}/pdf`
        : `${webUrl}student-ledgers/enrollment/${enrollmentId}/pdf`;
      window.open(pdfUrl, '_blank');
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'fee': return <DollarSign className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'discount': return <Calculator className="w-4 h-4" />;
      case 'refund': return <FileText className="w-4 h-4" />;
      case 'adjustment': return <Calculator className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      fee: 'bg-red-100 text-red-800 border-red-200',
      payment: 'bg-green-100 text-green-800 border-green-200',
      discount: 'bg-blue-100 text-blue-800 border-blue-200',
      adjustment: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
      <Badge variant="outline" className={variants[type] || ''}>
        {getTransactionTypeIcon(type)}
        <span className="mr-1">
          {type === 'fee' && 'رسوم'}
          {type === 'payment' && 'دفع'}
          {type === 'discount' && 'خصم'}
          {type === 'refund' && 'استرداد'}
          {type === 'adjustment' && 'تعديل'}
        </span>
      </Badge>
    );
  };

  const handlePrintReceipt = (entry: { 
    transaction_date: string; 
    amount: number; 
    description: string; 
    reference_number?: string; 
    balance_after: number; 
    created_by?: { name: string } 
  }) => {

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>إيصال دفع</title>
            <style>
              body { 
                font-family: 'Arial', sans-serif; 
                margin: 20px; 
                direction: rtl; 
                text-align: right;
              }
              .receipt { 
                border: 2px solid #000; 
                padding: 20px; 
                max-width: 400px; 
                margin: 0 auto;
              }
              .header { 
                text-align: center; 
                font-size: 18px; 
                font-weight: bold; 
                margin-bottom: 20px;
              }
              .divider { 
                border-top: 1px solid #000; 
                margin: 10px 0;
              }
              .field { 
                margin: 8px 0; 
                display: flex; 
                justify-content: space-between;
              }
              .label { 
                font-weight: bold; 
                margin-left: 10px;
              }
              .value { 
                text-align: left;
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">إيصال دفع</div>
              <div class="divider"></div>
              
              <div class="field">
                <span class="label">اسم الطالب:</span>
                <span class="value">${decodedStudentName}</span>
              </div>
              
              <div class="field">
                <span class="label">رقم التسجيل:</span>
                <span class="value">${enrollmentId}</span>
              </div>
              
              <div class="field">
                <span class="label">تاريخ الدفع:</span>
                <span class="value">${format(new Date(entry.transaction_date), 'dd/MM/yyyy', { locale: ar })}</span>
              </div>
              
              <div class="field">
                <span class="label">المبلغ:</span>
                <span class="value">${numberWithCommas(entry.amount)} جنيه</span>
              </div>
              
              <div class="field">
                <span class="label">الوصف:</span>
                <span class="value">${entry.description}</span>
              </div>
              
              <div class="field">
                <span class="label">رقم المرجع:</span>
                <span class="value">${entry.reference_number || 'غير محدد'}</span>
              </div>
              
              <div class="field">
                <span class="label">الرصيد بعد الدفع:</span>
                <span class="value">${numberWithCommas(entry.balance_after)} جنيه</span>
              </div>
              
              <div class="divider"></div>
              
              <div class="field">
                <span class="label">تم الإنشاء بواسطة:</span>
                <span class="value">${entry.created_by?.name || 'غير محدد'}</span>
              </div>
              
              <div class="field">
                <span class="label">تاريخ الطباعة:</span>
                <span class="value">${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ar })}</span>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleDeleteClick = (entryId: number) => {
    setEntryToDelete(entryId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete || !deletionReason.trim()) {
      alert('يرجى إدخال سبب الحذف');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteLedgerEntry(entryToDelete, deletionReason);
      
      // Refresh the ledger
      if (enrollmentId) {
        await fetchEnrollmentLedger(Number(enrollmentId));
      }
      
      // Close dialog and reset state
      setShowDeleteDialog(false);
      setEntryToDelete(null);
      setDeletionReason('');
      
      alert('تم حذف القيد بنجاح');
    } catch (error: any) {
      console.error('Failed to delete ledger entry:', error);
      alert('فشل حذف القيد: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setEntryToDelete(null);
    setDeletionReason('');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl" dir="rtl">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl" dir="rtl">
        <div className="text-center text-red-600">خطأ: {error}</div>
      </div>
    );
  }

  if (!currentLedger) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl" dir="rtl">
        <div className="text-center">لا توجد بيانات متاحة</div>
      </div>
    );
  }

  return (
    <section className="container mx-auto p-4 sm:p-6 max-w-6xl" dir="rtl">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold text-primary">
          {isDeportationLedger ? 'دفتر حسابات الترحيل' : 'دفتر حسابات الطالب'}
        </h1>
      </div>

      {/* Student Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">معلومات الطالب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 border-2 border-dashed border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-2">
              {decodedStudentName}
            </h3>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-mono">
                رقم التسجيل: {enrollmentId}
              </span>
            </div>
            
            {/* Student Details */}
            {currentLedger?.enrollment && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm">
                <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-muted-foreground mb-1">المدرسة</span>
                  <span className="font-semibold text-foreground">
                    {currentLedger.enrollment.school?.name || 'غير محدد'}
                  </span>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-muted-foreground mb-1">المرحلة</span>
                  <span className="font-semibold text-foreground">
                    {currentLedger.enrollment.grade_level?.name || 'غير محدد'}
                  </span>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-muted-foreground mb-1">الفصل</span>
                  <span className="font-semibold text-foreground">
                    {currentLedger.enrollment.classroom?.name || 'غير محدد'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي الرسوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {numberWithCommas(currentLedger.summary.total_fees)} جنيه
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي المدفوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {numberWithCommas(currentLedger.summary.total_payments)} جنيه
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي الخصومات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {numberWithCommas(currentLedger.summary.total_discounts)} جنيه
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">الرصيد الحالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {numberWithCommas(currentLedger.current_balance)} جنيه
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Entry Button */}
      <div className="flex justify-end mb-6">
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة قيد جديد
        </Button>
      </div>

      {/* Generate PDF Button */}
      <div className="flex justify-end mb-6">
        <Button 
          onClick={() => handleGeneratePdf()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          إنشاء PDF
        </Button>
      </div>

      {/* Add New Entry Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إضافة قيد جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_type">نوع المعاملة</Label>
                  <Select
                    value={formData.transaction_type}
                    onValueChange={(value) => setFormData({ ...formData, transaction_type: value as 'fee' | 'payment' | 'discount' | 'refund' | 'adjustment' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fee">رسوم</SelectItem>
                      <SelectItem value="payment">دفع</SelectItem>
                      <SelectItem value="discount">خصم</SelectItem>
                      <SelectItem value="adjustment">تعديل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ</Label>
                  <Input
                    onFocus={
                      (e) => e.target.select()
                    }
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction_date">تاريخ المعاملة</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_number">رقم المرجع</Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  />
                </div>

                {formData.transaction_type === 'payment' && (
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">طريقة الدفع</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) => setFormData({ ...formData, payment_method: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقداً</SelectItem>
                        <SelectItem value="bankak">بنكك</SelectItem>
                        <SelectItem value="Fawri">فوري</SelectItem>
                        <SelectItem value="OCash">أوكاش</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'جاري الإضافة...' : 'إضافة القيد'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المعاملات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">التاريخ</TableHead>
                  <TableHead className="text-center">النوع</TableHead>
                  <TableHead className="text-center">الوصف</TableHead>
                  <TableHead className="text-center">المبلغ</TableHead>
                  <TableHead className="text-center">طريقة الدفع</TableHead>
                  <TableHead className="text-center">الرصيد بعد المعاملة</TableHead>
                  <TableHead className="text-center">رقم المرجع</TableHead>
                  <TableHead className="text-center">تم الإنشاء بواسطة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLedger.ledger_entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-center">
                      {format(new Date(entry.transaction_date), 'dd/MM/yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell className="text-center">
                      {getTransactionTypeBadge(entry.transaction_type)}
                    </TableCell>
                    <TableCell className="text-center">{entry.description}</TableCell>
                    <TableCell className={`text-center font-semibold ${
                      entry.transaction_type === 'fee' ? 'text-red-600' : 'text-green-600'
                    }`}>
                                                {entry.transaction_type === 'fee' ? '+' : '-'}{numberWithCommas(entry.amount)} جنيه
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.payment_method ? (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          {entry.payment_method === 'cash' && 'نقداً'}
                          {entry.payment_method === 'bankak' && 'بنكك'}
                          {entry.payment_method === 'Fawri' && 'فوري'}
                          {entry.payment_method === 'OCash' && 'أوكاش'}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                                                {numberWithCommas(entry.balance_after)} جنيه
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.reference_number || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.created_by?.name || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {entry.transaction_type === 'payment' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintReceipt(entry)}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Printer className="w-3 h-3" />
                            طباعة إيصال
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(entry.id)}
                          className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد حذف القيد</DialogTitle>
            <DialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم تسجيل هذا الحذف في سجل الحذف.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deletion_reason">سبب الحذف *</Label>
              <Textarea
                id="deletion_reason"
                placeholder="اكتب سبب حذف هذا القيد..."
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting || !deletionReason.trim()}
            >
              {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default StudentLedgerPage;
