// src/pages/finances/StudentLedgerDeletionsPage.tsx
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLedgerDeletions, GetLedgerDeletionsParams } from "@/api/ledgerDeletions";
import { StudentLedgerDeletion } from "@/types/ledgerDeletion";
import { Calculator, CreditCard, FileText, DollarSign, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Helper function to format numbers with thousands separator
const numberWithCommas = (x: number): string => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const StudentLedgerDeletionsPage: React.FC = () => {
  const [deletions, setDeletions] = useState<StudentLedgerDeletion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<GetLedgerDeletionsParams>({
    page: 1,
    per_page: 20,
  });

  const fetchDeletions = async (params: GetLedgerDeletionsParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLedgerDeletions(params);
      setDeletions(response.deletions);
      setCurrentPage(response.pagination.current_page);
      setTotalPages(response.pagination.last_page);
      setTotal(response.pagination.total);
    } catch (err: unknown) {
      console.error('Failed to fetch deletions:', err);
      setError('فشل في تحميل سجل الحذف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletions(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    fetchDeletions(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchDeletions(newFilters);
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

  if (loading && deletions.length === 0) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl" dir="rtl">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl" dir="rtl">
        <div className="text-center text-red-600">خطأ: {error}</div>
      </div>
    );
  }

  return (
    <section className="container mx-auto p-4 sm:p-6 max-w-9xl" dir="rtl">
      {/* Header with inline filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">سجل المحذوفات</h1>
          <p className="text-muted-foreground">عرض جميع القيود المحاسبية المحذوفة مع تفاصيل الحذف</p>
        </div>
        
        {/* Inline Filters Card */}
        <Card className="w-full lg:w-auto">
          <CardContent className="p-1">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 px-1"
              >
                <Filter className="w-4 h-4 ml-1" />
                {showFilters ? 'إخفاء' : 'إظهار'} الفلاتر
              </Button>
            </div>
            
            {showFilters && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="start_date" className="text-xs">من تاريخ</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={filters.start_date || ''}
                      onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                      className="h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="end_date" className="text-xs">إلى تاريخ</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={filters.end_date || ''}
                      onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                      className="h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="student_id" className="text-xs">رقم الطالب</Label>
                    <Input
                      id="student_id"
                      type="number"
                      placeholder="أدخل رقم الطالب"
                      value={filters.student_id || ''}
                      onChange={(e) => setFilters({ ...filters, student_id: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({ page: 1, per_page: 20 });
                      fetchDeletions({ page: 1, per_page: 20 });
                    }}
                    className="h-8"
                  >
                    مسح الفلاتر
                  </Button>
                  <Button 
                    onClick={handleApplyFilters}
                    size="sm"
                    className="h-8"
                  >
                    تطبيق الفلاتر
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {/* <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">إجمالي القيود المحذوفة</p>
              <p className="text-3xl font-bold text-primary">{total}</p>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Deletions Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الحذف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">رقم القيد</TableHead>
                  <TableHead className="text-center">اسم الطالب</TableHead>
                  <TableHead className="text-center">النوع</TableHead>
                  <TableHead className="text-center">الوصف</TableHead>
                  <TableHead className="text-center">المبلغ</TableHead>
                  <TableHead className="text-center">تاريخ المعاملة</TableHead>
                  <TableHead className="text-center">من أنشأ القيد</TableHead>
                  <TableHead className="text-center">من حذف القيد</TableHead>
                  <TableHead className="text-center">سبب الحذف</TableHead>
                  <TableHead className="text-center">تاريخ الحذف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      لا توجد قيود محذوفة
                    </TableCell>
                  </TableRow>
                ) : (
                  deletions.map((deletion) => (
                    <TableRow key={deletion.id}>
                      <TableCell className="text-center">
                        <span className="font-mono text-sm">{deletion.ledger_entry_id}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {deletion.enrollment?.student?.student_name || deletion.student?.student_name || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {getTransactionTypeBadge(deletion.transaction_type)}
                      </TableCell>
                      <TableCell className="text-center">{deletion.description}</TableCell>
                      <TableCell className={`text-center font-semibold ${
                        deletion.transaction_type === 'fee' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {deletion.transaction_type === 'fee' ? '+' : '-'}{numberWithCommas(deletion.amount)} جنيه
                      </TableCell>
                      <TableCell className="text-center">
                        {format(new Date(deletion.transaction_date), 'dd/MM/yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-center">
                        {deletion.original_created_by?.name || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {deletion.deleted_by?.name || '-'}
                      </TableCell>
                      <TableCell className="text-center max-w-xs">
                        <div className="truncate" title={deletion.deletion_reason || ''}>
                          {deletion.deletion_reason || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {deletion.deleted_at 
                          ? format(new Date(deletion.deleted_at), 'dd/MM/yyyy HH:mm', { locale: ar })
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                الصفحة {currentPage} من {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default StudentLedgerDeletionsPage;


