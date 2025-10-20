// src/components/expenses/ExpenseForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@mui/material";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogActions } from "@mui/material";
import { TextField } from "@mui/material";
import { MenuItem } from "@mui/material";
import { Autocomplete } from "@mui/material";
import { Plus } from "lucide-react";
import { useExpenseCategoryStore } from "@/stores/expenseCategoryStore";
import { Expense, CreateExpenseRequest, UpdateExpenseRequest, ExpenseCategory } from "@/types/expense";
import { toast } from "sonner";

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: CreateExpenseRequest | UpdateExpenseRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}) => {
  const { activeCategories, fetchActiveCategories, createCategory } = useExpenseCategoryStore();
  
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    title: "",
    description: "",
    amount: 0,
    expense_category_id: 0,
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
  });

  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchActiveCategories();
  }, [fetchActiveCategories]);

  // Debug: Log categories when they change
  useEffect(() => {
    console.log('Active categories:', activeCategories);
  }, [activeCategories]);

  useEffect(() => {
    if (expense && isEdit) {
      console.log("Expense data received:", expense);
      console.log("Original expense_date:", expense.expense_date);
      
      // Format the date to YYYY-MM-DD for HTML date input
      const formattedDate = expense.expense_date ? 
        new Date(expense.expense_date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
      
      console.log("Formatted date:", formattedDate);
      
      setFormData({
        title: expense.title,
        description: expense.description || "",
        amount: expense.amount,
        expense_category_id: expense.expense_category_id,
        expense_date: formattedDate,
        payment_method: expense.payment_method,
      });
      setSelectedCategory(expense.expense_category || null);
    }
  }, [expense, isEdit]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "العنوان مطلوب";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "المبلغ يجب أن يكون أكبر من صفر";
    }

    if (!formData.expense_category_id) {
      newErrors.expense_category_id = "فئة المصروف مطلوبة";
    }

    if (!formData.expense_date) {
      newErrors.expense_date = "تاريخ المصروف مطلوب";
    }

    if (!formData.payment_method) {
      newErrors.payment_method = "طريقة الدفع مطلوبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    console.log("Submitting form data:", formData);
    console.log("Is edit mode:", isEdit);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("اسم الفئة مطلوب");
      return;
    }

    try {
      const newCategory = await createCategory({
        name: newCategoryName,
        color: "#" + Math.floor(Math.random()*16777215).toString(16),
        is_active: true,
      });

      if (newCategory) {
        setSelectedCategory(newCategory);
        setFormData({ ...formData, expense_category_id: newCategory.id });
        setNewCategoryName("");
        setIsCreateCategoryDialogOpen(false);
        toast.success("تم إنشاء الفئة بنجاح");
      }
    } catch {
      toast.error("فشل في إنشاء الفئة");
    }
  };

  return (
    <>
      <Card dir="rtl">
        <CardHeader>
          <CardTitle>
            {isEdit ? "تعديل المصروف" : "إضافة مصروف جديد"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} onKeyPress={handleKeyPress} className="space-y-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان المصروف *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: شراء أثاث للمكتب"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ *</Label>
                <Input
                 onFocus={
                  (e) => {
                    e.target.select();
                  }
                 }
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف المصروف</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف تفصيلي للمصروف (اختياري)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">فئة المصروف *</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Autocomplete
                      value={selectedCategory}
                      onChange={(event, newValue) => {
                        setSelectedCategory(newValue);
                        setFormData({ ...formData, expense_category_id: newValue?.id || 0 });
                      }}
                      options={activeCategories || []}
                      getOptionLabel={(option) => option?.name || ''}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      noOptionsText="لا توجد فئات متاحة"
                      loading={loading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={activeCategories?.length > 0 ? "اختر فئة المصروف" : "جاري تحميل الفئات..."}
                          error={!!errors.expense_category_id}
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
                  </div>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={() => setIsCreateCategoryDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.expense_category_id && (
                  <p className="text-sm text-red-500">{errors.expense_category_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_date">تاريخ المصروف *</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className={errors.expense_date ? "border-red-500" : ""}
                />
                {errors.expense_date && (
                  <p className="text-sm text-red-500">{errors.expense_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">طريقة الدفع *</Label>
                <TextField
                  id="payment_method"
                  select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as 'cash' | 'bankak' | 'ocash' | 'fawri' })}
                  error={!!errors.payment_method}
                  variant="outlined"
                  size="small"
                >
                  <MenuItem value="cash">نقدي (Cash)</MenuItem>
                  <MenuItem value="bankak">بنكاك (Bankak)</MenuItem>
                  <MenuItem value="ocash">أوكاش (OCash)</MenuItem>
                  <MenuItem value="fawri">فوري (Fawri)</MenuItem>
                </TextField>
                {errors.payment_method && (
                  <p className="text-sm text-red-500">{errors.payment_method}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button type="button" variant="outlined" onClick={onCancel}>
                إلغاء
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "جاري الحفظ..." : isEdit ? "تحديث" : "حفظ"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog 
        open={isCreateCategoryDialogOpen} 
        onClose={() => setIsCreateCategoryDialogOpen(false)}
        dir="rtl"
      >
        <DialogTitle>إضافة فئة جديدة</DialogTitle>
        <DialogContent dir="rtl" sx={{ minWidth: 400 }}>
          <div className="space-y-4" dir="rtl">
            <div className="space-y-2">
              <Label htmlFor="newCategoryName">اسم الفئة</Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="اسم الفئة الجديدة"
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions dir="rtl">
          <Button 
            variant="outlined" 
            onClick={() => setIsCreateCategoryDialogOpen(false)}
          >
            إلغاء
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateCategory}
          >
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExpenseForm;
