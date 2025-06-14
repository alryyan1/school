// src/pages/students/StudentList.tsx
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit,
  Trash2,
  Eye,
  Plus,
  FileText,
  ChevronUp,
  ChevronDown,
  Mail,
} from "lucide-react";
import { useStudentStore } from "@/stores/studentStore";
import { Gender, Student } from "@/types/student";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { webUrl } from "@/constants";
import dayjs from "dayjs";

const StudentList = () => {
  const {
    students,
    loading,
    error,
    fetchStudents,
    deleteStudent,
    updateStudent,
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

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id: number) => {
    try {
      await deleteStudent(id);
      enqueueSnackbar("تم حذف الطالب بنجاح", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("فشل في حذف الطالب", { variant: "error" });
    }
  };

  const handlePrintList = () => {
    let reportUrl = `${webUrl}reports/students/list-pdf`;
    const filters = new URLSearchParams();

    if (filters.toString()) {
      reportUrl += "?" + filters.toString();
    }

    window.open(reportUrl, "_blank");
  };

  const handleSort = (property: keyof Student) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredStudents = students.filter((student) =>
    Object.values(student).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedStudents = filteredStudents.sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue === undefined || bValue === undefined) return 0;

    if (typeof aValue == "number" && typeof bValue == "number") {
      return order == "asc" ? aValue - bValue : bValue - aValue;
    }

    if (order === "asc") {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  const paginatedStudents = sortedStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

  function handleAccept(student: Student): void {
    const result = confirm("تأكيد العمليه");
    if (result) {
      updateStudent(student.id, {
        ...student,
        approved: true,
        aproove_date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      });
    }
  }

  const SortButton = ({ column, children }: { column: keyof Student; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(column)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      {children}
      {orderBy === column && (
        order === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
      )}
    </Button>
  );

  if (loading) return (
    <div className="container mx-auto p-6" dir="rtl">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-6" dir="rtl">
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <CardTitle className="text-2xl">قائمة الطلاب</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
              <Button onClick={() => navigate("/students/create")}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة طالب جديد
              </Button>
              <Button variant="outline" onClick={handlePrintList}>
                <FileText className="ml-2 h-4 w-4" />
                طباعة قائمة الطلاب
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">
                    <SortButton column="id">الكود</SortButton>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortButton column="student_name">اسم الطالب</SortButton>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortButton column="gender">الجنس</SortButton>
                  </TableHead>
                  <TableHead className="text-center">رقم الهاتف</TableHead>
                  <TableHead className="text-center">المستوى</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">المرحلة</TableHead>
                  <TableHead className="text-center">طباعة الملف</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="text-center">{student.id}</TableCell>
                    <TableCell className="text-center">{student.student_name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={student.gender === Gender.Male ? "info" : "secondary"}>
                        {student.gender === Gender.Male ? "ذكر" : "أنثى"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{student.father_phone}</TableCell>
                    <TableCell className="text-center">{student.wished_level}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={student.approved ? "success" : "outline"}>
                        {student.approved ? "مقبول" : "قيد المراجعة"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{student.wished_level}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`${webUrl}students/${student.id}/pdf`} target="_blank" rel="noopener noreferrer">
                          PDF
                        </a>
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/students/${student.id}`)}
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>عرض</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/students/${student.id}/edit`)}
                              >
                                <Edit className="h-4 w-4 text-green-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>تعديل</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {student.aproove_date == null && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAccept(student)}
                                >
                                  <Mail className="h-4 w-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>قبول</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              عرض {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredStudents.length)} من {filteredStudents.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                السابق
              </Button>
              <span className="text-sm">
                صفحة {page + 1} من {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                التالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentList;
