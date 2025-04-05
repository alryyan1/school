// src/pages/teachers/TeacherList.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
    Avatar,
    Chip // For status
} from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams, GridActionsCellItem } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useTeacherStore } from '@/stores/teacherStore';
import { useSnackbar } from 'notistack';
import { Teacher } from '@/types/teacher'; // Import Teacher type
import { imagesUrl } from '@/constants';

const TeacherList: React.FC = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { teachers, loading, error, pagination, fetchTeachers, deleteTeacher } = useTeacherStore();
    const [page, setPage] = useState(0); // DataGrid uses 0-based page index
    const [pageSize, setPageSize] = useState(15); // Match backend pagination
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

    // Fetch data when page or pageSize changes
    useEffect(() => {
        fetchTeachers(page + 1); // API uses 1-based page index
    }, [page, fetchTeachers]); // removed pageSize dependency if backend controls it

    const handleOpenDeleteDialog = (teacher: Teacher) => {
        setTeacherToDelete(teacher);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setTeacherToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (teacherToDelete) {
            const success = await deleteTeacher(teacherToDelete.id);
            if (success) {
                enqueueSnackbar('تم حذف المدرس بنجاح', { variant: 'success' });
                // Optional: refetch current page if deletion affects counts significantly
                // fetchTeachers(page + 1);
            } else {
                // Error snackbar is likely shown by the store's error handling
                // enqueueSnackbar('فشل حذف المدرس', { variant: 'error' });
            }
            handleCloseDeleteDialog();
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'photo_path',
            headerName: 'الصورة',
            width: 80,
            renderCell: (params) => (
                <Avatar src={`${imagesUrl}${params.value}` || undefined} >
                    {/* Fallback initials or icon */}
                    {params.row.name ? params.row.name.charAt(0) : '?'}
                </Avatar>
            ),
            sortable: false,
            filterable: false,
        },
        { field: 'name', headerName: 'الاسم الكامل', width: 200 },
        { field: 'email', headerName: 'البريد الإلكتروني', width: 250 },
        { field: 'phone', headerName: 'رقم الهاتف', width: 150, sortable: false },
        { field: 'qualification', headerName: 'المؤهل', width: 180 },
        {
            field: 'is_active',
            headerName: 'الحالة',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'نشط' : 'غير نشط'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                 />
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'إجراءات',
            width: 150,
            cellClassName: 'actions',
            getActions: ({ id, row }) => {
                return [
                    <GridActionsCellItem
                        icon={<ViewIcon />}
                        label="عرض"
                        onClick={() => navigate(`/teachers/${id}`)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="تعديل"
                        onClick={() => navigate(`/teachers/${id}/edit`)}
                        color="primary"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="حذف"
                        onClick={() => handleOpenDeleteDialog(row)}
                        color="error"
                    />,
                ];
            },
        },
    ];

    if (error) {
        return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    قائمة المدرسين
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to="/teachers/create"
                >
                    إضافة مدرس جديد
                </Button>
            </Box>

            <Box sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={teachers}
                    columns={columns}
                    loading={loading}
                    paginationMode="server" // Server-side pagination
                    rowCount={pagination?.total || 0}
                    pageSizeOptions={[15]} // Match backend page size
                    paginationModel={{ page, pageSize }}
                    onPaginationModelChange={(model) => {
                        setPage(model.page);
                        // setPageSize(model.pageSize); // Only if backend supports variable size
                    }}
                    getRowId={(row) => row.id} // Specify the unique ID field
                    sx={{
                        // Optional styling
                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                           outline: 'none',
                        },
                        '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                            outline: 'none'
                        }
                    }}
                />
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        هل أنت متأكد من رغبتك في حذف المدرس "{teacherToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'حذف'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherList;