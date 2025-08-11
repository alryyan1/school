// src/pages/settings/UserList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    Plus, Edit, Trash2, Key, ArrowLeft, 
    AlertCircle, Search
} from 'lucide-react';

import { useUserStore } from '@/stores/userStore';
import UserFormDialog from '@/components/users/UserFormDialog';
import ChangePasswordDialog from '@/components/users/ChangePasswordDialog';
import { User } from '@/types/user';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/context/authcontext';
import { cn } from '@/lib/utils';

const UserList: React.FC = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { users, loading, error, lastPage, total, fetchUsers, deleteUser } = useUserStore();
    const { userId: currentUserId } = useAuth();

    // Local State
    const [currentPageState, setCurrentPageState] = useState(1);
    const [userFormOpen, setUserFormOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Effects
    useEffect(() => {
        fetchUsers(currentPageState);
    }, [currentPageState, fetchUsers]);

    // Handlers
    const handleOpenUserForm = (user?: User | null) => {
        setSelectedUser(user || null);
        setUserFormOpen(true);
    };

    const handleCloseUserForm = (refetch = false) => {
        setUserFormOpen(false);
        setSelectedUser(null);
        if (refetch) {
            fetchUsers(currentPageState);
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
                if (users.length === 1 && currentPageState > 1) {
                    setCurrentPageState(prev => prev - 1);
                } else {
                    fetchUsers(currentPageState);
                }
            } else {
                enqueueSnackbar(useUserStore.getState().error || 'فشل حذف المستخدم', { variant: 'error' });
            }
            handleCloseDeleteDialog();
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin': return 'destructive';
            case 'teacher': return 'default';
            case 'student': return 'secondary';
            case 'parent': return 'outline';
            default: return 'secondary';
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 ml-2" />
                        رجوع
                    </Button>
                    <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
                </div>
                <Button onClick={() => handleOpenUserForm()}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مستخدم
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4 space-x-reverse">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="البحث في المستخدمين..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 space-x-reverse p-4 border rounded-lg">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                            <Skeleton className="h-8 w-[100px]" />
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Users List */}
            {!loading && !error && (
                <div className="space-y-4">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد مستخدمين لعرضهم'}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredUsers.map((user) => {
                                const isCurrentUser = Number(currentUserId ?? -1) === Number(user.id);
                                return (
                                <div
                                    key={user.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 border rounded-lg transition-colors",
                                        isCurrentUser ? "bg-amber-50 border-amber-300" : "hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-center space-x-4 space-x-reverse">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-lg font-semibold text-primary">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{user.name}</h3>
                                                {isCurrentUser && (
                                                    <Badge variant="secondary" className="text-xs">أنت</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{user.username}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                            {user.role}
                                        </Badge>
                                        <div className="flex items-center space-x-1 space-x-reverse">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenUserForm(user)}
                                                title="تعديل المستخدم"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenChangePasswordDialog(user)}
                                                title="تغيير كلمة المرور"
                                            >
                                                <Key className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDeleteDialog(user)}
                                                className="text-destructive hover:text-destructive"
                                                title="حذف المستخدم"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );})}
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && total > 20 && (
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPageState(prev => Math.max(1, prev - 1))}
                        disabled={currentPageState === 1}
                    >
                        السابق
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        صفحة {currentPageState} من {lastPage}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPageState(prev => Math.min(lastPage, prev + 1))}
                        disabled={currentPageState === lastPage}
                    >
                        التالي
                    </Button>
                </div>
            )}

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
            <Dialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
                <DialogContent>
                    <DialogTitle>تأكيد الحذف</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        هل أنت متأكد من حذف المستخدم "{selectedUser?.name}"؟
                    </p>
                    <div className="flex justify-end space-x-2 space-x-reverse mt-4">
                        <Button variant="outline" onClick={handleCloseDeleteDialog}>
                            إلغاء
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            حذف
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserList;