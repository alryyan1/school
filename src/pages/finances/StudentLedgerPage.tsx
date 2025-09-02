// src/pages/finances/StudentLedgerPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLedgerStore } from "@/stores/ledgerStore";
import { StudentLedger, CreateLedgerEntryRequest } from "@/types/ledger";
import { Plus, Calculator, CreditCard, FileText, DollarSign, ArrowRight, User, Hash } from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const StudentLedgerPage: React.FC = () => {
  const { enrollmentId, studentName } = useParams<{ enrollmentId: string; studentName: string }>();
  const navigate = useNavigate();
  const { 
    currentLedger, 
    loading, 
    error, 
    fetchEnrollmentLedger, 
    createLedgerEntry 
  } = useLedgerStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CreateLedgerEntryRequest>({
    enrollment_id: Number(enrollmentId),
    transaction_type: 'fee',
    description: '',
    amount: 0,
    transaction_date: new Date().toISOString().split('T')[0],
    reference_number: '',
  });

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
      await createLedgerEntry(formData);
      setShowAddForm(false);
      setFormData({
        enrollment_id: Number(enrollmentId),
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
        <h1 className="text-2xl font-bold text-primary">دفتر حسابات الطالب</h1>
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
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">الرصيد الحالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {currentLedger.current_balance.toLocaleString()} جنيه
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي الرسوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {currentLedger.summary.total_fees.toLocaleString()} جنيه
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي المدفوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentLedger.summary.total_payments.toLocaleString()} جنيه
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي الخصومات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentLedger.summary.total_discounts.toLocaleString()} جنيه
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي الاستردادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {currentLedger.summary.total_refunds.toLocaleString()} جنيه
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
                      entry.transaction_type === 'fee' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {entry.transaction_type === 'fee' ? '+' : '-'}{entry.amount.toLocaleString()} جنيه
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {entry.balance_after.toLocaleString()} جنيه
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
    </section>
  );
};

export default StudentLedgerPage;
