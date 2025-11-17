// src/pages/finances/ExpensesPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, FileText, FileSpreadsheet } from "lucide-react";
import { formatNumber } from '@/constants';
import { useExpenseStore } from "@/stores/expenseStore";
import { useExpenseCategoryStore } from "@/stores/expenseCategoryStore";
import { Expense, ExpenseFilters, CreateExpenseRequest, UpdateExpenseRequest, ExpenseCategory } from "@/types/expense";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { toast } from "sonner";
import { webUrl } from "@/constants";

const ExpensesPage: React.FC = () => {
  const {
    expenses,
    statistics,
    loading,
    error,
    pagination,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchStatistics,
    clearError,
  } = useExpenseStore();

  const { activeCategories, fetchActiveCategories } = useExpenseCategoryStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newlyCreatedExpenseId, setNewlyCreatedExpenseId] = useState<number | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ExpenseCategory | null>(null);
  // Default date range: start of current month to end of current month
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const formatYYYYMMDDLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const [filters, setFilters] = useState<ExpenseFilters>({
    search: "",
    category_id: undefined,
    date_from: formatYYYYMMDDLocal(startOfMonth),
    date_to: formatYYYYMMDDLocal(endOfMonth),
    sort_by: "created_at",
    sort_order: "desc",
    per_page: 15,
  });

  useEffect(() => {
    fetchExpenses(filters);
    fetchStatistics({ date_from: filters.date_from, date_to: filters.date_to });
    fetchActiveCategories();
  }, [fetchExpenses, fetchStatistics, fetchActiveCategories, filters]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleCreate = async (data: CreateExpenseRequest) => {
    try {
      const newExpense = await createExpense(data);
      if (newExpense) {
        setNewlyCreatedExpenseId(newExpense.id);
        setIsCreateDialogOpen(false);
        fetchExpenses(filters);
        fetchStatistics({ date_from: filters.date_from, date_to: filters.date_to });
        toast.success("تم إنشاء المصروف بنجاح");
        // Clear highlight after 3 seconds
        setTimeout(() => setNewlyCreatedExpenseId(null), 3000);
      }
    } catch {
      toast.error("فشل في إنشاء المصروف");
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: UpdateExpenseRequest) => {
    if (!editingExpense) return;
    
    try {
      await updateExpense(editingExpense.id, data);
      setIsEditDialogOpen(false);
      setEditingExpense(null);
      fetchExpenses(filters);
      fetchStatistics({ date_from: filters.date_from, date_to: filters.date_to });
      toast.success("تم تحديث المصروف بنجاح");
    } catch {
      toast.error("فشل في تحديث المصروف");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      try {
        await deleteExpense(id);
        fetchExpenses(filters);
        fetchStatistics({ date_from: filters.date_from, date_to: filters.date_to });
        toast.success("تم حذف المصروف بنجاح");
      } catch {
        toast.error("فشل في حذف المصروف");
      }
    }
  };


  const handleFilterChange = (key: keyof ExpenseFilters, value: string | number | undefined) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Reset to page 1 when per_page changes
      if (key === 'per_page') {
        newFilters.page = 1;
      }
      return newFilters;
    });
  };

  


  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const translatePaymentMethod = (method: string) => {
    switch (method) {
      case 'cash':
        return 'نقدي';
      case 'bankak':
        return 'بنكاك';
      case 'ocash':
        return 'أوكاش';
      case 'fawri':
        return 'فوري';
      default:
        return method;
    }
  };

  const generatePDF = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
      });
      const url = `${webUrl}reports/expenses?${params.toString()}`;
      window.open(url, '_blank');
    } catch {
      toast.error("فشل في فتح تقرير PDF");
    }
  };

  const generateExcel = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
      });
      const excelUrl = `${webUrl}reports/expenses-excel?${params.toString()}`;
      window.open(excelUrl, '_blank');
    } catch {
      toast.error("فشل في فتح تقرير Excel");
    }
  };

  return (
    <section className="container mx-auto p-1 sm:p-1" dir="rtl">
      <div className="space-y-6">

        <Tabs defaultValue="expenses" className="space-y-1">
          <TabsList>
            <TabsTrigger value="expenses">المصروفات</TabsTrigger>
            <TabsTrigger value="statistics">الإحصائيات</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-1">
            <Card>
              <CardHeader>
                <div dir="rtl" className="flex justify-between items-center">
                  <CardTitle>إدارة المصروفات</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={generatePDF}>
                      <FileText className="w-4 h-4 ml-2" />
                      تصدير PDF
                    </Button>
                    <Button variant="outline" onClick={generateExcel}>
                      <FileSpreadsheet className="w-4 h-4 ml-2" />
                      تصدير Excel
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة مصروف جديد
                    </Button>
                    <Dialog 
                      open={isCreateDialogOpen} 
                      onClose={() => setIsCreateDialogOpen(false)}
                      maxWidth="sm"
                      fullWidth
                      dir="rtl"
                    >
                      <DialogTitle>إضافة مصروف جديد</DialogTitle>
                      <DialogContent dir="rtl" sx={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <ExpenseForm
                          onSubmit={handleCreate}
                          onCancel={() => setIsCreateDialogOpen(false)}
                          loading={loading}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-1 space-y-1">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-1">
                    <div className="relative">
                      <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="البحث في المصروفات..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    
                    <Autocomplete
                      value={selectedCategoryFilter}
                      onChange={(event, newValue) => {
                        setSelectedCategoryFilter(newValue);
                        handleFilterChange('category_id', newValue?.id || undefined);
                      }}
                      options={activeCategories || []}
                      getOptionLabel={(option) => option?.name || ''}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      noOptionsText="لا توجد فئات متاحة"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="جميع الفئات"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      renderOption={(props, option) => {
                        const { key, ...otherProps } = props;
                        return (
                          <li key={key} {...otherProps}>
                            <span>{option.name}</span>
                          </li>
                        );
                      }}
                    />
                    
                    <div className="space-y-2">
                      <Label htmlFor="date_from">من تاريخ</Label>
                      <Input
                        id="date_from"
                        type="date"
                        value={filters.date_from || ''}
                        onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date_to">إلى تاريخ</Label>
                      <Input
                        id="date_to"
                        type="date"
                        value={filters.date_to || ''}
                        onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                      />
                    </div>
                    
                    
                  </div>
                </div>

                {/* Expenses Table */}
                <div className="border rounded-md overflow-x-auto" dir="rtl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">#</TableHead>
                        <TableHead className="text-center">العنوان</TableHead>
                        <TableHead className="text-center">الفئة</TableHead>
                        <TableHead className="text-center">المبلغ</TableHead>
                        <TableHead className="text-center">التاريخ</TableHead>
                        <TableHead className="text-center">طريقة الدفع</TableHead>
                        <TableHead className="text-center">المستخدم</TableHead>
                        <TableHead className="text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            جاري التحميل...
                          </TableCell>
                        </TableRow>
                      ) : expenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            لا توجد مصروفات
                          </TableCell>
                        </TableRow>
                      ) : (
                        expenses.map((expense) => (
                          <TableRow 
                            key={expense.id}
                            className={newlyCreatedExpenseId === expense.id ? "bg-green-50 border-green-200" : ""}
                          >
                            <TableCell className="text-center">{expense.id}</TableCell>
                            <TableCell className="text-center font-medium">
                              {expense.title}
                            </TableCell>
                            <TableCell className="text-center">
                              {expense.expense_category?.name}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatNumber(expense.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatDate(expense.expense_date)}
                            </TableCell>
                            <TableCell className="text-center">
                              {translatePaymentMethod(expense.payment_method)}
                            </TableCell>
                            <TableCell className="text-center">
                              {expense.created_by?.name || "غير محدد"}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center space-x-2 space-x-reverse">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(expense)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(expense.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Per page selector and Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="per-page">عدد الصفوف:</Label>
                    <Select 
                      value={String(filters.per_page || 15)} 
                      onValueChange={(v) => handleFilterChange('per_page', Number(v))}
                    >
                      <SelectTrigger className="w-[120px]" id="per-page">
                        <SelectValue placeholder="عدد الصفوف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                        <SelectItem value="1000">1000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (() => {
                  const currentPage = pagination.current_page;
                  const lastPage = pagination.last_page;
                  const handlePageChange = (page: number) => {
                    const newFilters = { ...filters, page };
                    setFilters(newFilters);
                    fetchExpenses(newFilters);
                  };

                  // Generate page numbers to display
                  const getPageNumbers = () => {
                    const pages: (number | string)[] = [];
                    const maxPagesToShow = 7;
                    
                    if (lastPage <= maxPagesToShow) {
                      // Show all pages if total pages is less than max
                      for (let i = 1; i <= lastPage; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      if (currentPage <= 4) {
                        // Near the beginning
                        for (let i = 2; i <= 5; i++) {
                          pages.push(i);
                        }
                        pages.push('ellipsis');
                        pages.push(lastPage);
                      } else if (currentPage >= lastPage - 3) {
                        // Near the end
                        pages.push('ellipsis');
                        for (let i = lastPage - 4; i <= lastPage; i++) {
                          pages.push(i);
                        }
                      } else {
                        // In the middle
                        pages.push('ellipsis');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('ellipsis');
                        pages.push(lastPage);
                      }
                    }
                    
                    return pages;
                  };

                  const pageNumbers = getPageNumbers();

                  return (
                    <div className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        السابق
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {pageNumbers.map((page, index) => {
                          if (page === 'ellipsis') {
                            return (
                              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                ...
                              </span>
                            );
                          }
                          
                          const pageNum = page as number;
                          const isActive = pageNum === currentPage;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className={isActive ? "bg-primary text-primary-foreground" : ""}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === lastPage}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        التالي
                      </Button>
                    </div>
                  );
                })()}
                {(!pagination || pagination.last_page <= 1) && <div></div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            {statistics && (
              <div className="space-y-4" dir="rtl">
                <Card dir="rtl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        إحصائيات المصروفات
                        {filters.date_from || filters.date_to ? (
                          <span className="block text-sm text-muted-foreground mt-1">
                            الفترة: {filters.date_from ? formatDate(filters.date_from) : '—'} إلى {filters.date_to ? formatDate(filters.date_to) : '—'}
                          </span>
                        ) : null}
                      </CardTitle>
                      <div className="text-right">
                        <div className="font-medium">الإجمالي: {formatNumber(statistics.total_expenses)}</div>
                        <div className="text-sm text-muted-foreground">عدد العمليات: {statistics.expense_count}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="font-semibold mb-3">حسب الفئة</div>
                        <div className="space-y-3">
                          {statistics.expenses_by_category.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>{item.category_name}</span>
                              <div className="text-right">
                                <div className="font-medium">{formatNumber(item.total_amount)}</div>
                                <div className="text-sm text-muted-foreground">{item.count} مصروف</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold mb-3">حسب طريقة الدفع</div>
                        <div className="space-y-3">
                          {(statistics.totals_by_payment_method || []).map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>
                                {translatePaymentMethod(item.payment_method)}
                              </span>
                              <div className="text-right font-medium">{formatNumber(item.total_amount)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingExpense(null);
        }}
        maxWidth="sm"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>تعديل المصروف</DialogTitle>
        <DialogContent dir="rtl" sx={{ maxHeight: '90vh', overflowY: 'auto' }}>
          {editingExpense && (
            <ExpenseForm
              expense={editingExpense}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingExpense(null);
              }}
              loading={loading}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>

    </section>
  );
};

export default ExpensesPage;



