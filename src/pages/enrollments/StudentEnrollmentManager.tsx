// src/pages/enrollments/StudentEnrollmentManager.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  SelectChangeEvent,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useSchoolStore } from "@/stores/schoolStore"; // Adjust path
import { useStudentEnrollmentStore } from "@/stores/studentEnrollmentStore"; // Adjust path
import EnrollmentFormDialog from "@/components/enrollments/EnrollmentFormDialog"; // Adjust path
import UpdateEnrollmentDialog from "@/components/enrollments/UpdateEnrollmentDialog"; // Adjust path
import {
  StudentAcademicYear,
  EnrollmentStatus,
} from "@/types/studentAcademicYear"; // Adjust path
import { GradeLevel } from "@/types/gradeLevel"; // Adjust path
import { useSnackbar } from "notistack";
import StudentFeePaymentList from "@/components/finances/StudentFeePaymentList";
import { SchoolApi } from "@/api/schoolApi";
import { useSettingsStore } from "@/stores/settingsStore";
import { ClearIcon } from "@mui/x-date-pickers";
import { SearchIcon } from "lucide-react";
import { formatNumber } from "@/constants";
import FeeInstallmentList from "@/components/finances/FeeInstallmentList";
import FeeInstallmentViewerDialog from "@/components/finances/FeeInstallmentViewerDialog";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Example icon for statement

// Helper to get status chip color
const getStatusColor = (
  status: EnrollmentStatus
): "success" | "info" | "warning" | "error" | "default" => {
  switch (status) {
    case "active":
      return "success";
    case "graduated":
      return "info";
    case "transferred":
      return "warning";
    case "withdrawn":
      return "error";
    default:
      return "default";
  }
};

const StudentEnrollmentManager: React.FC = () => {
  // --- Hooks ---
  const { enqueueSnackbar } = useSnackbar();

  // --- Component State ---
  const [selectedGradeId, setSelectedGradeId] = useState<number | "">("");
  const [enrollFormOpen, setEnrollFormOpen] = useState(false);
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statementDialogOpen, setStatementDialogOpen] = useState(false);
  const [selectedEnrollmentForStatement, setSelectedEnrollmentForStatement] =
    useState<StudentAcademicYear | null>(null);

  // --- NEW Search State ---
  const [searchTerm, setSearchTerm] = useState("");
  const { activeAcademicYear, activeSchoolId } = useSettingsStore.getState(); // Changed from activeAcademicYearId
  console.log(activeAcademicYear, "activeAcademicYear");
  const [currentEnrollment, setCurrentEnrollment] =
    useState<StudentAcademicYear | null>(null); // For Update/Delete
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | "">(
    activeSchoolId ?? ""
  );
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(
    activeAcademicYear ?? "2024/2025" // Default academic year as string
  );
  console.log(selectedAcademicYear, "selectedAcademicYear");
  
  // State for the list of grade levels available FOR THE SELECTED SCHOOL
  const [availableGradeLevels, setAvailableGradeLevels] = useState<
    GradeLevel[]
  >([]);
  const [loadingGradeLevels, setLoadingGradeLevels] = useState<boolean>(false); // Loading state for school-specific grades
  
  // --- Data from Stores ---
  const {
    schools,
    fetchSchools: fetchSchoolList,
    loading: schoolsLoading,
  } = useSchoolStore();
  
  const {
    enrollments,
    loading,
    error,
    fetchEnrollments,
    clearEnrollments,
    searchEnrollments,
    isSearchResult,
  } = useStudentEnrollmentStore();

  // --- Effects ---

  // Fetch initial dropdown data on mount
  useEffect(() => {
    fetchSchoolList();
  }, [fetchSchoolList]);
  
  // Fetch Grade Levels SPECIFIC TO THE SELECTED SCHOOL
  const fetchSchoolGrades = useCallback(
    async (schoolId: number) => {
      setLoadingGradeLevels(true);
      try {
        const response = await SchoolApi.getAssignedGradeLevels(schoolId);
        setAvailableGradeLevels(response.data.data); // Assuming response wraps in 'data'
      } catch (err) {
        console.error("Failed to fetch grade levels for school", err);
        enqueueSnackbar("فشل تحميل المراحل الدراسية لهذه المدرسة", {
          variant: "error",
        });
        setAvailableGradeLevels([]); // Clear on error
      } finally {
        setLoadingGradeLevels(false);
      }
    },
    [enqueueSnackbar]
  );
  
  // Fetch enrollments when primary filters (School, Year) change
  useEffect(() => {
    // If a search is active, don't fetch based on filters
    if (isSearchResult) return;

    if (selectedSchoolId && selectedAcademicYear) {
      fetchSchoolGrades(selectedSchoolId);
      fetchEnrollments({
        school_id: selectedSchoolId,
        academic_year: selectedAcademicYear, // Changed from academic_year_id
        grade_level_id: selectedGradeId || undefined,
      });
    } else {
      clearEnrollments();
    }
  }, [
    selectedSchoolId,
    selectedAcademicYear,
    selectedGradeId,
    fetchEnrollments,
    clearEnrollments,
    isSearchResult,
  ]);

  // --- Filtered/Memoized Data ---

  console.log(activeAcademicYear, "activeAcademicYear");
  // Filter Academic Years based on selected School
  const filteredAcademicYears = useMemo(() => {
    if (!selectedSchoolId) return [];
    return [activeAcademicYear]; // Assuming activeAcademicYear is the only year for a school
  }, [activeAcademicYear, selectedSchoolId]);
  console.log(filteredAcademicYears, "filteredAcademicYears");
  // Get the selected objects (needed for the Enroll Dialog)
  const selectedAcademicYearObj = useMemo(() => {
    return { id: activeAcademicYear, name: activeAcademicYear };
  }, [activeAcademicYear]);

  const selectedGradeLevelObj = useMemo(() => {
    return availableGradeLevels.find((gl) => gl.id === selectedGradeId) || null;
  }, [availableGradeLevels, selectedGradeId]);

  // --- Handlers ---
  const handleSchoolFilterChange = (event: SelectChangeEvent<number>) => {
    const newSchoolId = event.target.value as number | "";
    setSelectedSchoolId(newSchoolId);
    setSelectedAcademicYear("2024/2025"); // Reset year to default
    setSelectedGradeId(""); // Reset grade
  };

  const handleYearFilterChange = (event: SelectChangeEvent<string>) => { // Changed to string
    setSelectedAcademicYear(event.target.value as string);
    setSelectedGradeId(""); // Reset grade filter when year changes
  };

  const handleGradeFilterChange = (event: SelectChangeEvent<number>) => {
    setSelectedGradeId(event.target.value as number | "");
  };

  // Dialog Open/Close
  const handleOpenEnrollForm = () => setEnrollFormOpen(true);
  const handleCloseEnrollForm = () => setEnrollFormOpen(false);

  const handleOpenUpdateForm = (enrollment: StudentAcademicYear) => {
    setCurrentEnrollment(enrollment);
    setUpdateFormOpen(true);
  };
  const handleCloseUpdateForm = () => {
    setUpdateFormOpen(false);
    setCurrentEnrollment(null);
  };
  
  // --- NEW Search Handlers ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const executeSearch = () => {
    searchEnrollments(searchTerm); // Call store action
  };
  
  const clearSearch = () => {
    setSearchTerm("");
    // Clear results and fetch based on current filters
    clearEnrollments();
    if (selectedSchoolId && selectedAcademicYear) {
      fetchEnrollments({
        school_id: selectedSchoolId,
        academic_year: selectedAcademicYear, // Changed from academic_year_id
        grade_level_id: selectedGradeId || undefined,
      });
    }
  };
  
  const handleOpenStatementDialog = (enrollment: StudentAcademicYear) => {
    setSelectedEnrollmentForStatement(enrollment);
    setStatementDialogOpen(true);
  };
  
  const handleCloseStatementDialog = (refetch = false) => {
    setStatementDialogOpen(false);
    setSelectedEnrollmentForStatement(null);
    // Refetch enrollments if installments were potentially changed indirectly
    if (refetch && selectedSchoolId && selectedAcademicYear) {
      fetchEnrollments({
        school_id: selectedSchoolId,
        academic_year: selectedAcademicYear, // Changed from academic_year_id
        grade_level_id: selectedGradeId || undefined,
      });
    }
  };
  
  const handleOpenDeleteDialog = (enrollment: StudentAcademicYear) => {
    setCurrentEnrollment(enrollment);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setCurrentEnrollment(null);
    setDeleteDialogOpen(false);
  };

  // Delete Action
  // const handleDeleteConfirm = async () => {
  //   if (currentEnrollment) {
  //     const success = await deleteEnrollment(currentEnrollment.id);
  //     if (success) {
  //       enqueueSnackbar("تم حذف التسجيل بنجاح", { variant: "success" });
  //     } else {
  //       // Display specific error from store, fallback message if needed
  //       enqueueSnackbar(
  //         useStudentEnrollmentStore.getState().error || "فشل حذف التسجيل",
  //         { variant: "error" }
  //       );
  //     }
  //     handleCloseDeleteDialog();
  //   }
  // };

  // Find selected objects for passing to dialog
  //  const selectedAcademicYearObj = academicYears.find(ay => ay.id === selectedYearId) || null;
  //  const selectedGradeLevelObj = gradeLevels.find(gl => gl.id === selectedGradeId) || null;
  const [paymentListOpen, setPaymentListOpen] = useState(false);
  const [selectedEnrollmentForPayments, setSelectedEnrollmentForPayments] =
    useState<StudentAcademicYear | null>(null);

  // ... existing functions ...

  const handleOpenPaymentList = (enrollment: StudentAcademicYear) => {
    setSelectedEnrollmentForPayments(enrollment);
    setPaymentListOpen(true);
  };
  const handleClosePaymentList = () => {
    setPaymentListOpen(false);
    setSelectedEnrollmentForPayments(null);
  };
  console.log(activeAcademicYear, "activeAcademicYear");
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} dir="rtl">
      {/* Header & Filters Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap" // Allow wrapping on smaller screens
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{ flexShrink: 0, mb: { xs: 2, md: 0 } }}
          >
            إدارة تسجيل الطلاب السنوي
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="center"
          >
            {/* --- Search Input --- */}
            <TextField
              label="بحث بالاسم أو الرقم الوطني"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ minWidth: 200 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {searchTerm && (
                      <IconButton onClick={clearSearch} size="small" edge="end">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={executeSearch}
                      size="small"
                      edge="end"
                      color="primary"
                      disabled={!searchTerm}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm) executeSearch();
              }}
            />
            {/* School Filter */}
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel id="enroll-school-select-label">المدرسة *</InputLabel>
              <Select
                required
                labelId="enroll-school-select-label"
                label="المدرسة *"
                value={selectedSchoolId}
                onChange={handleSchoolFilterChange}
                disabled={schoolsLoading}
              >
                <MenuItem value="" disabled>
                  <em>اختر مدرسة...</em>
                </MenuItem>
                {schoolsLoading ? (
                  <MenuItem disabled>
                    <em>جاري التحميل...</em>
                  </MenuItem>
                ) : (
                  schools.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {/* Academic Year Filter */}
            <FormControl
              sx={{ minWidth: 180 }}
              size="small"
              disabled={!selectedSchoolId}
            >
              <InputLabel id="enroll-ay-select-label">
                العام الدراسي *
              </InputLabel>
              <Select
                required
                labelId="enroll-ay-select-label"
                label="العام الدراسي *"
                value={selectedAcademicYear}
                onChange={handleYearFilterChange}
              >
                <MenuItem value="" disabled>
                  <em>اختر عاماً...</em>
                </MenuItem>
                <MenuItem value="2024/2025">2024/2025</MenuItem>
                <MenuItem value="2023/2024">2023/2024</MenuItem>
                <MenuItem value="2022/2023">2022/2023</MenuItem>
              </Select>
            </FormControl>
            {/* Grade Level Filter (Uses school-specific grades) */}
            <FormControl
              sx={{ minWidth: 180 }}
              size="small"
              disabled={!selectedAcademicYear || loadingGradeLevels}
            >
              <InputLabel id="enroll-gl-select-label">
                المرحلة الدراسية
              </InputLabel>
              <Select
                labelId="enroll-gl-select-label"
                label="المرحلة الدراسية"
                value={selectedGradeId}
                onChange={handleGradeFilterChange}
              >
                <MenuItem value="">
                  <em>(جميع المراحل)</em>
                </MenuItem>
                {/* Use the new state 'availableGradeLevels' */}
                {loadingGradeLevels ? (
                  <MenuItem disabled>
                    <em>جاري التحميل...</em>
                  </MenuItem>
                ) : (
                  availableGradeLevels.map((gl) => (
                    <MenuItem key={gl.id} value={gl.id}>
                      {gl.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {/* Enroll Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="medium"
              onClick={handleOpenEnrollForm}
              disabled={
                !selectedSchoolId ||
                !selectedAcademicYear ||
                !selectedGradeId ||
                loadingGradeLevels
              } // Also disable if grades loading
              title={
                !selectedSchoolId || !selectedAcademicYear || !selectedGradeId
                  ? "الرجاء تحديد المدرسة والعام والمرحلة للإضافة"
                  : "تسجيل طالب جديد لهذه المجموعة"
              }
            >
              تسجيل طالب
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Loading / Error / Info Display */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {/* Search Results Indicator Alert */}
      {isSearchResult && !loading && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={clearSearch}>
          عرض نتائج البحث عن "{searchTerm}".{" "}
          <Button onClick={clearSearch} color="inherit" size="small">
            عرض الكل حسب الفلتر
          </Button>
        </Alert>
      )}

      {/* Enrollments Table */}
      {!loading && !error && selectedAcademicYear && selectedSchoolId && (
        <Paper elevation={2}>
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-label="student enrollments table"
            >
              <TableHead sx={{ bgcolor: "grey.100" }}>
                <TableRow>
                  <TableCell>الكود</TableCell>
                  <TableCell>اسم الطالب</TableCell>
                  <TableCell>المرحله الدراسيه</TableCell>
                  <TableCell>الرسوم </TableCell>
                  <TableCell>الفصل</TableCell>
                  <TableCell align="center">الحالة</TableCell>
                  <TableCell align="center">الدفعات</TableCell>
                  <TableCell align="right">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      لا يوجد طلاب مسجلون لهذه المرحلة في هذا العام.
                    </TableCell>
                  </TableRow>
                )}
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id} hover>
                    <TableCell>{enrollment.id}</TableCell>
                    <TableCell>
                      {enrollment.student?.student_name ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      {enrollment?.grade_level?.name || "-"}
                    </TableCell>
                    <TableCell>{formatNumber(enrollment.fees)}</TableCell>
                    <TableCell>
                      {enrollment.classroom?.name ?? (
                        <Box component="em" sx={{ color: "text.secondary" }}>
                          غير محدد
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={enrollment.status}
                        color={getStatusColor(enrollment.status)}
                        size="small"
                      />
                    </TableCell>
                    {/* Payments Button */}
                    <TableCell align="center">
                     
                      <Tooltip title="عرض/إدارة الأقساط والمدفوعات">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleOpenStatementDialog(enrollment)}
                          startIcon={<ReceiptLongIcon fontSize="small" />}
                        >
                          كشف حساب
                        </Button>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="تعديل الحالة/الفصل">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenUpdateForm(enrollment)}
                          >
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف التسجيل">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(enrollment)}
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* --- Dialogs --- */}
      {/* Render Enroll dialog only when selections are made */}
      {selectedGradeLevelObj && selectedAcademicYearObj && (
        <EnrollmentFormDialog
          open={enrollFormOpen}
          onOpenChange={handleCloseEnrollForm}
          onSuccess={() => {
            // Refetch enrollments after successful enrollment
            if (selectedSchoolId && selectedAcademicYear) {
              fetchEnrollments({
                school_id: selectedSchoolId,
                academic_year: selectedAcademicYear, // Changed from academic_year_id
                grade_level_id: selectedGradeId || undefined,
              });
            }
          }}
          selectedAcademicYear={selectedAcademicYearObj}
          selectedGradeLevel={selectedGradeLevelObj}
        />
      )}

      {/* Update Dialog */}
      <UpdateEnrollmentDialog
        open={updateFormOpen}
        onOpenChange={handleCloseUpdateForm}
        onSuccess={() => {
          // Refetch enrollments after successful update
          if (selectedSchoolId && selectedAcademicYear) {
            fetchEnrollments({
              school_id: selectedSchoolId,
              academic_year: selectedAcademicYear, // Changed from academic_year_id
              grade_level_id: selectedGradeId || undefined,
            });
          }
        }}
        enrollmentData={currentEnrollment}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        dir="rtl"
      >
        <DialogTitle>تأكيد حذف التسجيل</DialogTitle>
        <DialogContent>
          <DialogContentText>
            هل أنت متأكد من حذف تسجيل الطالب "
            {currentEnrollment?.student?.student_name ?? "..."}"
            <br />
            من العام الدراسي "{currentEnrollment?.academic_year?.name ?? "..."}"
            / الصف "{currentEnrollment?.grade_level?.name ?? "..."}"؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
          {/* <Button onClick={handleDeleteConfirm} color="error">
            تأكيد الحذف
          </Button> */}
        </DialogActions>
      </Dialog>
      {/* --- Dialogs --- */}
      {/* ... EnrollmentFormDialog, UpdateEnrollmentDialog, DeleteEnrollmentDialog ... */}

      {/* Payments Dialog */}
      <Dialog
        open={paymentListOpen}
        onClose={handleClosePaymentList}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          سجل دفعات الطالب:{" "}
          {selectedEnrollmentForPayments?.student?.student_name}
          <Typography variant="body2" color="text.secondary">
            للعام الدراسي: {selectedEnrollmentForPayments?.academic_year?.name}{" "}
            / الصف: {selectedEnrollmentForPayments?.grade_level?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {/* Render the Payment List component inside */}
          {selectedEnrollmentForPayments && (
            <FeeInstallmentList
              studentAcademicYearId={selectedEnrollmentForPayments.id as number}
              totalFeesAssigned={0}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentList}>إغلاق</Button>
        </DialogActions>
      </Dialog>
      <FeeInstallmentViewerDialog
        open={statementDialogOpen}
        onClose={handleCloseStatementDialog} // Use the correct close handler
        studentAcademicYearId={selectedEnrollmentForStatement?.id ?? null}
        studentName={selectedEnrollmentForStatement?.student?.student_name}
        academicYearName={selectedEnrollmentForStatement?.academic_year?.name}
        gradeLevelName={selectedEnrollmentForStatement?.grade_level?.name}
      />
    </Container>
  );
};

export default StudentEnrollmentManager;