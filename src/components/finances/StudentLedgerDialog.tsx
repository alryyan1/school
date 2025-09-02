import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLedgerStore } from "@/stores/ledgerStore";
import { StudentLedger, CreateLedgerEntryRequest } from "@/types/ledger";
import { Plus, Calendar, Calculator, CreditCard, FileText, DollarSign } from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Helper function to format numbers with thousands separator
const numberWithCommas = (x: number): string => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

interface StudentLedgerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: number;
  studentName: string;
}

const StudentLedgerDialog: React.FC<StudentLedgerDialogProps> = ({
  open,
  onOpenChange,
  enrollmentId,
  studentName,
}) => {
  const { 
    currentLedger, 
    loading, 
    error, 
    fetchEnrollmentLedger, 
    createLedgerEntry 
  } = useLedgerStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CreateLedgerEntryRequest>({
    enrollment_id: enrollmentId,
    transaction_type: 'fee',
    description: '',
    amount: 0,
    transaction_date: new Date().toISOString().split('T')[0],
    reference_number: '',
  });

  useEffect(() => {
    if (open && enrollmentId) {
      fetchEnrollmentLedger(enrollmentId);
    }
  }, [open, enrollmentId, fetchEnrollmentLedger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLedgerEntry(formData);
      setShowAddForm(false);
      setFormData({
        enrollment_id: enrollmentId,
        transaction_type: 'fee',
        description: '',
        amount: 0,
        transaction_date: new Date().toISOString().split('T')[0],
        reference_number: '',
      });
    } catch (error) {
      console.error('Failed to create ledger entry:', error);
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
      refund: 'bg-yellow-100 text-yellow-800 border-yellow-200',
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

  if (!currentLedger) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                 <DialogHeader>
           <DialogTitle className="text-xl font-bold text-center text-primary mb-4">
             دفتر حسابات الطالب - {studentName}
           </DialogTitle>
           
           {/* Student Details */}
           {currentLedger?.enrollment && (
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
               <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                 <span className="text-muted-foreground mb-1">المدرسة</span>
                 <span className="font-semibold text-foreground">
                   {currentLedger.enrollment.school?.name || 'غير محدد'}
                 </span>
               </div>
               
               <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                 <span className="text-muted-foreground mb-1">المرحلة</span>
                 <span className="font-semibold text-foreground">
                   {currentLedger.enrollment.grade_level?.name || 'غير محدد'}
                 </span>
               </div>
               
               <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                 <span className="text-muted-foreground mb-1">الفصل</span>
                 <span className="font-semibold text-foreground">
                   {currentLedger.enrollment.classroom?.name || 'غير محدد'}
                 </span>
               </div>
             </div>
           )}
         </DialogHeader>

        <div className="space-y-6">
                     {/* Summary Cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة قيد جديد
            </Button>
          </div>

          {/* Add New Entry Form */}
          {showAddForm && (
            <Card>
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
                        onValueChange={(value) => setFormData({ ...formData, transaction_type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fee">رسوم</SelectItem>
                          <SelectItem value="payment">دفع</SelectItem>
                          <SelectItem value="discount">خصم</SelectItem>
                          <SelectItem value="refund">استرداد</SelectItem>
                          <SelectItem value="adjustment">تعديل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">المبلغ</Label>
                      <Input
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
                      <TableHead className="text-center">الرصيد بعد المعاملة</TableHead>
                      <TableHead className="text-center">رقم المرجع</TableHead>
                      <TableHead className="text-center">تم الإنشاء بواسطة</TableHead>
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
                          entry.amount > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {entry.amount > 0 ? '+' : ''}{formatNumber(entry.amount)} جنيه
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {formatNumber(entry.balance_after)} جنيه
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.reference_number || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.created_by?.name || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentLedgerDialog;
