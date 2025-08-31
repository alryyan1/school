// src/pages/students/StudentList.tsx
import React, { useState, useEffect } from "react"; // Added React
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"; // shadcn Select
import {
  Eye, Plus, FileText, ChevronUp, ChevronDown, Mail, FilterX,
  Edit3, CheckCircle2,
} from "lucide-react";
import { useStudentStore } from "@/stores/studentStore";
import { useSchoolStore } from "@/stores/schoolStore";
import { Gender, Student } from "@/types/student";
import { useSnackbar } from "notistack";
import { useAuth } from "@/context/authcontext";
import { useNavigate } from "react-router-dom";
import { webUrl } from "@/constants";
import dayjs, { Dayjs } from "dayjs"; // Import Dayjs type

import QuickEnrollDialog from "@/components/enrollments/QuickEnrollDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


const StudentList = () => {
  const {
    students, loading, error, fetchStudents, acceptStudent, pagination,
  } = useStudentStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { permissions } = useAuth();
  const canEnroll = (permissions || []).includes('enrollment permission');
  
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [studentForEnroll, setStudentForEnroll] = useState<Student | null>(null);
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // Sorting state
  const [orderBy, setOrderBy] = useState<keyof Student>("id");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [wishedSchoolFilter, setWishedSchoolFilter] = useState<number | null>(null); // For Wished School
  const [dateFilterType, setDateFilterType] = useState<"created_at" | "date_of_birth" | " " | "">(" ");
  const [startDateFilter, setStartDateFilter] = useState<Dayjs | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Dayjs | null>(null);
  const [onlyEnrolled, setOnlyEnrolled] = useState(false);
  const [onlyApproved, setOnlyApproved] = useState(false);

  const { schools, fetchSchools } = useSchoolStore();
  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, [fetchStudents, fetchSchools]);

  // Function to build filter parameters
  const buildFilters = () => {
    const filters: Record<string, string | number | boolean> = {};
    
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    
    if (wishedSchoolFilter !== null) {
      filters.wished_school_id = wishedSchoolFilter;
    }
    
    if (dateFilterType && dateFilterType !== " ") {
      filters.date_type = dateFilterType;
      if (startDateFilter) {
        filters.start_date = startDateFilter.format('YYYY-MM-DD');
      }
      if (endDateFilter) {
        filters.end_date = endDateFilter.format('YYYY-MM-DD');
      }
    }
    
    if (onlyEnrolled) {
      filters.only_enrolled = true;
    }
    
    if (onlyApproved) {
      filters.only_approved = true;
    }
    
    filters.sort_by = orderBy;
    filters.sort_order = order;
    filters.per_page = rowsPerPage;
    filters.page = page + 1; // Backend uses 1-based pagination
    
    return filters;
  };

  // Fetch students with filters
  const fetchStudentsWithFilters = () => {
    const filters = buildFilters();
    fetchStudents(filters);
  };

  // Update filters effect
  useEffect(() => {
    fetchStudentsWithFilters();
  }, [searchTerm, wishedSchoolFilter, dateFilterType, startDateFilter, endDateFilter, onlyEnrolled, onlyApproved, orderBy, order, page]);

  // const handleDelete = async (id: number) => { /* ... same ... */ };
  const handlePrintList = () => {
    // Build query parameters based on current filters
    const params = new URLSearchParams();
    
    // Add search term if exists
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }
    
    // Add wished school filter if selected
    if (wishedSchoolFilter !== null) {
      params.append('wished_school_id', wishedSchoolFilter.toString());
    }
    
    // Add date filters if selected
    if (dateFilterType && dateFilterType !== " ") {
      if (startDateFilter) {
        params.append('start_date', startDateFilter.format('YYYY-MM-DD'));
      }
      if (endDateFilter) {
        params.append('end_date', endDateFilter.format('YYYY-MM-DD'));
      }
      params.append('date_type', dateFilterType);
    }
    
    // Add sorting parameters
    params.append('sort_by', orderBy);
    params.append('sort_order', order);
    
    // Build the URL
    const printUrl = `${webUrl}reports/students/list-pdf?${params.toString()}`;
    
    // Open in new window/tab
    window.open(printUrl, '_blank');
  };
  const handleSort = (property: keyof Student) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    // The useEffect will automatically refetch with new sorting
  };

  // Use students directly from backend (already filtered and paginated)
  const paginatedStudents = students;

  const handleAccept = async (student: Student) => {
    try {
      const success = await acceptStudent(student.id);
      if (success) {
        enqueueSnackbar(`تم قبول الطالب ${student.student_name} بنجاح`, { variant: 'success' });
      } else {
        enqueueSnackbar('فشل في قبول الطالب', { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('حدث خطأ أثناء قبول الطالب', { variant: 'error' });
    }
  };

  const openEnrollDialog = (student: Student) => {
    if (!student.wished_school) {
      enqueueSnackbar('الطالب لا يملك مدرسة مرغوبة محددة.', { variant: 'warning' });
      return;
    }
    setStudentForEnroll(student);
    setEnrollDialogOpen(true);
  };

  const handleRowClick = (student: Student) => {
    setSelectedStudent(student);
    setActionsDialogOpen(true);
  };

  const handleActionClick = (action: string, student: Student) => {
    setActionsDialogOpen(false);
    
    switch (action) {
      case 'view':
        navigate(`/students/${student.id}`);
        break;
      case 'enroll':
        openEnrollDialog(student);
        break;
      case 'edit':
        navigate(`/students/${student.id}/edit`);
        break;
      case 'accept':
        handleAccept(student);
        break;
    }
  };

  const SortButton = ({ column, children }: { column: keyof Student; children: React.ReactNode }) => (
    <Button variant="ghost" onClick={() => handleSort(column)} className="h-auto p-0 font-medium hover:bg-transparent hover:text-primary">
      {children}
      {orderBy === column && (order === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
    </Button>
  );

  const resetFilters = () => {
    setSearchTerm("");
    setWishedSchoolFilter(null);
    setDateFilterType(" ");
    setStartDateFilter(null);
    setEndDateFilter(null);
    setOnlyEnrolled(false);
    setOnlyApproved(false);
    setPage(0); // Reset to first page
    // The useEffect will automatically refetch with new filters
  };

  if (loading && students.length === 0) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl" dir="rtl">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-2 w-full sm:w-auto">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {[...Array(10)].map((_, i) => (
                          <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(10)].map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl" dir="rtl">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">قائمة الطلاب</CardTitle>
              {pagination && (
                <p className="text-sm text-muted-foreground mt-1">
                  إجمالي الطلاب: {pagination.total} طالب
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={() => navigate("/students/create")} size="sm" className="w-full sm:w-auto">
                <Plus className="ml-2 h-4 w-4" /> إضافة طالب
              </Button>
              <Button variant="outline" onClick={handlePrintList} size="sm" className="w-full sm:w-auto">
                <FileText className="ml-2 h-4 w-4" /> طباعة القائمة
              </Button>
              <Button variant="outline" onClick={() => window.open(`${webUrl}reports/terms-and-conditions`, '_blank')} size="sm" className="w-full sm:w-auto">
                <FileText className="ml-2 h-4 w-4" /> طباعة الشروط والأحكام
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 p-4 border rounded-lg bg-muted/50">
            <div className="sm:col-span-2 xl:col-span-2">
              <Input
                placeholder="بحث عام..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setPage(0);}}
                className="w-full"
              />
            </div>
            <Select value={wishedSchoolFilter?.toString() || ""} onValueChange={(value) => {setWishedSchoolFilter(value ? parseInt(value) : null); setPage(0);}}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="فلترة بالمدرسة..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>جميع المدارس</SelectItem>
                {schools?.map((school) => (
                  <SelectItem key={school.id} value={school.id.toString()}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilterType} onValueChange={(value) => {setDateFilterType(value as "created_at" | "date_of_birth" | ""); setPage(0);}}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="فلترة حسب تاريخ..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">(بدون فلتر تاريخ)</SelectItem>
                <SelectItem value="created_at">تاريخ التسجيل</SelectItem>
                <SelectItem value="date_of_birth">تاريخ الميلاد</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDateFilter ? startDateFilter.format('YYYY-MM-DD') : ''}
              onChange={(e) => {
                const date = e.target.value ? dayjs(e.target.value) : null;
                setStartDateFilter(date);
                setPage(0);
              }}
              className="w-full"
              placeholder="من تاريخ"
              disabled={!dateFilterType || dateFilterType === " "}
            />
            <Input
              type="date"
              value={endDateFilter ? endDateFilter.format('YYYY-MM-DD') : ''}
              onChange={(e) => {
                const date = e.target.value ? dayjs(e.target.value) : null;
                setEndDateFilter(date);
                setPage(0);
              }}
              className="w-full"
              placeholder="إلى تاريخ"
              disabled={!dateFilterType || dateFilterType === " "}
            />
            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-6 flex gap-2 justify-center lg:justify-end xl:justify-start">
              <Button
                variant={onlyEnrolled ? "default" : "outline"}
                onClick={() => { setOnlyEnrolled((v) => !v); setPage(0); }}
                size="sm"
                className="w-full sm:w-auto"
              >
                <CheckCircle2 className="ml-2 h-4 w-4" /> المسجلون فقط
              </Button>
              <Button
                variant={onlyApproved ? "default" : "outline"}
                onClick={() => { setOnlyApproved((v) => !v); setPage(0); }}
                size="sm"
                className="w-full sm:w-auto"
              >
                <CheckCircle2 className="ml-2 h-4 w-4" /> المقبولون فقط
              </Button>
              <Button variant="ghost" onClick={resetFilters} size="sm" className="w-full sm:w-auto">
                <FilterX className="ml-2 h-4 w-4" /> مسح الفلاتر
              </Button>
            </div>
          </div>

          {/* Table Container - Centered */}
          <div className="w-full flex justify-center">
            <div className="w-full border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="w-full ">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-16"><SortButton column="id">الكود</SortButton></TableHead>
                      <TableHead className="text-center "><SortButton column="student_name">اسم الطالب</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-20"><SortButton column="gender">الجنس</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell">هاتف الأب</TableHead>
                      <TableHead className="text-center hidden sm:table-cell"><SortButton column="wished_school">المدرسة</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-24"><SortButton column="approved">الحالة</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-40">مستحق/مدفوع (آخر عام)</TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-16">التسجيل</TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-28"><SortButton column="date_of_birth">ت. الميلاد</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-28"><SortButton column="created_at">ت. التسجيل</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-16">طباعة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                          {searchTerm || wishedSchoolFilter !== null || (dateFilterType && dateFilterType !== " ") || onlyEnrolled || onlyApproved
                            ? "لا توجد نتائج تطابق الفلاتر المحددة" 
                            : "لا توجد طلاب لعرضهم"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStudents.map((student) => (
                        <TableRow 
                          key={student.id} 
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleRowClick(student)}
                        >
                          <TableCell className="text-center font-mono text-sm">{student.id}</TableCell>
                          <TableCell className="font-medium text-center">{student.student_name}</TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
                            <Badge variant={student.gender === Gender.Male ? "default" : "secondary"} 
                                   className={student.gender === Gender.Male ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"}>
                              {student.gender === Gender.Male ? "ذكر" : "أنثى"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell text-sm">{student.father_phone || '-'}</TableCell>
                          <TableCell className="text-center hidden sm:table-cell text-sm">
                            {student.wished_school_details?.name || '-'}
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
                            <Badge variant={student.approved ? "default" : "outline"} 
                                   className={student.approved ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}>
                              {student.approved ? "مقبول" : "قيد المراجعة"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
                            {student.enrollments && student.enrollments.length > 0 ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 hover:bg-green-50" 
                                      onClick={() => navigate(`/students/${student.id}`)}
                                    >
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>الطالب مسجل - اضغط لعرض الملف</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell text-sm font-mono">
                            {(() => {
                              const totals = student.latest_academic_year_totals;
                              if (totals) {
                                const due = Number(totals.total_amount_required || 0);
                                const paid = Number(totals.total_amount_paid || 0);
                                return `${due.toFixed(0)} / ${paid.toFixed(0)}`;
                              }
                              return '-';
                            })()}
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell text-sm font-mono">
                            {student.date_of_birth ? dayjs(student.date_of_birth).format('YYYY/MM/DD') : '-'}
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell text-sm font-mono">
                            {student.created_at ? dayjs(student.created_at).format('YYYY/MM/DD') : '-'}
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                    <a href={`${webUrl}students/${student.id}/pdf`} target="_blank" rel="noopener noreferrer">
                                      <FileText className="h-4 w-4 text-red-600" />
                                    </a>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>طباعة ملف الطالب</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              {pagination ? (
                <>
                  عرض {pagination.from || 0}-{pagination.to || 0} من {pagination.total} طالب
                  {searchTerm || wishedSchoolFilter !== null || (dateFilterType && dateFilterType !== " ") || onlyEnrolled || onlyApproved ? (
                    <span className="text-primary font-medium"> (مفلتر)</span>
                  ) : null}
                </>
              ) : (
                `عرض ${students.length} طالب`
              )}
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => setPage(0)} disabled={page === 0} className="hidden sm:inline-flex">
                الأولى
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}>
                السابق
              </Button>
              <span className="text-sm px-3 py-1 rounded-md border bg-muted">
                {pagination ? `${pagination.current_page} / ${pagination.last_page}` : `${page + 1} / 1`}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={pagination ? page >= pagination.last_page - 1 : true}>
                التالي
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(pagination ? pagination.last_page - 1 : 0)} disabled={pagination ? page >= pagination.last_page - 1 : true} className="hidden sm:inline-flex">
                الأخيرة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <QuickEnrollDialog
        open={enrollDialogOpen}
        onOpenChange={(o) => setEnrollDialogOpen(o)}
        student={studentForEnroll}
        onSuccess={() => {
          setEnrollDialogOpen(false);
        }}
      />

      {/* Student Actions Dialog */}
      <Dialog open={actionsDialogOpen} onOpenChange={setActionsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إجراءات الطالب</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedStudent && (
              <>
                <div className="text-center p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold text-lg">{selectedStudent.student_name}</h3>
                  <p className="text-sm text-muted-foreground">كود الطالب: {selectedStudent.id}</p>
                </div>
                
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => handleActionClick('view', selectedStudent)}
                  >
                    <Eye className="ml-2 h-4 w-4" /> عرض الملف
                  </Button>
                  
                  {selectedStudent.approved && (!selectedStudent.enrollments || selectedStudent.enrollments.length === 0) && (
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => handleActionClick('enroll', selectedStudent)}
                      disabled={!canEnroll}
                    >
                      <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-600" /> تسجيل الطالب
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => handleActionClick('edit', selectedStudent)}
                  >
                    <Edit3 className="ml-2 h-4 w-4" /> تعديل البيانات
                  </Button>
                  
                  {!selectedStudent.approved && (
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => handleActionClick('accept', selectedStudent)}
                    >
                      <Mail className="ml-2 h-4 w-4 text-teal-500" /> قبول الطالب
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentList;