// src/pages/finances/LedgerPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaymentMethodStore } from "@/stores/paymentMethodStore";
import { getLedgerEntriesByPaymentMethod, GetLedgerEntriesByPaymentMethodParams } from "@/api/ledgerApi";
import { StudentLedger } from "@/types/ledger";
import { ArrowRight, Wallet, Calendar, Search, Loader2 } from "lucide-react";
import dayjs from 'dayjs';

// Helper function to format numbers with thousands separator
const numberWithCommas = (x: number): string => {
  if (isNaN(x) || x === null || x === undefined) return '0';
  // Split into integer and decimal parts
  const parts = x.toFixed(2).split('.');
  // Add commas to integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join('.');
};

// Translate payment method names
const translatePaymentMethod = (method: string): string => {
  const translations: Record<string, string> = {
    'cash': 'نقداً',
    'bankak': 'بنكك',
    'Fawri': 'فوري',
    'OCash': 'أوكاش',
  };
  return translations[method] || method;
};

// Helper function to get start of current month in YYYY-MM-DD format
const getStartOfMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const LedgerPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchMethods, loading: paymentMethodsLoading } = usePaymentMethodStore();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>(getStartOfMonth());
  const [dateTo, setDateTo] = useState<string>(getCurrentDate());
  const [ledgerEntries, setLedgerEntries] = useState<StudentLedger[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ total_amount: number; total_entries: number } | null>(null);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handlePaymentMethodClick = async (paymentMethod: string) => {
    if (!dateFrom || !dateTo) {
      alert('يرجى تحديد تاريخ البداية وتاريخ النهاية');
      return;
    }

    setSelectedPaymentMethod(paymentMethod);
    setLoading(true);
    setError(null);

    try {
      const params: GetLedgerEntriesByPaymentMethodParams = {
        payment_method: paymentMethod,
        start_date: dateFrom,
        end_date: dateTo,
      };

      const response = await getLedgerEntriesByPaymentMethod(params);
      setLedgerEntries(response.data || []);
      setSummary(response.summary || { total_amount: 0, total_entries: 0 });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'فشل تحميل بيانات الدفتر');
      setLedgerEntries([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      fee: 'bg-red-100 text-red-800 border-red-200',
      payment: 'bg-green-100 text-green-800 border-green-200',
      discount: 'bg-blue-100 text-blue-800 border-blue-200',
      adjustment: 'bg-purple-100 text-purple-800 border-purple-200',
      refund: 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const labels: Record<string, string> = {
      fee: 'رسوم',
      payment: 'دفع',
      discount: 'خصم',
      adjustment: 'تعديل',
      refund: 'استرداد',
    };

    return (
      <Badge variant="outline" className={variants[type] || ''}>
        {labels[type] || type}
      </Badge>
    );
  };

  // Get unique payment methods from student_ledgers (hardcoded for now since they're enums)
  const paymentMethodOptions = [
    { value: 'cash', label: 'نقداً' },
    { value: 'bankak', label: 'بنكك' },
    { value: 'Fawri', label: 'فوري' },
    { value: 'OCash', label: 'أوكاش' },
  ];

  return (
    <section className="container mx-auto p-4 sm:p-6 " dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          العودة
        </Button>
      
      </div>

      {/* Date Range Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            تحديد الفترة الزمنية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_from">من تاريخ</Label>
              <Input
                id="date_from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_to">إلى تاريخ</Label>
              <Input
                id="date_to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods as Accounts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            طرق الدفع (الحسابات)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethodsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paymentMethodOptions.map((method) => (
                <Button
                  key={method.value}
                  variant={selectedPaymentMethod === method.value ? "default" : "outline"}
                  className="h-24 flex flex-col items-center justify-center gap-2 text-lg"
                  onClick={() => handlePaymentMethodClick(method.value)}
                  disabled={!dateFrom || !dateTo || loading}
                >
                  <Wallet className="w-6 h-6" />
                  {method.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ledger Entries Table */}
      {selectedPaymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              سجل المعاملات - {translatePaymentMethod(selectedPaymentMethod)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="mr-2">جاري التحميل...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد معاملات في هذه الفترة
              </div>
            ) : (
              <>
                {/* Summary */}
                {summary && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">إجمالي المعاملات</div>
                        <div className="text-2xl font-bold">{summary.total_entries}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">إجمالي المبلغ</div>
                        <div className="text-2xl font-bold text-primary">
                          {numberWithCommas(summary.total_amount)} جنيه
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Table */}
                <div className="border rounded-md overflow-x-auto w-full">
                  <Table className="min-w-[1200px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">التاريخ</TableHead>
                        <TableHead className="text-center">نوع المعاملة</TableHead>
                        <TableHead className="text-center">الوصف</TableHead>
                        <TableHead className="text-center">المبلغ</TableHead>
                        <TableHead className="text-center">طريقة الدفع</TableHead>
                        <TableHead className="text-center">رصيد الحساب</TableHead>
                        <TableHead className="text-center">رقم المرجع</TableHead>
                        <TableHead className="text-center">اسم الطالب</TableHead>
                        <TableHead className="text-center">تم الإنشاء بواسطة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        let runningBalance: number = 0;
                        return ledgerEntries.map((entry) => {
                          // Ensure amount is a number
                          const amount = typeof entry.amount === 'number' ? entry.amount : parseFloat(String(entry.amount)) || 0;
                          
                          // Calculate running balance based on transaction type
                          if (entry.transaction_type === 'fee') {
                            runningBalance = runningBalance + amount; // Fees increase balance
                          } else if (entry.transaction_type === 'payment') {
                            runningBalance = runningBalance + amount; // Payments received increase balance
                          } else if (entry.transaction_type === 'discount') {
                            runningBalance = runningBalance - amount; // Discounts decrease balance
                          } else if (entry.transaction_type === 'refund') {
                            runningBalance = runningBalance - amount; // Refunds decrease balance
                          } else if (entry.transaction_type === 'adjustment') {
                            runningBalance = runningBalance + amount; // Adjustments can be positive or negative
                          }
                          
                          return (
                            <TableRow key={entry.id}>
                              <TableCell className="text-center">
                                {dayjs(entry.transaction_date).format('YYYY/MM/DD')}
                              </TableCell>
                              <TableCell className="text-center">
                                {getTransactionTypeBadge(entry.transaction_type)}
                              </TableCell>
                              <TableCell className="text-center">{entry.description}</TableCell>
                              <TableCell className={`text-center font-semibold ${
                                entry.transaction_type === 'fee' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {numberWithCommas(amount)} جنيه
                              </TableCell>
                              <TableCell className="text-center">
                                {entry.payment_method ? (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                    {translatePaymentMethod(entry.payment_method)}
                                  </Badge>
                                ) : '-'}
                              </TableCell>
                              <TableCell className={`text-center font-semibold ${
                                runningBalance > 0 ? 'text-green-600' : runningBalance < 0 ? 'text-red-600' : ''
                              }`}>
                                {numberWithCommas(runningBalance)} جنيه
                              </TableCell>
                              <TableCell className="text-center">
                                {entry.reference_number || '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {(entry as StudentLedger & { enrollment?: { student?: { student_name?: string } } }).enrollment?.student?.student_name || '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {entry.created_by?.name || '-'}
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default LedgerPage;

