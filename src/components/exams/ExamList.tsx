// src/pages/exams/ExamList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton,
    Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Paper, Stack, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem, GridValueFormatterParams } from '@mui/x-data-grid'; // Import GridValueFormatterParams
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Assessment as ScheduleIcon // Icon for schedule page link
} from '@mui/icons-material';
import { useExamStore } from '@/stores/examStore';       // Adjust path if needed
import { useSchoolStore } from '@/stores/schoolStore';      // Adjust path if needed
import ExamFormDialog from '@/components/exams/ExamFormDialog'; // Adjust path if needed
import { Exam } from '@/types/exam';                     // Adjust path if needed
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs'; // For date formatting

const ExamList: React.FC = () => {
    // --- Hooks ---
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    // --- State ---
    const [formOpen, setFormOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
    const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<number | ''>('');

    // --- Data from Stores ---
    const { exams, loading, error, fetchExams, deleteExam } = useExamStore();
    const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();

    // --- Effects ---
    // Fetch schools for filter dropdown on mount
    useEffect(() => {
        fetchSchools();
    }, [fetchSchools]);

    // Fetch exams when school filter changes
    useEffect(() => {
        // Fetch exams based on filter (fetch all if filter is empty, or based on selection)
        fetchExams({ school_id: selectedSchoolFilter || undefined });
    }, [selectedSchoolFilter, fetchExams]);

    // --- Handlers ---
    const handleOpenForm = (exam?: Exam) => {
        setEditingExam(exam || null);
        setFormOpen(true);
    };
    const handleCloseForm = (refetch = false) => {
        setFormOpen(false);
        setEditingExam(null);
        if (refetch) {
            // Refetch exams for the currently selected school filter
            fetchExams({ school_id: selectedSchoolFilter || undefined });
        }
    };

    const handleOpenDeleteDialog = (exam: Exam) => {
        setExamToDelete(exam);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setExamToDelete(null);
        setDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        if (examToDelete) {
            const success = await deleteExam(examToDelete.id);
            if (success) {
                enqueueSnackbar('تم حذف دورة الامتحان بنجاح', { variant: 'success' });
            } else {
                // Show specific error from store (e.g., conflict error)
                enqueueSnackbar(useExamStore.getState().error || 'فشل حذف دورة الامتحان', { variant: 'error' });
            }
            handleCloseDeleteDialog();
        }
    };

     const handleSchoolFilterChange = (event: SelectChangeEvent<number>) => {
        setSelectedSchoolFilter(event.target.value as number | '');
    };

    // --- DataGrid Columns ---
    const columns: GridColDef<Exam>[] = [
        { field: 'id', headerName: 'المعرف', width: 70 },
        { field: 'name', headerName: 'اسم الدورة', width: 250 },
        {
            field: 'school.name',
            headerName: 'المدرسة',
            width: 200,
            // Use valueGetter to access nested property safely
            valueGetter: (params) => params?.row?.school?.name || '-',
        },
        {
            field: 'start_date',
            headerName: 'تاريخ البداية',
            width: 120,
            align:'center',
            headerAlign:'center',
            // Use valueFormatter for consistent date display
            valueFormatter: (params: GridValueFormatterParams<string>) =>
                params.value ? dayjs(params.value).format('YYYY/MM/DD') : '-',
        },
        {
            field: 'end_date',
            headerName: 'تاريخ النهاية',
            width: 120,
            align:'center',
            headerAlign:'center',
            valueFormatter: (params: GridValueFormatterParams<string>) =>
                params.value ? dayjs(params.value).format('YYYY/MM/DD') : '-',
        },
        {
            field: 'description',
            headerName: 'الوصف',
            flex: 1, // Take remaining space
            minWidth: 150,
            sortable: false,
            valueGetter: (params) => params?.value || '-',
        },
        {
            field: 'actions', type: 'actions', headerName: 'إجراءات', width: 150,
            getActions: ({ row }) => [
                 <GridActionsCellItem
                    icon={<Tooltip title="إدارة جدول الامتحانات"><ScheduleIcon /></Tooltip>}
                    label="الجدول"
                    onClick={() => navigate(`${row.id}/schedule`) } // Navigate to schedule page
                    color="info"
                />,
                 <GridActionsCellItem
                    icon={<Tooltip title="تعديل دورة الامتحان"><EditIcon /></Tooltip>}
                    label="تعديل"
                    onClick={() => handleOpenForm(row)}
                    color="primary"
                />,
                <GridActionsCellItem
                    icon={<Tooltip title="حذف دورة الامتحان"><DeleteIcon /></Tooltip>}
                    label="حذف"
                    onClick={() => handleOpenDeleteDialog(row)}
                    color="error"
                />,
            ],
        },
    ];

    // --- Render ---
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} dir="rtl">
            {/* Header Section */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                 >
                    <Typography variant="h5" component="h1">
                        دورات الامتحانات
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                          <FormControl sx={{ minWidth: 200 }} size="small">
                             <InputLabel id="exam-school-filter-label">تصفية حسب المدرسة</InputLabel>
                             <Select
                                labelId="exam-school-filter-label"
                                label="تصفية حسب المدرسة"
                                value={selectedSchoolFilter}
                                onChange={handleSchoolFilterChange}
                                disabled={schoolsLoading}
                             >
                                 <MenuItem value=""><em>(جميع المدارس)</em></MenuItem>
                                 {schoolsLoading ? <MenuItem disabled><em>جاري التحميل...</em></MenuItem> :
                                  schools.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                             </Select>
                          </FormControl>
                          <Button
                             variant="contained"
                             startIcon={<AddIcon />}
                             onClick={() => handleOpenForm()}
                             size="medium"
                          >
                             إضافة دورة امتحان
                          </Button>
                    </Stack>
                 </Stack>
            </Paper>

            {/* Loading and Error Display */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
            {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* DataGrid */}
            {!loading && !error && (
                <Paper elevation={2} sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={exams}
                        columns={columns}
                        loading={loading} // Use internal loading state of DataGrid
                        getRowId={(row) => row.id}
                        // Pagination settings (client-side if not many exams)
                        initialState={{
                             pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        pageSizeOptions={[10, 25, 50]}
                        autoHeight={false} // Set explicit height on container instead
                        sx={{
                            // Remove focus outline for cleaner look
                            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
                            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' }
                        }}
                    />
                </Paper>
            )}

            {/* Form Dialog (for Create/Edit Exam Period) */}
            <ExamFormDialog
                open={formOpen}
                onClose={handleCloseForm}
                initialData={editingExam}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} dir="rtl">
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        هل أنت متأكد من حذف دورة الامتحان "{examToDelete?.name}"؟
                        <br/>
                        <Typography variant="caption" color="error">
                            (تحذير: قد يؤدي حذف الدورة إلى حذف الجداول والنتائج المرتبطة بها إذا لم يتم منع ذلك في الخلفية)
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                    <Button onClick={handleDeleteConfirm} color="error">حذف</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default ExamList;