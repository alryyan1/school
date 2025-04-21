// src/pages/students/StudentList.tsx
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  TextField,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { Edit, Delete, Visibility, Add, MarkAsUnread, AttachEmail } from "@mui/icons-material";
import { useStudentStore } from "@/stores/studentStore";
import { Gender, Student } from "@/types/student";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { webUrl } from "@/constants";
import dayjs from "dayjs";

const StudentList = () => {
  const { students, loading, error, fetchStudents, deleteStudent,updateStudent } =
    useStudentStore();
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
    console.log('renderede')
  const sortedStudents = filteredStudents.sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue === undefined || bValue === undefined) return 0;

    if(typeof aValue  == 'number' && typeof bValue =='number'){
       return order == 'asc' ? aValue - bValue : bValue - aValue;
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

  if (loading) return <Typography>جاري التحميل...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  function handleAccept(student:Student): void {
    console.log(student.aproove_date,'approve_Date',student)
   const result =  confirm('تأكيد العمليه')
   if(result){
        updateStudent(student.id,{
      ...student,
      approved:true,
      aproove_date:dayjs().format('YYYY-MM-DD HH:mm:ss')
    })
   }

  }

  return (
    <Box style={{ direction: "rtl" }} sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          label="بحث"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/students/create")}
        >
          إضافة طالب جديد
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell>

              <TableSortLabel
                active={orderBy === "id"}
                direction={orderBy === "id" ? order : "asc"}
                onClick={() => handleSort("id")}
              >
                الكود 
              </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "student_name"}
                  direction={orderBy === "student_name" ? order : "asc"}
                  onClick={() => handleSort("student_name")}
                >
                  اسم الطالب
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "gender"}
                  direction={orderBy === "gender" ? order : "asc"}
                  onClick={() => handleSort("gender")}
                >
                  الجنس
                </TableSortLabel>
              </TableCell>
              <TableCell>رقم الهاتف</TableCell>
              <TableCell>المستوى</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>المرحله </TableCell>
              <TableCell>طباعه الملف</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.student_name}</TableCell>
                <TableCell>
                  {student.gender === Gender.Male ? "ذكر" : "أنثى"}
                </TableCell>
                <TableCell>{student.father_phone}</TableCell>
                <TableCell>{student.wished_level}</TableCell>
                <TableCell>
                  {student.approved ? (
                    <Typography color="success.main">مقبول</Typography>
                  ) : (
                    <Typography color="warning.main">قيد المراجعة</Typography>
                  )}
                </TableCell>
                <TableCell>{student.wished_level}</TableCell>
                <TableCell>
                  <Button href={`${webUrl}students/${student.id}/pdf`}>
                    PDF
                  </Button>
                </TableCell>

                <TableCell>
                  <Tooltip title="عرض">
                    <IconButton
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <Visibility color="info" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="تعديل">
                    <IconButton
                      onClick={() => navigate(`/students/${student.id}/edit`)}
                    >
                      <Edit color="primary" />
                    </IconButton>
                  </Tooltip>
                  {student.aproove_date == null && <Tooltip title="قبول">
                    <IconButton onClick={() => handleAccept(student)}>
                      <AttachEmail color="success" />
                    </IconButton>
                  </Tooltip>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredStudents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="عدد الصفوف:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} من ${count}`
        }
      />
    </Box>
  );
};

export default StudentList;
