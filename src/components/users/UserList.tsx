// src/pages/settings/UserList.tsx (or pages/users/UserList.tsx)
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Use alias if needed
import {
    Box, Button, Container, Typography, CircularProgress, Alert, IconButton,
    Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Paper, Chip, Stack, // Keep Stack if using it elsewhere
    Pagination // For DataGrid pagination
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem, GridPaginationModel } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, LockReset as PasswordIcon } from '@mui/icons-material';
import { useUserStore } from '@/stores/userStore'; // Adjust path
import UserFormDialog from '@/components/users/UserFormDialog'; // Adjust path
import ChangePasswordDialog from '@/components/users/ChangePasswordDialog'; // Adjust path
import { User } from '@/types/user'; // Adjust path
import { useSnackbar } from 'notistack';

const UserList: React.FC = () => {
    const navigate = useNavigate(); // If needed elsewhere
    const { enqueueSnackbar } = useSnackbar();
    const { users, loading, error, currentPage, lastPage, total, fetchUsers, deleteUser } = useUserStore();

    // --- Local State ---
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 }); // pageSize matching controller default?
    const [userFormOpen, setUserFormOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null); // For Edit/Delete/Password Change

    // --- Effects ---
    // Fetch users when pagination changes
    useEffect(() => {
        // DataGrid page is 0-based, API is 1-based
        fetchUsers(paginationModel.page + 1 /*, Add filters here if needed */);
    }, [paginationModel.page, fetchUsers]);

    // --- Handlers ---
    const handleOpenUserForm = (user?: User | null) => {
        setSelectedUser(user || null);
        setUserFormOpen(true);
    };
    const handleCloseUserForm = (refetch = false) => {
        setUserFormOpen(false);
        setSelectedUser(null);
        if (refetch) {
            fetchUsers(paginationModel.page + 1); // Refetch current page
        }
    };

    const handleOpenChangePasswordDialog = (user: User) => {
        setSelectedUser(user);
        setChangePasswordOpen(true);
    };
    const handleCloseChangePasswordDialog = () => {
        setChangePasswordOpen(false);
        setSelectedUser(null);
    };

    const handleOpenDeleteDialog = (user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setSelectedUser(null);
        setDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        if (selectedUser) {
            const success = await deleteUser(selectedUser.id);
            if (success) {
                enqueueSnackbar('تم حذف المستخدم بنجاح', { variant: 'success' });
                 // Refetch might be needed if total count changes affects current page display
                 if (users.length === 1 && paginationModel.page > 0) {
                     setPaginationModel(prev => ({...prev, page: prev.page - 1}));
                 } else {
                      fetchUsers(paginationModel.page + 1);
                 }
            } else {
                enqueueSnackbar(useUserStore.getState().error || 'فشل حذف المستخدم', { variant: 'error' });
            }
            handleCloseDeleteDialog();
        }
    };

    // --- DataGrid Columns ---
    const columns: GridColDef<User>[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'الاسم الكامل', width: 200 },
        { field: 'username', headerName: 'اسم المستخدم', width: 150 },
        { field: 'email', headerName: 'البريد الإلكتروني', width: 220 },
        { field: 'role', headerName: 'الدور', width: 100, renderCell:(params)=> <Chip label={params.value} size="small"/> },
        { field: 'phone', headerName: 'الهاتف', width: 130, sortable: false, valueGetter: (params) => params?.value || '-' },
        { field: 'gender', headerName: 'الجنس', width: 80, sortable: false, valueGetter: (params) => params?.value || '-' },
        {
            field: 'actions', type: 'actions', headerName: 'إجراءات', width: 150,
            getActions: ({ row }) => [
                 <GridActionsCellItem
                    icon={<Tooltip title="تعديل بيانات المستخدم"><EditIcon /></Tooltip>}
                    label="تعديل"
                    onClick={() => handleOpenUserForm(row)}
                    color="primary"
                />,
                 <GridActionsCellItem
                    icon={<Tooltip title="تغيير كلمة المرور"><PasswordIcon /></Tooltip>}
                    label="كلمة المرور"
                    onClick={() => handleOpenChangePasswordDialog(row)}
                    color="secondary"
                />,
                <GridActionsCellItem
                    icon={<Tooltip title="حذف المستخدم"><DeleteIcon /></Tooltip>}
                    label="حذف"
                    onClick={() => handleOpenDeleteDialog(row)}
                    color="error"
                />,
            ],
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} dir="rtl">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">إدارة المستخدمين</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenUserForm()}>
                    إضافة مستخدم
                </Button>
            </Box>

            {/* Loading/Error */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* DataGrid */}
            <Paper elevation={2} sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    loading={loading}
                    rowCount={total} // Total rows from API
                    pageSizeOptions={[20]} // Match backend pagination limit
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    paginationMode="server" // Tell DataGrid pagination is handled server-side
                    getRowId={(row) => row.id}
                    sx={{
                        // Remove focus outline styles for better visual
                         '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
                         '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' }
                    }}
                />
            </Paper>

            {/* Dialogs */}
            <UserFormDialog
                open={userFormOpen}
                onClose={handleCloseUserForm}
                initialData={selectedUser}
            />
             <ChangePasswordDialog
                open={changePasswordOpen}
                onClose={handleCloseChangePasswordDialog}
                user={selectedUser}
             />
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} dir="rtl">
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent><DialogContentText>هل أنت متأكد من حذف المستخدم "{selectedUser?.name}"?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>إلغاء</Button>
                    <Button onClick={handleDeleteConfirm} color="error">حذف</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default UserList;