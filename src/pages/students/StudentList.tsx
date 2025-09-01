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
  Plus, FileText, ChevronUp, ChevronDown, FilterX,
  CheckCircle2, Eye, RefreshCw, User, XCircle,
} from "lucide-react";
import { useStudentStore } from "@/stores/studentStore";
import { useSchoolStore } from "@/stores/schoolStore";
import { Gender, Student } from "@/types/student";
import { useSnackbar } from "notistack";

import { useNavigate } from "react-router-dom";
import { webUrl } from "@/constants";
import dayjs, { Dayjs } from "dayjs"; // Import Dayjs type

import QuickEnrollDialog from "@/components/enrollments/QuickEnrollDialog";
import StudentActionsDialog from "@/components/students/StudentActionsDialog";


const StudentList = () => {
  const {
    students, loading, error, fetchStudents, acceptStudent, pagination,
  } = useStudentStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [studentForEnroll, setStudentForEnroll] = useState<Student | null>(null);
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [highlightedStudentId, setHighlightedStudentId] = useState<number | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  const [onlyNotEnrolled, setOnlyNotEnrolled] = useState(false);
  const [onlyNotApproved, setOnlyNotApproved] = useState(false);

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
    
    if (onlyNotEnrolled) {
      filters.only_not_enrolled = true;
    }
    
    if (onlyNotApproved) {
      filters.only_not_approved = true;
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
  }, [searchTerm, wishedSchoolFilter, dateFilterType, startDateFilter, endDateFilter, onlyEnrolled, onlyApproved, onlyNotEnrolled, onlyNotApproved, orderBy, order, page, rowsPerPage]);

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
    
    // Add enrollment and approval filters
    if (onlyEnrolled) {
      params.append('only_enrolled', 'true');
    }
    
    if (onlyApproved) {
      params.append('only_approved', 'true');
    }
    
    if (onlyNotEnrolled) {
      params.append('only_not_enrolled', 'true');
    }
    
    if (onlyNotApproved) {
      params.append('only_not_approved', 'true');
    }
    
    // Add sorting parameters
    params.append('sort_by', orderBy);
    params.append('sort_order', order);
    
    // Add pagination parameters (for PDF, we might want all results)
    params.append('per_page', '1000'); // Get all results for PDF
    params.append('page', '1');
    
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
        // Highlight the approved student
        highlightStudent(student.id, 4000);
        // Refresh the student data to show updated status
        setTimeout(() => refreshStudentData(student.id), 500);
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

  // Function to refresh a specific student's data
  const refreshStudentData = async (studentId: number) => {
    try {
      // Show loading state
      enqueueSnackbar('جاري تحديث البيانات...', { variant: 'info' });
      
      // Refresh the entire students list to get updated data
      await fetchStudentsWithFilters();
      
      // Update the selected student if it's the same one
      if (selectedStudent && selectedStudent.id === studentId) {
        const updatedStudent = students.find(s => s.id === studentId);
        if (updatedStudent) {
          setSelectedStudent(updatedStudent);
        }
      }
      
      // Show success message
      enqueueSnackbar('تم تحديث البيانات بنجاح', { variant: 'success' });
    } catch (error) {
      console.error('Failed to refresh student data:', error);
      enqueueSnackbar('فشل في تحديث البيانات', { variant: 'error' });
    }
  };

  // Function to highlight a student temporarily
  const highlightStudent = (studentId: number, duration: number = 3000) => {
    setHighlightedStudentId(studentId);
    setTimeout(() => {
      setHighlightedStudentId(null);
    }, duration);
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
    setOnlyNotEnrolled(false);
    setOnlyNotApproved(false);
    setPage(0); // Reset to first page
    setRowsPerPage(10); // Reset to default rows per page
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
              <Button 
                variant="outline" 
                onClick={() => {
                  fetchStudentsWithFilters();
                  enqueueSnackbar('جاري تحديث قائمة الطلاب...', { variant: 'info' });
                }} 
                size="sm" 
                className="w-full sm:w-auto"
                disabled={loading}
              >
                <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
                تحديث
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
            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-6 flex flex-wrap gap-2 justify-center lg:justify-end xl:justify-start">
              {/* Enrollment Status Filters */}
              <div className="flex gap-1 items-center">
                <span className="text-xs text-muted-foreground px-2">التسجيل:</span>
                <Button
                  variant={onlyEnrolled ? "default" : "outline"}
                  onClick={() => { 
                    setOnlyEnrolled((v) => !v); 
                    setOnlyNotEnrolled(false);
                    setOnlyNotApproved(false);
                    setPage(0); 
                  }}
                  size="sm"
                  className="w-auto"
                >
                  <CheckCircle2 className="ml-1 h-3 w-3" /> المسجلون
                </Button>
                <Button
                  variant={onlyNotEnrolled ? "default" : "outline"}
                  onClick={() => { 
                    setOnlyNotEnrolled((v) => !v); 
                    setOnlyEnrolled(false);
                    setOnlyApproved(false);
                    setPage(0); 
                  }}
                  size="sm"
                  className="w-auto"
                >
                  <User className="ml-1 h-3 w-3" /> غير المسجلين
                </Button>
              </div>
              
              {/* Approval Status Filters */}
              <div className="flex gap-1 items-center">
                <span className="text-xs text-muted-foreground px-2">القبول:</span>
                <Button
                  variant={onlyApproved ? "default" : "outline"}
                  onClick={() => { 
                    setOnlyApproved((v) => !v); 
                    setOnlyNotEnrolled(false);
                    setOnlyNotApproved(false);
                    setPage(0); 
                  }}
                  size="sm"
                  className="w-auto"
                >
                  <CheckCircle2 className="ml-1 h-3 w-3" /> المقبولون
                </Button>
                <Button
                  variant={onlyNotApproved ? "default" : "outline"}
                  onClick={() => { 
                    setOnlyNotApproved((v) => !v); 
                    setOnlyEnrolled(false);
                    setOnlyApproved(false);
                    setPage(0); 
                  }}
                  size="sm"
                  className="w-auto"
                >
                  <XCircle className="ml-1 h-3 w-3" /> غير المقبولين
                </Button>
              </div>
              
              <Button variant="ghost" onClick={resetFilters} size="sm" className="w-auto">
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
                      <TableHead className="text-center w-20">الصورة</TableHead>


                      <TableHead className="text-center "><SortButton column="student_name">اسم الطالب</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-20"><SortButton column="gender">الجنس</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell">هاتف الأب</TableHead>
                      <TableHead className="text-center hidden sm:table-cell"><SortButton column="wished_school">المدرسة</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-24"><SortButton column="approved">الحالة</SortButton></TableHead>
                 
                      <TableHead className="text-center hidden sm:table-cell w-16">التسجيل</TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-28"><SortButton column="date_of_birth">ت. الميلاد</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-28"><SortButton column="created_at">ت. التسجيل</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-16">طباعة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                          {searchTerm || wishedSchoolFilter !== null || (dateFilterType && dateFilterType !== " ") || onlyEnrolled || onlyApproved || onlyNotEnrolled || onlyNotApproved
                            ? "لا توجد نتائج تطابق الفلاتر المحددة" 
                            : "لا توجد طلاب لعرضهم"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStudents.map((student) => (
                        <TableRow 
                          key={student.id} 
                          className={`hover:bg-muted/50 cursor-pointer transition-all duration-500 ${
                            highlightedStudentId === student.id 
                              ? 'bg-green-100 dark:bg-green-900/20 border-l-4 border-l-green-500 border-r-4 border-r-green-500 animate-pulse shadow-lg shadow-green-200 dark:shadow-green-800/30' 
                              : ''
                          }`}
                          onClick={() => handleRowClick(student)}
                        >
                          <TableCell className="text-center font-mono text-sm">{student.id}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              {student.image_url ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={`relative group ${
                                        highlightedStudentId === student.id 
                                          ? 'ring-4 ring-green-400 ring-opacity-75' 
                                          : ''
                                      }`}>
                                        <img 
                                          src={student.image_url} 
                                          alt={student.student_name}
                                          className="w-12 h-12 rounded-full object-cover border-2 border-muted hover:border-primary hover:scale-110 transition-all duration-200 cursor-pointer"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Show larger image in a modal or tooltip
                                            window.open(student.image_url, '_blank');
                                          }}
                                        />
                                        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Eye className="w-2.5 h-2.5 text-white" />
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>انقر لعرض الصورة كاملة</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : null}
                              <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg cursor-pointer hover:bg-primary/20 transition-colors ${
                                student.image_url ? 'hidden' : ''
                              } ${
                                highlightedStudentId === student.id 
                                  ? 'ring-4 ring-green-400 ring-opacity-75' 
                                  : ''
                              }`}>
                                {student.student_name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          </TableCell>
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
                            <div className="flex items-center justify-center gap-2">
                              <Badge variant={student.approved ? "default" : "outline"} 
                                     className={student.approved ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}>
                                {student.approved ? "مقبول" : "قيد المراجعة"}
                              </Badge>
                              {student.enrollments && student.enrollments.length > 0 ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-xs text-green-600 font-medium">مسجل</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-center">
                                        <p className="font-medium">الطالب مسجل</p>
                                        <p className="text-xs text-muted-foreground">
                                          {student.enrollments.length} تسجيل
                                        </p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">غير مسجل</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>الطالب غير مسجل في أي فصل</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {/* Success indicator for highlighted students */}
                              {highlightedStudentId === student.id && (
                                <div className="flex items-center gap-1 animate-bounce">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span className="text-xs text-green-600 font-medium animate-pulse">
                                    تم التحديث
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                     
                          <TableCell className="text-center hidden sm:table-cell text-sm font-mono">
                            {(() => {
                              const totals = student.latest_academic_year_totals;
                              if (totals) {
                                const due = Number(totals.total_amount_required || 0);
                                const paid = Number(totals.total_amount_paid || 0);
                                return `${due.toLocaleString('en-US')} / ${paid.toLocaleString('en-US')}`;
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
            <div className="flex items-center gap-4 order-2 sm:order-1">
              <div className="text-sm text-muted-foreground">
                {pagination ? (
                  <>
                    عرض {pagination.from || 0}-{pagination.to || 0} من {pagination.total} طالب
                    {searchTerm || wishedSchoolFilter !== null || (dateFilterType && dateFilterType !== " ") || onlyEnrolled || onlyApproved || onlyNotEnrolled || onlyNotApproved ? (
                      <span className="text-primary font-medium"> (مفلتر)</span>
                    ) : null}
                  </>
                ) : (
                  `عرض ${students.length} طالب`
                )}
              </div>
              
              {/* Rows per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">عرض:</span>
                <Select value={rowsPerPage.toString()} onValueChange={(value) => {
                  setRowsPerPage(parseInt(value));
                  setPage(0); // Reset to first page when changing rows per page
                }}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="80">80</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">صف</span>
              </div>
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
          // Show success message
          enqueueSnackbar('تم تسجيل الطالب بنجاح!', { variant: 'success' });
          // Highlight the enrolled student
          if (studentForEnroll) {
            highlightStudent(studentForEnroll.id, 4000);
            refreshStudentData(studentForEnroll.id);
          }
        }}
      />

      {/* Student Actions Dialog */}
      <StudentActionsDialog
        open={actionsDialogOpen}
        onOpenChange={setActionsDialogOpen}
        selectedStudent={selectedStudent}
        onActionClick={handleActionClick}
      />
    </div>
  );
};

export default StudentList;