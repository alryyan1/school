// src/pages/students/StudentList.tsx
import React, { useState, useEffect, useMemo } from "react"; // Added React
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
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel
} from "@/components/ui/select"; // shadcn Select
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Edit, Trash2, Eye, Plus, FileText, ChevronUp, ChevronDown, Mail, CalendarIcon, FilterX,
  BookCopy,
  Edit3, // Added FilterX
} from "lucide-react";
import { useStudentStore } from "@/stores/studentStore";
import { Gender, Student, EducationLevel } from "@/types/student"; // Import EducationLevel
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { webUrl } from "@/constants";
import dayjs, { Dayjs } from "dayjs"; // Import Dayjs type
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


const StudentList = () => {
  const {
    students, loading, error, fetchStudents, deleteStudent, updateStudent,
  } = useStudentStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting state
  const [orderBy, setOrderBy] = useState<keyof Student>("id");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [wishedLevelFilter, setWishedLevelFilter] = useState<EducationLevel>(EducationLevel.NotSpecified); // For Wished Level
  const [dateFilterType, setDateFilterType] = useState<"created_at" | "date_of_birth" | "">("");
  const [startDateFilter, setStartDateFilter] = useState<Dayjs | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Dayjs | null>(null);
 console.log(wishedLevelFilter,'wishedLevelFilter')
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id: number) => { /* ... same ... */ };
  const handlePrintList = () => { /* ... same ... */ };
  const handleSort = (property: keyof Student) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Enhanced Filtering Logic
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) =>
        // Search Term Filter
        Object.values(student).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .filter((student) =>{
        // Wished Level Filter
        if(wishedLevelFilter != EducationLevel.NotSpecified){
          
          return student.wished_level === wishedLevelFilter
        }
          return true
        
        
      })
      .filter((student) => {
        // Date Range Filter
        if (!dateFilterType || (!startDateFilter && !endDateFilter)) return true;

        const studentDate = student[dateFilterType] ? dayjs(student[dateFilterType]) : null;
        if (!studentDate) return false; // If date field is null, exclude

        const startMatch = startDateFilter ? studentDate.isAfter(startDateFilter.startOf('day').subtract(1, 'day')) : true; // >= start
        const endMatch = endDateFilter ? studentDate.isBefore(endDateFilter.endOf('day').add(1, 'day')) : true;       // <= end

        return startMatch && endMatch;
      });
  }, [students, searchTerm, wishedLevelFilter, dateFilterType, startDateFilter, endDateFilter]);


  const sortedStudents = useMemo(() => { // useMemo for sortedStudents
    return [...filteredStudents].sort((a, b) => { // Create a new array for sort
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue === undefined || aValue === null || bValue === undefined || bValue === null) {
        if (aValue === bValue) return 0; // both null/undefined
        if (aValue === null || aValue === undefined) return order === 'asc' ? -1 : 1; // nulls/undefined first or last
        if (bValue === null || bValue === undefined) return order === 'asc' ? 1 : -1;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }
       if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return order === "asc" ? (aValue === bValue ? 0 : aValue ? -1 : 1) : (aValue === bValue ? 0 : aValue ? 1 : -1);
      }

      // Handle date sorting for 'created_at' and 'date_of_birth'
      if (orderBy === 'created_at' || orderBy === 'date_of_birth') {
        const dateA = dayjs(aValue as string);
        const dateB = dayjs(bValue as string);
        if (!dateA.isValid() && !dateB.isValid()) return 0;
        if (!dateA.isValid()) return order === 'asc' ? -1 : 1;
        if (!dateB.isValid()) return order === 'asc' ? 1 : -1;
        return order === 'asc' ? dateA.diff(dateB) : dateB.diff(dateA);
      }


      return order === "asc"
        ? String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase(), 'ar') // Arabic locale compare
        : String(bValue).toLowerCase().localeCompare(String(aValue).toLowerCase(), 'ar');
    });
  }, [filteredStudents, order, orderBy]);


  const paginatedStudents = sortedStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

  function handleAccept(student: Student): void { /* ... same ... */ }

  const SortButton = ({ column, children }: { column: keyof Student; children: React.ReactNode }) => (
    <Button variant="ghost" onClick={() => handleSort(column)} className="h-auto p-0 font-medium hover:bg-transparent hover:text-primary">
      {children}
      {orderBy === column && (order === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
    </Button>
  );

  const resetFilters = () => {
    setSearchTerm("");
    setWishedLevelFilter(EducationLevel.NotSpecified);
    setDateFilterType("");
    setStartDateFilter(null);
    setEndDateFilter(null);
    setPage(0); // Reset to first page
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
            <CardTitle className="text-xl sm:text-2xl">قائمة الطلاب</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={() => navigate("/students/create")} size="sm" className="w-full sm:w-auto">
                <Plus className="ml-2 h-4 w-4" /> إضافة طالب
              </Button>
              <Button variant="outline" onClick={handlePrintList} size="sm" className="w-full sm:w-auto">
                <FileText className="ml-2 h-4 w-4" /> طباعة القائمة
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
            <Select value={wishedLevelFilter} onValueChange={(value) => {setWishedLevelFilter(value as EducationLevel); setPage(0);}}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="فلترة بالمرحلة..." />
              </SelectTrigger>
              <SelectContent>
                {Object.values(EducationLevel).map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-right font-normal", !startDateFilter && "text-muted-foreground")}>
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {startDateFilter ? dayjs(startDateFilter).format('DD/MM/YYYY') : <span>من تاريخ</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDateFilter?.toDate()} onSelect={(date) => {setStartDateFilter(date ? dayjs(date): null); setPage(0);}} initialFocus />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-right font-normal", !endDateFilter && "text-muted-foreground")}>
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {endDateFilter ? dayjs(endDateFilter).format('DD/MM/YYYY') : <span>إلى تاريخ</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDateFilter?.toDate()} onSelect={(date) => {setEndDateFilter(date ? dayjs(date): null); setPage(0);}} initialFocus />
              </PopoverContent>
            </Popover>
            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-6 flex justify-center lg:justify-end xl:justify-start">
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
                      <TableHead className="text-center hidden sm:table-cell"><SortButton column="wished_level">المستوى</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-24"><SortButton column="approved">الحالة</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-28"><SortButton column="date_of_birth">ت. الميلاد</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-28"><SortButton column="created_at">ت. التسجيل</SortButton></TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-16">طباعة</TableHead>
                      <TableHead className="text-center hidden sm:table-cell w-24">...</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          {searchTerm || wishedLevelFilter !== EducationLevel.NotSpecified || dateFilterType 
                            ? "لا توجد نتائج تطابق الفلاتر المحددة" 
                            : "لا توجد طلاب لعرضهم"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStudents.map((student) => (
                        <TableRow key={student.id} className="hover:bg-muted/50">
                          <TableCell className="text-center font-mono text-sm">{student.id}</TableCell>
                          <TableCell className="font-medium text-center">{student.student_name}</TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
                            <Badge variant={student.gender === Gender.Male ? "default" : "secondary"} 
                                   className={student.gender === Gender.Male ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"}>
                              {student.gender === Gender.Male ? "ذكر" : "أنثى"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell text-sm">{student.father_phone || '-'}</TableCell>
                          <TableCell className="text-center hidden sm:table-cell text-sm">{student.wished_level || '-'}</TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
                            <Badge variant={student.approved ? "default" : "outline"} 
                                   className={student.approved ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}>
                              {student.approved ? "مقبول" : "قيد المراجعة"}
                            </Badge>
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
                          <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => navigate(`/students/${student.id}`)}><Eye className="ml-2 h-4 w-4" /> عرض الملف</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => navigate(`/students/${student.id}/edit`)}><Edit3 className="ml-2 h-4 w-4" /> تعديل البيانات</DropdownMenuItem>
                                {/* --- NEW MENU ITEM --- */}
                                <DropdownMenuItem onSelect={() => navigate(`/students/${student.id}/exam-results`)}>
                                    <BookCopy className="ml-2 h-4 w-4" /> سجل الامتحانات والدرجات
                                </DropdownMenuItem>
                                {/* --------------------- */}
                                {!student.approved && (
                                    <DropdownMenuItem onSelect={() => handleAccept(student)}> {/* Assuming handleAccept exists */}
                                            <Mail className="ml-2 h-4 w-4 text-teal-500" /> قبول الطالب
                                </DropdownMenuItem>
                            )}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
              عرض {paginatedStudents.length > 0 ? page * rowsPerPage + 1 : 0}-
              {Math.min((page + 1) * rowsPerPage, filteredStudents.length)} من {filteredStudents.length}
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => setPage(0)} disabled={page === 0} className="hidden sm:inline-flex">
                الأولى
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}>
                السابق
              </Button>
              <span className="text-sm px-3 py-1 rounded-md border bg-muted">
                {page + 1} / {totalPages > 0 ? totalPages : 1}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
                التالي
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="hidden sm:inline-flex">
                الأخيرة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentList;