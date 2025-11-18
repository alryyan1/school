// src/pages/finances/OtherRevenuesPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Autocomplete,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  IconButton,
  Stack,
} from "@mui/material";
import { Plus, Search, Edit, Trash2, FileText, FileSpreadsheet } from "lucide-react";
import { formatNumber, webUrl } from '@/constants';
import { OtherRevenueApi } from "@/api/otherRevenueApi";
import { RevenueCategoryApi } from "@/api/revenueCategoryApi";
import { OtherRevenue, OtherRevenueFilters, CreateOtherRevenueRequest, UpdateOtherRevenueRequest, RevenueCategory, OtherRevenueStatistics } from "@/types/revenue";
import { toast } from "sonner";

const OtherRevenuesPage: React.FC = () => {
  const [revenues, setRevenues] = useState<OtherRevenue[]>([]);
  const [statistics, setStatistics] = useState<OtherRevenueStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  } | null>(null);
  const [categories, setCategories] = useState<RevenueCategory[]>([]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<OtherRevenue | null>(null);
  const [newlyCreatedRevenueId, setNewlyCreatedRevenueId] = useState<number | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<RevenueCategory | null>(null);

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

  const [filters, setFilters] = useState<OtherRevenueFilters>({
    search: "",
    category_id: undefined,
    date_from: formatYYYYMMDDLocal(startOfMonth),
    date_to: formatYYYYMMDDLocal(endOfMonth),
    sort_by: "revenue_date",
    sort_order: "desc",
    per_page: 15,
  });

  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const response = await OtherRevenueApi.getAll(filters);
      setRevenues(response.data.data);
      setPagination(response.data.pagination);
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل في جلب الإيرادات";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await OtherRevenueApi.getStatistics({
        date_from: filters.date_from,
        date_to: filters.date_to,
      });
      setStatistics(response.data);
    } catch (error: unknown) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await RevenueCategoryApi.getAllCategories();
      setCategories(response.data.data);
    } catch (error: unknown) {
      console.error('Failed to fetch categories:', error);
    }
  };


  useEffect(() => {
    fetchRevenues();
    fetchStatistics();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCreate = async (data: CreateOtherRevenueRequest) => {
    try {
      setLoading(true);
      const response = await OtherRevenueApi.create(data);
      if (response.data) {
        setNewlyCreatedRevenueId(response.data.id);
        setIsCreateDialogOpen(false);
        fetchRevenues();
        fetchStatistics();
        toast.success("تم إنشاء الإيراد بنجاح");
        setTimeout(() => setNewlyCreatedRevenueId(null), 3000);
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل في إنشاء الإيراد";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (revenue: OtherRevenue) => {
    setEditingRevenue(revenue);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: UpdateOtherRevenueRequest) => {
    if (!editingRevenue) return;
    
    try {
      setLoading(true);
      await OtherRevenueApi.update(editingRevenue.id, data);
      setIsEditDialogOpen(false);
      setEditingRevenue(null);
      fetchRevenues();
      fetchStatistics();
      toast.success("تم تحديث الإيراد بنجاح");
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل في تحديث الإيراد";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الإيراد؟")) {
      try {
        setLoading(true);
        await OtherRevenueApi.delete(id);
        fetchRevenues();
        fetchStatistics();
        toast.success("تم حذف الإيراد بنجاح");
      } catch (error: unknown) {
        const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل في حذف الإيراد";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (key: keyof OtherRevenueFilters, value: string | number | undefined) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
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
      case 'bank':
        return 'بنكي';
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
      const url = `${webUrl}reports/other-revenues?${params.toString()}`;
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
      const excelUrl = `${webUrl}reports/other-revenues-excel?${params.toString()}`;
      window.open(excelUrl, '_blank');
    } catch {
      toast.error("فشل في فتح تقرير Excel");
    }
  };

  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ p: 2 }} dir="rtl">
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="الإيرادات الأخرى" />
          <Tab label="الإحصائيات" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Card>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">إدارة الإيرادات الأخرى</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FileText />}
                onClick={generatePDF}
              >
                تصدير PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileSpreadsheet />}
                onClick={generateExcel}
              >
                تصدير Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                إضافة إيراد جديد
              </Button>
            </Stack>
          </Box>
          <CardContent>
            {/* Filters */}
            <Box sx={{ mb: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="البحث في الإيرادات..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: <Search style={{ marginRight: 8, color: '#999' }} />,
                    }}
                  />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Autocomplete
                    value={selectedCategoryFilter}
                    onChange={(event, newValue) => {
                      setSelectedCategoryFilter(newValue);
                      handleFilterChange('category_id', newValue?.id || undefined);
                    }}
                    options={categories || []}
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
                  />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="من تاريخ"
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="إلى تاريخ"
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>طريقة الدفع</InputLabel>
                    <Select
                      value={filters.payment_method || ''}
                      onChange={(e) => handleFilterChange('payment_method', e.target.value || undefined)}
                      label="طريقة الدفع"
                    >
                      <MenuItem value="">الكل</MenuItem>
                      <MenuItem value="cash">نقدي</MenuItem>
                      <MenuItem value="bank">بنكي</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Box>

            {/* Revenues Table */}
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">#</TableCell>
                    <TableCell align="center">الوصف</TableCell>
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
                  ) : revenues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        لا توجد إيرادات
                      </TableCell>
                    </TableRow>
                  ) : (
                    revenues.map((revenue) => (
                      <TableRow 
                        key={revenue.id}
                        sx={{
                          bgcolor: newlyCreatedRevenueId === revenue.id ? 'success.light' : 'inherit',
                        }}
                      >
                        <TableCell align="center">{revenue.id}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'medium' }}>
                          {revenue.desc}
                        </TableCell>
                        <TableCell align="center">
                          {revenue.revenue_category?.name}
                        </TableCell>
                        <TableCell align="center">
                          {formatNumber(revenue.amount)}
                        </TableCell>
                        <TableCell align="center">
                          {formatDate(revenue.revenue_date)}
                        </TableCell>
                        <TableCell align="center">
                          {translatePaymentMethod(revenue.payment_method)}
                        </TableCell>
                        <TableCell align="center">
                          {revenue.user?.name || "غير محدد"}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(revenue)}
                            >
                              <Edit size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(revenue.id)}
                              color="error"
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Per page selector and Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormLabel>عدد الصفوف:</FormLabel>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select 
                    value={String(filters.per_page || 15)} 
                    onChange={(e) => handleFilterChange('per_page', Number(e.target.value))}
                  >
                    <MenuItem value="10">10</MenuItem>
                    <MenuItem value="50">50</MenuItem>
                    <MenuItem value="100">100</MenuItem>
                    <MenuItem value="200">200</MenuItem>
                    <MenuItem value="500">500</MenuItem>
                    <MenuItem value="1000">1000</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (() => {
                const currentPage = pagination.current_page;
                const lastPage = pagination.last_page;
                const handlePageChange = (page: number) => {
                  const newFilters = { ...filters, page };
                  setFilters(newFilters);
                };

                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      السابق
                    </Button>
                    <Typography variant="body2" sx={{ px: 2 }}>
                      {currentPage} / {lastPage}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={currentPage === lastPage}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      التالي
                    </Button>
                  </Stack>
                );
              })()}
              {(!pagination || pagination.last_page <= 1) && <Box />}
            </Box>
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && statistics && (
        <Card>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">إحصائيات الإيرادات</Typography>
              {filters.date_from || filters.date_to ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  الفترة: {filters.date_from ? formatDate(filters.date_from) : '—'} إلى {filters.date_to ? formatDate(filters.date_to) : '—'}
                </Typography>
              ) : null}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                الإجمالي: {formatNumber(statistics.total_revenues)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                عدد العمليات: {statistics.revenue_count}
              </Typography>
            </Box>
          </Box>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  حسب الفئة
                </Typography>
                <Stack spacing={2}>
                  {statistics.revenues_by_category.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>{item.category_name}</Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {formatNumber(item.total_amount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.count} إيراد
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  حسب طريقة الدفع
                </Typography>
                <Stack spacing={2}>
                  {(statistics.totals_by_payment_method || []).map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>
                        {translatePaymentMethod(item.payment_method)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {formatNumber(item.total_amount)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>إضافة إيراد جديد</DialogTitle>
        <DialogContent dir="rtl" sx={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <OtherRevenueForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={loading}
            categories={categories}
            onRefreshCategories={fetchCategories}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingRevenue(null);
        }}
        maxWidth="sm"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>تعديل الإيراد</DialogTitle>
        <DialogContent dir="rtl" sx={{ maxHeight: '90vh', overflowY: 'auto' }}>
          {editingRevenue && (
            <OtherRevenueForm
              revenue={editingRevenue}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingRevenue(null);
              }}
              loading={loading}
              categories={categories}
              onRefreshCategories={fetchCategories}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Form Component
interface OtherRevenueFormProps {
  revenue?: OtherRevenue;
  onSubmit: (data: CreateOtherRevenueRequest | UpdateOtherRevenueRequest) => void;
  onCancel: () => void;
  loading: boolean;
  categories: RevenueCategory[];
  onRefreshCategories?: () => void;
  isEdit?: boolean;
}

const OtherRevenueForm: React.FC<OtherRevenueFormProps> = ({
  revenue,
  onSubmit,
  onCancel,
  loading,
  categories,
  onRefreshCategories,
  isEdit = false,
}) => {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [desc, setDesc] = useState(revenue?.desc || '');
  const [amount, setAmount] = useState(revenue?.amount?.toString() || '');
  const [revenueCategoryId, setRevenueCategoryId] = useState<number | undefined>(revenue?.revenue_category_id);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>(revenue?.payment_method || 'cash');
  const [revenueDate, setRevenueDate] = useState(revenue?.revenue_date || getTodayDate());
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("يرجى إدخال اسم الفئة");
      return;
    }

    try {
      setCreatingCategory(true);
      const response = await RevenueCategoryApi.create({ name: newCategoryName.trim() });
      if (response.data) {
        toast.success("تم إنشاء الفئة بنجاح");
        setNewCategoryName('');
        setIsCategoryDialogOpen(false);
        if (onRefreshCategories) {
          await onRefreshCategories();
        }
        // Auto-select the newly created category
        setRevenueCategoryId(response.data.id);
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل في إنشاء الفئة";
      toast.error(errorMessage);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !revenueCategoryId || !revenueDate) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    onSubmit({
      desc,
      amount: parseFloat(amount),
      revenue_category_id: revenueCategoryId,
      payment_method: paymentMethod,
      revenue_date: revenueDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} dir="rtl">
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="الوصف *"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
          placeholder="أدخل وصف الإيراد"
        />

        <TextField
          fullWidth
          label="المبلغ *"
          type="number"
          inputProps={{ step: "0.01", min: "0.01" }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="0.00"
        />

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <FormLabel>الفئة *</FormLabel>
            <Button
              type="button"
              variant="text"
              size="small"
              startIcon={<Plus size={14} />}
              onClick={() => setIsCategoryDialogOpen(true)}
            >
              إضافة فئة جديدة
            </Button>
          </Box>
          <FormControl fullWidth required>
            <InputLabel>اختر الفئة</InputLabel>
            <Select
              value={revenueCategoryId?.toString() || ''}
              onChange={(e) => setRevenueCategoryId(Number(e.target.value))}
              label="اختر الفئة"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

      {/* Quick Add Category Dialog */}
      <Dialog 
        open={isCategoryDialogOpen} 
        onClose={() => {
          setIsCategoryDialogOpen(false);
          setNewCategoryName('');
        }}
        maxWidth="xs"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>إضافة فئة جديدة</DialogTitle>
        <DialogContent dir="rtl" sx={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="اسم الفئة *"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="أدخل اسم الفئة"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCategoryName.trim() && !creatingCategory) {
                  handleCreateCategory();
                }
              }}
              autoFocus
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button 
                type="button" 
                variant="outlined" 
                onClick={() => {
                  setIsCategoryDialogOpen(false);
                  setNewCategoryName('');
                }}
                disabled={creatingCategory}
              >
                إلغاء
              </Button>
              <Button 
                type="button" 
                variant="contained"
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
              >
                {creatingCategory ? 'جاري الإضافة...' : 'إضافة'}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

        <FormControl fullWidth required>
          <InputLabel>طريقة الدفع *</InputLabel>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'bank')}
            label="طريقة الدفع *"
          >
            <MenuItem value="cash">نقدي</MenuItem>
            <MenuItem value="bank">بنكي</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="تاريخ الإيراد *"
          type="date"
          value={revenueDate}
          onChange={(e) => setRevenueDate(e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 2 }}>
          <Button type="button" variant="outlined" onClick={onCancel} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'جاري الحفظ...' : isEdit ? 'تحديث' : 'إضافة'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default OtherRevenuesPage;

