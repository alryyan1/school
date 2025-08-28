// src/pages/transport/TransportRouteList.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom"; // Added useNavigate
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  SelectChangeEvent,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as AssignStudentsIcon, // Icon for assigning students
} from "@mui/icons-material";
import { useSchoolStore } from "@/stores/schoolStore"; // Adjust path if needed
import { useTransportRouteStore } from "@/stores/transportRouteStore"; // Adjust path if needed
import TransportRouteFormDialog from "@/components/transport/TransportRouteFormDialog"; // Adjust path if needed
import AssignStudentDialog from "@/components/transport/AssignStudentDialog"; // Adjust path if needed
import { TransportRoute } from "@/types/transportRoute"; // Adjust path if needed
import { useSnackbar } from "notistack";
// Ensure you have a utility for formatting currency or remove its usage
// import { formatCurrency } from '@/utils/formatters';

// Example formatter if you don't have one
const formatCurrency = (amount: number | string | undefined | null) => {
  const num = parseFloat((amount as string) || "0");
  // Basic formatting, replace with your preferred library or method
  return num.toLocaleString("en-US", { style: "currency", currency: "USD" }); // Example USD
};

const TransportRouteList: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate(); // Added useNavigate

  // --- Local State ---
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | "">("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("2024/2025");
  const [routeFormOpen, setRouteFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRouteForAssignment, setSelectedRouteForAssignment] =
    useState<TransportRoute | null>(null);
  const [deleteRouteDialogOpen, setDeleteRouteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<TransportRoute | null>(
    null
  );

  // --- Available academic years
  const availableAcademicYears = [
    "2024/2025",
    "2023/2024", 
    "2022/2023",
    "2021/2022",
    "2020/2021"
  ];

  // --- Data from Stores ---
  const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
  // Ensure useTransportRouteStore exists and exports these items
  const { routes, loading, error, fetchRoutes, deleteRoute, clearRoutes } =
    useTransportRouteStore();

  // --- Effects ---
  // Fetch initial dropdown data
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Fetch routes when school changes
  useEffect(() => {
    if (selectedSchoolId) {
      fetchRoutes(selectedSchoolId);
    } else {
      clearRoutes(); // Clear routes if no school selected
    }
  }, [selectedSchoolId, fetchRoutes, clearRoutes]); // Added clearRoutes dependency

  // --- Handlers ---
  const handleSchoolChange = (event: SelectChangeEvent<number>) => {
    setSelectedSchoolId(event.target.value as number | "");
    setSelectedAcademicYear("2024/2025"); // Reset year when school changes
  };
  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedAcademicYear(event.target.value as string);
  };

  // Route Form Dialog
  const handleOpenRouteForm = (route?: TransportRoute) => {
    setEditingRoute(route || null);
    setRouteFormOpen(true);
  };
  // --- THIS IS THE MISSING HANDLER ---
  const handleCloseRouteForm = (refetch = false) => {
    setRouteFormOpen(false);
    setEditingRoute(null);
    if (refetch && selectedSchoolId) {
      fetchRoutes(selectedSchoolId); // Refetch if save was successful
    }
  };
  // ------------------------------------

  // Assign Students Dialog
  const handleOpenAssignDialog = (route: TransportRoute) => {
    if (!selectedAcademicYear) {
      enqueueSnackbar("الرجاء تحديد العام الدراسي أولاً.", {
        variant: "warning",
      });
      return;
    }
    setSelectedRouteForAssignment(route);
    setAssignDialogOpen(true);
  };
  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedRouteForAssignment(null);
    // Optionally refetch route list to update student count
    if (selectedSchoolId) fetchRoutes(selectedSchoolId);
  };

  // Delete Route Dialog & Action
  const handleOpenDeleteRouteDialog = (route: TransportRoute) => {
    setRouteToDelete(route);
    setDeleteRouteDialogOpen(true);
  };
  const handleCloseDeleteRouteDialog = () => {
    setRouteToDelete(null);
    setDeleteRouteDialogOpen(false);
  };
  const handleDeleteRouteConfirm = async () => {
    if (routeToDelete) {
      const success = await deleteRoute(routeToDelete.id);
      if (success) {
        enqueueSnackbar("تم حذف المسار بنجاح", { variant: "success" });
      } else {
        enqueueSnackbar(
          useTransportRouteStore.getState().error || "فشل حذف المسار",
          { variant: "error" }
        );
      }
      handleCloseDeleteRouteDialog();
    }
  };

  // Filter academic years based on selected school
  const filteredAcademicYears = React.useMemo(() => {
    if (!selectedSchoolId) return [];
    return availableAcademicYears.filter((ay) => ay.includes(selectedSchoolId.toString()));
  }, [availableAcademicYears, selectedSchoolId]);
  // --- Find the selected AcademicYear object ---
  const selectedAcademicYearObj = useMemo(() => {
    return availableAcademicYears.find((ay) => ay === selectedAcademicYear) || null;
  }, [availableAcademicYears, selectedAcademicYear]);

  // --- Render ---
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} dir="rtl">
      {/* Header & Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
        >
          <Typography variant="h5" component="h1">
            إدارة مسارات النقل
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="center"
          >
            {/* School Filter */}
            <FormControl sx={{ minWidth: 180 }} size="small" required>
              <InputLabel id="trans-school-filter-label">المدرسة *</InputLabel>
              <Select
                labelId="trans-school-filter-label"
                label="المدرسة *"
                value={selectedSchoolId}
                onChange={handleSchoolChange}
                disabled={schoolsLoading}
              >
                <MenuItem value="" disabled>
                  <em>اختر مدرسة...</em>
                </MenuItem>
                {schoolsLoading ? (
                  <MenuItem disabled>...</MenuItem>
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
              required
              disabled={!selectedSchoolId}
            >
              <InputLabel id="trans-year-filter-label">
                العام الدراسي *
              </InputLabel>
              <Select
                labelId="trans-year-filter-label"
                label="العام الدراسي *"
                value={selectedAcademicYear}
                onChange={handleYearChange}
              >
                <MenuItem value="" disabled>
                  <em>اختر عاماً...</em>
                </MenuItem>
                {filteredAcademicYears.map((ay) => (
                  <MenuItem key={ay} value={ay}>
                    {ay}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Add Route Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenRouteForm()}
              disabled={!selectedSchoolId}
              size="medium"
            >
              إضافة مسار
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Loading / Error / Info */}
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
      {!loading && !selectedSchoolId && (
        <Alert severity="info">الرجاء اختيار مدرسة لعرض مسارات النقل.</Alert>
      )}

      {/* Routes Table */}
      {!loading && !error && selectedSchoolId && (
        <Paper elevation={2} sx={{ overflow: "hidden" }}>
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-label="transport routes table"
              size="small"
            >
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>اسم المسار</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>السائق</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">
                    الرسوم
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    الطلاب المسجلون
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    الحالة
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">
                    إجراءات
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      لا توجد مسارات نقل لهذه المدرسة.
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map((route) => (
                    <TableRow key={route.id} hover>
                      <TableCell component="th" scope="row">
                        {route.name}
                      </TableCell>
                      <TableCell>
                        {route.driver?.name ?? (
                          <Box component="em" sx={{ color: "text.disabled" }}>
                            غير معين
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(route.fee_amount)}
                      </TableCell>
                      <TableCell align="center">
                        {route.student_assignments_count ?? 0}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={route.is_active ? "نشط" : "غير نشط"}
                          color={route.is_active ? "success" : "default"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="إدارة تسجيل الطلاب للمسار">
                            <span>
                              {" "}
                              {/* Tooltip requires a wrapping element when button is disabled */}
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleOpenAssignDialog(route)}
                                disabled={!selectedAcademicYear}
                              >
                                <AssignStudentsIcon fontSize="inherit" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="تعديل المسار">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenRouteForm(route)}
                            >
                              <EditIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف المسار">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteRouteDialog(route)}
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialogs */}
      <TransportRouteFormDialog
        open={routeFormOpen}
        onClose={handleCloseRouteForm} // <-- Use the correct handler
        initialData={editingRoute}
        schoolId={selectedSchoolId}
      />

      <AssignStudentDialog
        open={assignDialogOpen}
        onClose={handleCloseAssignDialog}
        route={selectedRouteForAssignment}
        academicYear={selectedAcademicYearObj}
      />

      {/* Delete Route Dialog */}
      <Dialog
        open={deleteRouteDialogOpen}
        onClose={handleCloseDeleteRouteDialog}
        dir="rtl"
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <DialogContentText>
            هل أنت متأكد من حذف المسار "{routeToDelete?.name}"؟
            <br />
            <Typography variant="caption" color="error">
              (تحذير: لا يمكن حذف المسار إذا كان هناك طلاب مسجلون به.)
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteRouteDialog}>إلغاء</Button>
          <Button onClick={handleDeleteRouteConfirm} color="error">
            تأكيد الحذف
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransportRouteList;
