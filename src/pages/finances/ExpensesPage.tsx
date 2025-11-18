// src/pages/finances/ExpensesPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  DialogTitle,
  Autocomplete,
  Tabs,
  Tab,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
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
  const [tabValue, setTabValue] = useState("expenses");
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
    <Box sx={{ maxWidth: '100%', mx: 'auto', p: 1 }} dir="rtl">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label="المصروفات" value="expenses" />
          <Tab label="الإحصائيات" value="statistics" />
        </Tabs>

        {tabValue === "expenses" && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Card>
              <CardHeader
                title="إدارة المصروفات"
                dir="rtl"
                action={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={generatePDF} startIcon={<FileText size={16} />}>
                      تصدير PDF
                    </Button>
                    <Button variant="outlined" onClick={generateExcel} startIcon={<FileSpreadsheet size={16} />}>
                      تصدير Excel
                    </Button>
                    <Button variant="contained" onClick={() => setIsCreateDialogOpen(true)} startIcon={<Plus size={16} />}>
                      إضافة مصروف جديد
                    </Button>
                  </Box>
                }
              />
              <CardContent>
                {/* Filters */}
                <Box sx={{ mb: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 1 }}>
                    
                    <TextField
                      placeholder="البحث في المصروفات..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: <Search size={16} style={{ marginRight: 8, color: '#999' }} />,
                      }}
                    />
                    
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
                    
                    <TextField
                      id="date_from"
                      label="من تاريخ"
                      type="date"
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    
                    <TextField
                      id="date_to"
                      label="إلى تاريخ"
                      type="date"
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Box>
                </Box>

                {/* Expenses Table */}
                <Paper sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'auto' }} dir="rtl">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">#</TableCell>
                        <TableCell align="center">العنوان</TableCell>
                        <TableCell align="center">الفئة</TableCell>
                        <TableCell align="center">المبلغ</TableCell>
                        <TableCell align="center">التاريخ</TableCell>
                        <TableCell align="center">طريقة الدفع</TableCell>
                        <TableCell align="center">المستخدم</TableCell>
                        <TableCell align="center">الإجراءات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            جاري التحميل...
                          </TableCell>
                        </TableRow>
                      ) : expenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            لا توجد مصروفات
                          </TableCell>
                        </TableRow>
                      ) : (
                        expenses.map((expense) => (
                          <TableRow 
                            key={expense.id}
                            sx={{
                              backgroundColor: newlyCreatedExpenseId === expense.id ? 'rgba(34, 197, 94, 0.1)' : 'inherit',
                              borderColor: newlyCreatedExpenseId === expense.id ? 'rgba(34, 197, 94, 0.3)' : 'inherit',
                            }}
                          >
                            <TableCell align="center">{expense.id}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'medium' }}>
                              {expense.title}
                            </TableCell>
                            <TableCell align="center">
                              {expense.expense_category?.name}
                            </TableCell>
                            <TableCell align="center">
                              {formatNumber(expense.amount)}
                            </TableCell>
                            <TableCell align="center">
                              {formatDate(expense.expense_date)}
                            </TableCell>
                            <TableCell align="center">
                              {translatePaymentMethod(expense.payment_method)}
                            </TableCell>
                            <TableCell align="center">
                              {expense.created_by_user?.name || "غير محدد"}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(expense)}
                                >
                                  <Edit size={16} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(expense.id)}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>

                {/* Per page selector and Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel id="per-page-label">عدد الصفوف</InputLabel>
                      <Select 
                        labelId="per-page-label"
                        id="per-page"
                        value={String(filters.per_page || 15)} 
                        onChange={(e) => handleFilterChange('per_page', Number(e.target.value))}
                        label="عدد الصفوف"
                      >
                        <MenuItem value="10">10</MenuItem>
                        <MenuItem value="50">50</MenuItem>
                        <MenuItem value="100">100</MenuItem>
                        <MenuItem value="200">200</MenuItem>
                        <MenuItem value="500">500</MenuItem>
                        <MenuItem value="1000">1000</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

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
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        السابق
                      </Button>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {pageNumbers.map((page, index) => {
                          if (page === 'ellipsis') {
                            return (
                              <Typography key={`ellipsis-${index}`} sx={{ px: 1, color: 'text.secondary' }}>
                                ...
                              </Typography>
                            );
                          }
                          
                          const pageNum = page as number;
                          const isActive = pageNum === currentPage;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={isActive ? "contained" : "outlined"}
                              size="small"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </Box>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={currentPage === lastPage}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        التالي
                      </Button>
                    </Box>
                  );
                })()}
                {(!pagination || pagination.last_page <= 1) && <Box></Box>}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {tabValue === "statistics" && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {statistics && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} dir="rtl">
                <Card dir="rtl">
                  <Box sx={{ p: 2, pb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6">
                          إحصائيات المصروفات
                        </Typography>
                        {filters.date_from || filters.date_to ? (
                          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            الفترة: {filters.date_from ? formatDate(filters.date_from) : '—'} إلى {filters.date_to ? formatDate(filters.date_to) : '—'}
                          </Typography>
                        ) : null}
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 'medium' }}>الإجمالي: {formatNumber(statistics.total_expenses)}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>عدد العمليات: {statistics.expense_count}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <CardContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'semibold', mb: 2 }}>حسب الفئة</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {statistics.expenses_by_category.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography>{item.category_name}</Typography>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography sx={{ fontWeight: 'medium' }}>{formatNumber(item.total_amount)}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.count} مصروف</Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'semibold', mb: 2 }}>حسب طريقة الدفع</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {(statistics.totals_by_payment_method || []).map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography>
                                {translatePaymentMethod(item.payment_method)}
                              </Typography>
                              <Typography sx={{ textAlign: 'right', fontWeight: 'medium' }}>{formatNumber(item.total_amount)}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Create Dialog */}
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
    </Box>
  );
};

export default ExpensesPage;



