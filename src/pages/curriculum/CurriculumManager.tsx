// src/pages/curriculum/CurriculumManager.tsx
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
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useAcademicYearStore } from "@/stores/academicYearStore";
import { useSubjectStore } from "@/stores/subjectStore"; // To get available subjects
import { useTeacherStore } from "@/stores/teacherStore"; // To get available teachers
import { useAcademicYearSubjectStore } from "@/stores/academicYearSubjectStore";
import { AcademicYearSubject } from "@/types/academicYearSubject";
import { useSnackbar } from "notistack";
import { useSchoolStore } from "@/stores/schoolStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { SchoolApi } from "@/api/schoolApi";

const CurriculumManager: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  // --- Settings Store
  const { activeSchoolId,activeAcademicYearId } = useSettingsStore();
  // --- State for selections ---
  const [selectedYearId, setSelectedYearId] = useState<number | "">( activeAcademicYearId?? "");
  const [selectedGradeId, setSelectedGradeId] = useState<number | "">("");
  const [selectedSchool, setSelectedSchool] = useState<number | string>(
    activeSchoolId ?? ""
  );

  // --- Fetch data from stores ---
  const { academicYears, fetchAcademicYears } = useAcademicYearStore();
  //   const { gradeLevels, fetchGradeLevels } = useGradeLevelStore();
  const { subjects, fetchSubjects } = useSubjectStore(); // All subjects
  const { teachers, fetchTeachers: fetchAllTeachers } = useTeacherStore(); // All teachers
  const {
    assignments,
    loading,
    error,
    fetchAssignments,
    assignSubject,
    updateTeacherAssignment,
    unassignSubject,
    clearAssignments,
  } = useAcademicYearSubjectStore();
  const { fetchSchools, schools, loading: schoolIsLoading } = useSchoolStore();

  // --- State for Dialogs ---
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editTeacherDialogOpen, setEditTeacherDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] =
    useState<AcademicYearSubject | null>(null); // For edit/delete

  // --- State for Assign Dialog Form ---
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    null
  ); // Can be null
  const [assignedSchoolGradeLevels, setAssignedSchoolGradeLevels] = useState(
    []
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // --- Fetch initial lists ---
  useEffect(() => {
    fetchSchools();
    fetchAcademicYears();
    // fetchGradeLevels();
    fetchSubjects();
    fetchAllTeachers(); // Fetch all teachers for dropdowns
  }, [fetchAcademicYears, fetchSubjects, fetchAllTeachers]);

  const fetchSchoolGradeLevelsCallback = useCallback(async () => {
    try {
      const response = await SchoolApi.getAssignedGradeLevels(
        selectedSchool as number
      );
      console.log(response.data.data,'response')
      setAssignedSchoolGradeLevels(response.data.data);
    } catch (error) {
      console.log(error);
      enqueueSnackbar({
        variant: "error",
        message: "فشل في جلب مستويات المدرسه المحدده",
      });
    }
  }, [selectedSchool]);
  // --- Fetch assignments when year/grade changes ---
  useEffect(() => {
      fetchSchoolGradeLevelsCallback();
    if (selectedYearId && selectedGradeId) {
    
      fetchAssignments(selectedYearId, selectedGradeId);
    } else {
      clearAssignments(); // Clear if selection is incomplete
    }
  }, [selectedYearId, selectedGradeId, fetchAssignments, clearAssignments,fetchSchoolGradeLevelsCallback]);

  // --- Calculate available subjects for Assign Dialog ---
  const availableSubjects = useMemo(() => {
    const assignedSubjectIds = assignments.map((a) => a.subject_id);
    return subjects.filter((s) => !assignedSubjectIds.includes(s.id));
  }, [subjects, assignments]);

  // --- Dialog Open/Close Handlers ---
  const handleOpenAssignDialog = () => {
    setSelectedSubjectId(""); // Reset form state
    setSelectedTeacherId(null);
    setAssignError(null);
    setAssignDialogOpen(true);
  };
  const handleCloseAssignDialog = () => setAssignDialogOpen(false);

  const handleOpenEditTeacherDialog = (assignment: AcademicYearSubject) => {
    setCurrentAssignment(assignment);
    setSelectedTeacherId(assignment.teacher_id); // Pre-fill teacher
    setAssignError(null);
    setEditTeacherDialogOpen(true);
  };
  const handleCloseEditTeacherDialog = () => setEditTeacherDialogOpen(false);

  const handleOpenDeleteDialog = (assignment: AcademicYearSubject) => {
    setCurrentAssignment(assignment);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

  // --- Form Submission Handlers ---
  const handleAssignSubject = async () => {
    if (!selectedYearId || !selectedGradeId || !selectedSubjectId) {
      setAssignError("الرجاء تحديد العام والمرحلة والمادة.");
      return;
    }
    setAssignLoading(true);
    setAssignError(null);
    try {
      await assignSubject({
        academic_year_id: selectedYearId,
        grade_level_id: selectedGradeId,
        subject_id: selectedSubjectId,
        teacher_id: selectedTeacherId, // Send null if no teacher selected
      });
      enqueueSnackbar("تم تعيين المادة بنجاح", { variant: "success" });
      handleCloseAssignDialog();
    } catch (error: any) {
      setAssignError(error.message || "فشل تعيين المادة.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUpdateTeacher = async () => {
    if (!currentAssignment) return;
    setAssignLoading(true); // Reuse loading state
    setAssignError(null);
    try {
      await updateTeacherAssignment(currentAssignment.id, selectedTeacherId);
      enqueueSnackbar("تم تحديث المعلم بنجاح", { variant: "success" });
      handleCloseEditTeacherDialog();
    } catch (error: any) {
      setAssignError(error.message || "فشل تحديث المعلم.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (currentAssignment) {
      const success = await unassignSubject(currentAssignment.id);
      if (success) {
        enqueueSnackbar("تم إلغاء تعيين المادة بنجاح", { variant: "success" });
      } else {
        enqueueSnackbar(
          useAcademicYearSubjectStore.getState().error || "فشل إلغاء التعيين",
          { variant: "error" }
        );
      }
      handleCloseDeleteDialog();
    }
  };

  const filteredAcademicYearsMemo = useMemo(() => {
    return academicYears.filter((a) => a.school_id == selectedSchool);
  }, [academicYears, selectedSchool]);

  return (
    <Container style={{direction:'rtl'}} maxWidth="xl" sx={{ mt: 4, mb: 4, direction: "rtl" }}>
      {/* Header and Filters */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          إدارة المناهج الدراسية (المواد والمعلمين)
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" gap={1}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="ay-select-label">العام الدراسي</InputLabel>
            <Select
              labelId="ay-select-label"
              label="العام الدراسي"
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value as number)}
            >
              <MenuItem value="" disabled>
                <em>اختر عاماً...</em>
              </MenuItem>
              {filteredAcademicYearsMemo.map((ay) => (
                <MenuItem key={ay.id} value={ay.id}>
                  {ay.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: "200px" }}>
            <InputLabel id="school-label">المدرسه</InputLabel>
            <Select
              label="المدرسه"
              size="small"
              disabled={schoolIsLoading}
              labelId="school-label"
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
            >
              <MenuItem value="" disabled>
                <em>...اختر مدرسه</em>
              </MenuItem>
              {schools.map((school) => (
                <MenuItem key={school.id} value={school.id}>
                  {school.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="gl-select-label">المرحلة الدراسية</InputLabel>
            <Select
              labelId="gl-select-label"
              label="المرحلة الدراسية"
              value={selectedGradeId}
              onChange={(e) => setSelectedGradeId(e.target.value as number)}
            >
              <MenuItem value="" disabled>
                <em>اختر مرحلة...</em>
              </MenuItem>
              {assignedSchoolGradeLevels.map((gl) => (
                <MenuItem key={gl.id} value={gl.id}>
                  {gl.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAssignDialog}
            disabled={!selectedYearId || !selectedGradeId} // Enable only when year/grade selected
          >
            تعيين مادة
          </Button>
        </Stack>
      </Box>

      {/* Loading and Error States for Assignments */}
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
      {!loading && !selectedYearId && !selectedGradeId && (
        <Alert severity="info">
          الرجاء تحديد العام الدراسي والمرحلة لعرض المواد المعينة.
        </Alert>
      )}

      {/* Table of Assigned Subjects/Teachers */}
      {!loading && !error && selectedYearId && selectedGradeId && (
        <Paper elevation={2}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="assigned subjects table">
              <TableHead sx={{ bgcolor: "grey.100" }}>
                <TableRow>
                  <TableCell>المادة الدراسية</TableCell>
                  <TableCell>الرمز</TableCell>
                  <TableCell>المعلم المسؤول</TableCell>
                  <TableCell align="right">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      لا توجد مواد معينة لهذه المرحلة في هذا العام.
                    </TableCell>
                  </TableRow>
                )}
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id} hover>
                    <TableCell>{assignment.subject?.name ?? "N/A"}</TableCell>
                    <TableCell>{assignment.subject?.code ?? "N/A"}</TableCell>
                    <TableCell>
                      {assignment.teacher?.name ?? (
                        <Typography component="em" color="text.secondary">
                          غير محدد
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="تغيير المعلم">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              handleOpenEditTeacherDialog(assignment)
                            }
                          >
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="إلغاء تعيين المادة">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(assignment)}
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

      {/* Assign Subject Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={handleCloseAssignDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>تعيين مادة جديدة</DialogTitle>
        <DialogContent>
          {assignError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {assignError}
            </Alert>
          )}
          <Stack spacing={3} sx={{ pt: 1 }}>
            <FormControl fullWidth error={!selectedSubjectId && assignLoading}>
              {" "}
              {/* Basic validation indicator */}
              <InputLabel id="assign-subject-label">
                المادة الدراسية *
              </InputLabel>
              <Select
                labelId="assign-subject-label"
                label="المادة الدراسية *"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value as number)}
              >
                <MenuItem value="" disabled>
                  <em>اختر مادة...</em>
                </MenuItem>
                {availableSubjects.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              options={teachers}
              getOptionLabel={(option) => option.name}
              value={teachers.find((t) => t.id === selectedTeacherId) || null}
              onChange={(event, newValue) => {
                setSelectedTeacherId(newValue ? newValue.id : null);
              }}
              renderInput={(params) => (
                <TextField {...params} label="المعلم المسؤول (اختياري)" />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="لا يوجد معلمون"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseAssignDialog}
            color="inherit"
            disabled={assignLoading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleAssignSubject}
            variant="contained"
            color="primary"
            disabled={assignLoading || !selectedSubjectId}
          >
            {assignLoading ? <CircularProgress size={22} /> : "تعيين"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog
        open={editTeacherDialogOpen}
        onClose={handleCloseEditTeacherDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          تغيير المعلم للمادة "{currentAssignment?.subject?.name}"
        </DialogTitle>
        <DialogContent>
          {assignError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {assignError}
            </Alert>
          )}
          <Autocomplete
            sx={{ pt: 1 }} // Add some padding top
            options={teachers}
            getOptionLabel={(option) => option.name}
            value={teachers.find((t) => t.id === selectedTeacherId) || null} // Controlled component
            onChange={(event, newValue) => {
              setSelectedTeacherId(newValue ? newValue.id : null); // Update state on change
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="المعلم المسؤول (اتركه فارغاً لإلغاء التعيين)"
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="لا يوجد معلمون"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseEditTeacherDialog}
            color="inherit"
            disabled={assignLoading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleUpdateTeacher}
            variant="contained"
            color="primary"
            disabled={assignLoading}
          >
            {assignLoading ? <CircularProgress size={22} /> : "حفظ التغيير"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>تأكيد إلغاء التعيين</DialogTitle>
        <DialogContent>
          <DialogContentText>
            هل أنت متأكد من إلغاء تعيين المادة "
            {currentAssignment?.subject?.name}" من هذه المرحلة الدراسية لهذا
            العام؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            تأكيد الإلغاء
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CurriculumManager;
