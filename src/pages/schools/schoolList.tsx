// src/pages/schools/SchoolList.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Avatar
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import BusinessIcon from '@mui/icons-material/Business'; // Placeholder Icon
import { useSchoolStore } from '@/stores/schoolStore';
import { useSnackbar } from 'notistack';
import { School } from '@/types/school';

const SchoolList: React.FC = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { schools, loading, error, pagination, fetchSchools, deleteSchool } = useSchoolStore();
    const [page, setPage] = useState(0); // DataGrid 0-based index
    const [pageSize, setPageSize] = useState(15);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

    useEffect(() => {
        fetchSchools(page + 1); // API 1-based index
    }, [page, fetchSchools]);

    const handleOpenDeleteDialog = (school: School) => {
        setSchoolToDelete(school);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => { /* ... close dialog ... */ setSchoolToDelete(null); setDeleteDialogOpen(false);};
    const handleDeleteConfirm = async () => {
         if (schoolToDelete) {
             const success = await deleteSchool(schoolToDelete.id);
             if (success) enqueueSnackbar('تم حذف المدرسة بنجاح', { variant: 'success' });
             handleCloseDeleteDialog();
         }
     };

    const columns: GridColDef<School>[] = [ // Explicit type for row
        {
            field: 'logo_url', headerName: 'الشعار', width: 80, sortable: false, filterable: false,
            renderCell: (params) => (
                <Avatar src={params.value || undefined} variant="rounded">
                    <BusinessIcon /> {/* Placeholder */}
                </Avatar>
            )
        },
        { field: 'name', headerName: 'اسم المدرسة', width: 200 },
        { field: 'code', headerName: 'الرمز', width: 100 },
        { field: 'email', headerName: 'البريد الإلكتروني', width: 220 },
        { field: 'phone', headerName: 'الهاتف', width: 130, sortable: false },
        { field: 'principal_name', headerName: 'اسم المدير', width: 180 },
        // Add 'is_active' column if needed later
        {
            field: 'actions', type: 'actions', headerName: 'إجراءات', width: 150,
            getActions: ({ id, row }) => [
                <GridActionsCellItem icon={<ViewIcon />} label="عرض" onClick={() => navigate(`/schools/${id}`)} />,
                <GridActionsCellItem icon={<EditIcon />} label="تعديل" onClick={() => navigate(`/schools/${id}/edit`)} color="primary" />,
                <GridActionsCellItem icon={<DeleteIcon />} label="حذف" onClick={() => handleOpenDeleteDialog(row)} color="error" />,
            ],
        },
    ];

    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">قائمة المدارس</Typography>
                <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/schools/create">إضافة مدرسة</Button>
            </Box>
            {/* DataGrid */}
            <Box sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={schools} columns={columns} loading={loading}
                    paginationMode="server" rowCount={pagination?.total || 0}
                    pageSizeOptions={[15]} paginationModel={{ page, pageSize }}
                    onPaginationModelChange={(model) => setPage(model.page)}
                    getRowId={(row) => row.id}
                    sx={{ /* Optional styling */ }}
                />
            </Box>
            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent><DialogContentText>هل أنت متأكد من حذف المدرسة "{schoolToDelete?.name}"؟</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                    <Button onClick={handleDeleteConfirm} color="error" disabled={loading}>{loading ? <CircularProgress size={20}/> : 'حذف'}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SchoolList;