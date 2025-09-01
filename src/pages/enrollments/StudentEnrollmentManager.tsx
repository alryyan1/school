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
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useSchoolStore } from "@/stores/schoolStore";
import { useStudentEnrollmentStore } from "@/stores/studentEnrollmentStore";
import EnrollmentFormDialog from "@/components/enrollments/EnrollmentFormDialog";
import UpdateEnrollmentDialog from "@/components/enrollments/UpdateEnrollmentDialog";
import {
  Enrollment,
  EnrollmentStatus,
} from "@/types/enrollment";
import { GradeLevel } from "@/types/gradeLevel";
import { useSnackbar } from "notistack";
import { SchoolApi } from "@/api/schoolApi";
// Removed useSettingsStore import
import { ClearIcon } from "@mui/x-date-pickers";
import { SearchIcon } from "lucide-react";
import { formatNumber } from "@/constants";
import FeeInstallmentViewerDialog from "@/components/finances/FeeInstallmentViewerDialog";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

// Types
interface FilterState {
  selectedSchoolId: number | "";
  selectedAcademicYear: string;
  selectedGradeId: number | "";
  searchTerm: string;
}

interface DialogState {
  enrollFormOpen: boolean;
  updateFormOpen: boolean;
  deleteDialogOpen: boolean;
  statementDialogOpen: boolean;
}

// Helper functions
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

// Custom hook for managing filters
const useEnrollmentFilters = () => {
  // Removed useSettingsStore - implement your preferred state management
  
  const [filters, setFilters] = useState<FilterState>({
    selectedSchoolId: activeSchoolId ?? "",
    selectedAcademicYear: activeAcademicYear ?? "2024/2025",
    selectedGradeId: "",
    searchTerm: "",
  });

  const updateFilter = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      selectedSchoolId: activeSchoolId ?? "",
      selectedAcademicYear: activeAcademicYear ?? "2024/2025",
      selectedGradeId: "",
      searchTerm: "",
    });
  };

  return { filters, updateFilter, resetFilters };
};

// Custom hook for managing dialogs
const useEnrollmentDialogs = () => {
  const [dialogs, setDialogs] = useState<DialogState>({
    enrollFormOpen: false,
    updateFormOpen: false,
    deleteDialogOpen: false,
    statementDialogOpen: false,
  });

  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  const openDialog = (dialogKey: keyof DialogState, enrollment?: Enrollment) => {
    setDialogs(prev => ({ ...prev, [dialogKey]: true }));
    if (enrollment) setSelectedEnrollment(enrollment);
  };

  const closeDialog = (dialogKey: keyof DialogState) => {
    setDialogs(prev => ({ ...prev, [dialogKey]: false }));
    if (dialogKey !== 'enrollFormOpen') setSelectedEnrollment(null);
  };

  return { dialogs, selectedEnrollment, openDialog, closeDialog };
};

// Custom hook for grade levels
const useGradeLevels = (schoolId: number | "") => {
  const [availableGradeLevels, setAvailableGradeLevels] = useState<GradeLevel[]>([]);
  const [loadingGradeLevels, setLoadingGradeLevels] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchSchoolGrades = useCallback(async (schoolId: number) => {
    setLoadingGradeLevels(true);
    try {
      const response = await SchoolApi.getAssignedGradeLevels(schoolId);
      setAvailableGradeLevels(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch grade levels for school", err);
      enqueueSnackbar("فشل تحميل المراحل الدراسية لهذه المدرسة", {
        variant: "error",
      });
      setAvailableGradeLevels([]);
    } finally {
      setLoadingGradeLevels(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (schoolId) {
      fetchSchoolGrades(schoolId);
    } else {
      setAvailableGradeLevels([]);
    }
  }, [schoolId, fetchSchoolGrades]);

  return { availableGradeLevels, loadingGradeLevels };
};

// Search Component
const SearchBar: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}> = ({ searchTerm, onSearchChange, onSearch, onClear }) => (
  <TextField
    label="بحث بالاسم أو الرقم الوطني"
    variant="outlined"
    size="small"
    value={searchTerm}
    onChange={(e) => onSearchChange(e.target.value)}
    sx={{ minWidth: 200 }}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          {searchTerm && (
            <IconButton onClick={onClear} size="small" edge="end">
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            onClick={onSearch}
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
      if (e.key === "Enter" && searchTerm) onSearch();
    }}
  />
);

// Filter Controls Component
const FilterControls: React.FC<{
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | number) => void;
  schools: Array<{ id: number; name: string }>;
  schoolsLoading: boolean;
  availableGradeLevels: GradeLevel[];
  loadingGradeLevels: boolean;
  onEnrollClick: () => void;
}> = ({ 
  filters, 
  onFilterChange, 
  schools, 
  schoolsLoading, 
  availableGradeLevels, 
  loadingGradeLevels,
  onEnrollClick 
}) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={1.5}
    alignItems="center"
  >
    {/* School Filter */}
    <FormControl sx={{ minWidth: 180 }} size="small">
      <InputLabel id="enroll-school-select-label">المدرسة *</InputLabel>
      <Select
        required
        labelId="enroll-school-select-label"
        label="المدرسة *"
        value={filters.selectedSchoolId}
        onChange={(e) => {
          const newSchoolId = e.target.value as number | "";
          onFilterChange('selectedSchoolId', newSchoolId);
          onFilterChange('selectedAcademicYear', "2024/2025");
          onFilterChange('selectedGradeId', "");
        }}
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
      disabled={!filters.selectedSchoolId}
    >
      <InputLabel id="enroll-ay-select-label">العام الدراسي *</InputLabel>
      <Select
        required
        labelId="enroll-ay-select-label"
        label="العام الدراسي *"
        value={filters.selectedAcademicYear}
        onChange={(e) => {
          onFilterChange('selectedAcademicYear', e.target.value);
          onFilterChange('selectedGradeId', "");
        }}
      >
        <MenuItem value="" disabled>
          <em>اختر عاماً...</em>
        </MenuItem>
        <MenuItem value="2024/2025">2024/2025</MenuItem>
        <MenuItem value="2023/2024">2023/2024</MenuItem>
        <MenuItem value="2022/2023">2022/2023</MenuItem>
      </Select>
    </FormControl>

    {/* Grade Level Filter */}
    <FormControl
      sx={{ minWidth: 180 }}
      size="small"
      disabled={!filters.selectedAcademicYear || loadingGradeLevels}
    >
      <InputLabel id="enroll-gl-select-label">المرحلة الدراسية</InputLabel>
      <Select
        labelId="enroll-gl-select-label"
        label="المرحلة الدراسية"
        value={filters.selectedGradeId}
        onChange={(e) => onFilterChange('selectedGradeId', e.target.value)}
      >
        <MenuItem value="">
          <em>(جميع المراحل)</em>
        </MenuItem>
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
      onClick={onEnrollClick}
      disabled={
        !filters.selectedSchoolId ||
        !filters.selectedAcademicYear ||
        !filters.selectedGradeId ||
        loadingGradeLevels
      }
      title={
        !filters.selectedSchoolId || !filters.selectedAcademicYear || !filters.selectedGradeId
          ? "الرجاء تحديد المدرسة والعام والمرحلة للإضافة"
          : "تسجيل طالب جديد لهذه المجموعة"
      }
    >
      تسجيل طالب
    </Button>
  </Stack>
);

// Enrollment Table Component
const EnrollmentTable: React.FC<{
  enrollments: Enrollment[];
  onEdit: (enrollment: Enrollment) => void;
  onDelete: (enrollment: Enrollment) => void;
  onViewStatement: (enrollment: Enrollment) => void;
}> = ({ enrollments, onEdit, onDelete, onViewStatement }) => (
  <Paper elevation={2}>
    <TableContainer>
      <Table sx={{ minWidth: 750 }} aria-label="student enrollments table">
        <TableHead sx={{ bgcolor: "grey.100" }}>
          <TableRow>
            <TableCell>الكود</TableCell>
            <TableCell>اسم الطالب</TableCell>
            <TableCell>المرحله الدراسيه</TableCell>
            <TableCell>الرسوم</TableCell>
            <TableCell>الفصل</TableCell>
            <TableCell align="center">الحالة</TableCell>
            <TableCell align="center">الدفعات</TableCell>
            <TableCell align="right">إجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {enrollments.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
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
              <TableCell align="center">
                <Tooltip title="عرض/إدارة الأقساط والمدفوعات">
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => onViewStatement(enrollment)}
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
                      onClick={() => onEdit(enrollment)}
                    >
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="حذف التسجيل">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(enrollment)}
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
);

// Main Component
const StudentEnrollmentManager: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Custom hooks
  const { filters, updateFilter, resetFilters } = useEnrollmentFilters();
  const { dialogs, selectedEnrollment, openDialog, closeDialog } = useEnrollmentDialogs();
  const { availableGradeLevels, loadingGradeLevels } = useGradeLevels(filters.selectedSchoolId);

  // Store hooks
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

  // Memoized values
  const selectedAcademicYearObj = useMemo(() => ({
    id: filters.selectedAcademicYear,
    name: filters.selectedAcademicYear
  }), [filters.selectedAcademicYear]);

  const selectedGradeLevelObj = useMemo(() => 
    availableGradeLevels.find((gl) => gl.id === filters.selectedGradeId) || null,
    [availableGradeLevels, filters.selectedGradeId]
  );

  // Effects
  useEffect(() => {
    fetchSchoolList();
  }, [fetchSchoolList]);

  useEffect(() => {
    if (isSearchResult) return;

    if (filters.selectedSchoolId && filters.selectedAcademicYear) {
      fetchEnrollments({
        school_id: filters.selectedSchoolId,
        academic_year: filters.selectedAcademicYear,
        grade_level_id: filters.selectedGradeId || undefined,
      });
    } else {
      clearEnrollments();
    }
  }, [
    filters.selectedSchoolId,
    filters.selectedAcademicYear,
    filters.selectedGradeId,
    fetchEnrollments,
    clearEnrollments,
    isSearchResult,
  ]);

  // Handlers
  const handleSearch = () => {
    searchEnrollments(filters.searchTerm);
  };

  const handleClearSearch = () => {
    updateFilter('searchTerm', '');
    clearEnrollments();
    if (filters.selectedSchoolId && filters.selectedAcademicYear) {
      fetchEnrollments({
        school_id: filters.selectedSchoolId,
        academic_year: filters.selectedAcademicYear,
        grade_level_id: filters.selectedGradeId || undefined,
      });
    }
  };

  const handleEnrollSuccess = () => {
    closeDialog('enrollFormOpen');
    if (filters.selectedSchoolId && filters.selectedAcademicYear) {
      fetchEnrollments({
        school_id: filters.selectedSchoolId,
        academic_year: filters.selectedAcademicYear,
        grade_level_id: filters.selectedGradeId || undefined,
      });
    }
  };

  const handleUpdateSuccess = () => {
    closeDialog('updateFormOpen');
    if (filters.selectedSchoolId && filters.selectedAcademicYear) {
      fetchEnrollments({
        school_id: filters.selectedSchoolId,
        academic_year: filters.selectedAcademicYear,
        grade_level_id: filters.selectedGradeId || undefined,
      });
    }
  };

  const handleStatementClose = (refetch = false) => {
    closeDialog('statementDialogOpen');
    if (refetch && filters.selectedSchoolId && filters.selectedAcademicYear) {
      fetchEnrollments({
        school_id: filters.selectedSchoolId,
        academic_year: filters.selectedAcademicYear,
        grade_level_id: filters.selectedGradeId || undefined,
      });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} dir="rtl">
      {/* Header & Filters Section */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
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
            <SearchBar
              searchTerm={filters.searchTerm}
              onSearchChange={(value) => updateFilter('searchTerm', value)}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
            
            <FilterControls
              filters={filters}
              onFilterChange={updateFilter}
              schools={schools}
              schoolsLoading={schoolsLoading}
              availableGradeLevels={availableGradeLevels}
              loadingGradeLevels={loadingGradeLevels}
              onEnrollClick={() => openDialog('enrollFormOpen')}
            />
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
      
      {isSearchResult && !loading && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={handleClearSearch}>
          عرض نتائج البحث عن "{filters.searchTerm}".{" "}
          <Button onClick={handleClearSearch} color="inherit" size="small">
            عرض الكل حسب الفلتر
          </Button>
        </Alert>
      )}

      {/* Enrollments Table */}
      {!loading && !error && filters.selectedAcademicYear && filters.selectedSchoolId && (
        <EnrollmentTable
          enrollments={enrollments}
          onEdit={(enrollment) => openDialog('updateFormOpen', enrollment)}
          onDelete={(enrollment) => openDialog('deleteDialogOpen', enrollment)}
          onViewStatement={(enrollment) => openDialog('statementDialogOpen', enrollment)}
        />
      )}

      {/* Dialogs */}
      {selectedGradeLevelObj && selectedAcademicYearObj && (
        <EnrollmentFormDialog
          open={dialogs.enrollFormOpen}
          onOpenChange={() => closeDialog('enrollFormOpen')}
          onSuccess={handleEnrollSuccess}
          selectedAcademicYear={selectedAcademicYearObj}
          selectedGradeLevel={selectedGradeLevelObj}
        />
      )}

      <UpdateEnrollmentDialog
        open={dialogs.updateFormOpen}
        onOpenChange={() => closeDialog('updateFormOpen')}
        onSuccess={handleUpdateSuccess}
        enrollmentData={selectedEnrollment}
      />

      <Dialog
        open={dialogs.deleteDialogOpen}
        onClose={() => closeDialog('deleteDialogOpen')}
        dir="rtl"
      >
        <DialogTitle>تأكيد حذف التسجيل</DialogTitle>
        <DialogContent>
          <DialogContentText>
            هل أنت متأكد من حذف تسجيل الطالب "
            {selectedEnrollment?.student?.student_name ?? "..."}"
            <br />
            من العام الدراسي "{selectedEnrollment?.academic_year?.name ?? "..."}"
            / الصف "{selectedEnrollment?.grade_level?.name ?? "..."}"؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('deleteDialogOpen')}>إلغاء</Button>
        </DialogActions>
      </Dialog>

      <FeeInstallmentViewerDialog
        open={dialogs.statementDialogOpen}
        onClose={handleStatementClose}
        studentAcademicYearId={selectedEnrollment?.id ?? null}
        studentName={selectedEnrollment?.student?.student_name}
        academicYearName={selectedEnrollment?.academic_year?.name}
        gradeLevelName={selectedEnrollment?.grade_level?.name}
      />
    </Container>
  );
};

export default StudentEnrollmentManager;