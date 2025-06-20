// src/pages/settings/RolePermissionManager.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// shadcn/ui & lucide imports
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog as ShadcnDialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, Edit3, Trash2, KeyRound, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
// Stores & Types
import { useRoleStore } from '@/stores/roleStore';
import { SpatieRole, SpatiePermission, SpatieRoleFormData } from '@/types/role';
import { useSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';

// --- RoleFormDialog Component (can be in its own file) ---
interface RoleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialData?: SpatieRole | null;
    allPermissions: SpatiePermission[];
    loadingPermissions: boolean;
}

const RoleFormDialog: React.FC<RoleFormDialogProps> = ({ open, onOpenChange, onSuccess, initialData, allPermissions, loadingPermissions }) => {
    const isEditMode = !!initialData;
    const { createRole, updateRole } = useRoleStore();
    const { enqueueSnackbar } = useSnackbar();
    const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

    const { control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<SpatieRoleFormData>({
        defaultValues: { name: '', permissions: [] }
    });

    useEffect(() => {
        if (open) {
            setFormSubmitError(null);
            if (isEditMode && initialData) {
                reset({
                    name: initialData.name || '',
                    permissions: initialData.permissions?.map(p => p.name) || [] // Use permission names
                });
            } else {
                reset({ name: '', permissions: [] });
            }
        }
    }, [initialData, isEditMode, open, reset]);

    const currentPermissions = watch('permissions') || [];
    const handlePermissionChange = (permissionName: string, checked: boolean) => {
        const newPermissions = checked
            ? [...currentPermissions, permissionName]
            : currentPermissions.filter(p => p !== permissionName);
        setValue('permissions', newPermissions, { shouldValidate: true, shouldDirty: true });
    };

    const onSubmit = async (data: SpatieRoleFormData) => {
        setFormSubmitError(null);
        try {
            if (isEditMode && initialData) {
                await updateRole(initialData.id, data);
                enqueueSnackbar('تم تحديث الدور بنجاح', { variant: 'success' });
            } else {
                await createRole(data);
                enqueueSnackbar('تم إضافة الدور بنجاح', { variant: 'success' });
            }
            onSuccess();
        } catch (error: unknown) {
            console.error('Error submitting role form:', error);
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء العملية';
            setFormSubmitError(errorMessage);
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    };

    return (
        <ShadcnDialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'تعديل الدور والصلاحيات' : 'إضافة دور جديد'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {formSubmitError && (
                            <Alert variant="destructive">
                                <AlertDescription>{formSubmitError}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-1.5">
                            <Label htmlFor="role_name">اسم الدور *</Label>
                            <Controller 
                                name="name" 
                                control={control} 
                                rules={{ required: 'اسم الدور مطلوب' }}
                                render={({ field }) => (
                                    <Input 
                                        id="role_name" 
                                        {...field} 
                                        className={cn(errors.name && "border-destructive")} 
                                        disabled={isEditMode && initialData?.name === 'admin'} 
                                    />
                                )} 
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>الصلاحيات الممنوحة لهذا الدور</Label>
                            {loadingPermissions ? (
                                <Skeleton className="h-32 w-full"/>
                            ) : allPermissions.length > 0 ? (
                                <ScrollArea className="h-48 border rounded-md p-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                        {allPermissions.map(permission => (
                                            <div key={permission.id} className="flex items-center space-x-2 space-x-reverse">
                                                <Checkbox
                                                    id={`perm-${permission.id}`}
                                                    checked={currentPermissions.includes(permission.name)}
                                                    onCheckedChange={(checked) => handlePermissionChange(permission.name, !!checked)}
                                                    disabled={isSubmitting || (isEditMode && initialData?.name === 'admin')}
                                                />
                                                <Label htmlFor={`perm-${permission.id}`} className="text-sm font-normal cursor-pointer">
                                                    {permission.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <p className="text-xs text-muted-foreground">لا توجد صلاحيات معرفة في النظام.</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isSubmitting}>إلغاء</Button>
                        </DialogClose>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || loadingPermissions || (isEditMode && initialData?.name === 'admin')}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {isEditMode ? 'حفظ التعديلات' : 'إضافة دور'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </ShadcnDialog>
    );
};
// --- End RoleFormDialog ---

const RolePermissionManager: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { spatieRoles, allPermissions, loadingRoles, loadingPermissions, error, fetchSpatieRoles, fetchAllPermissions, deleteRole } = useRoleStore();

    const [formOpen, setFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<SpatieRole | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<SpatieRole | null>(null);

    useEffect(() => { 
        fetchSpatieRoles(); 
        fetchAllPermissions(); 
    }, [fetchSpatieRoles, fetchAllPermissions]);

    const handleOpenForm = (role?: SpatieRole) => { 
        setEditingRole(role || null); 
        setFormOpen(true); 
    };
    
    const handleFormSuccess = () => { 
        setFormOpen(false); 
        setEditingRole(null); 
        fetchSpatieRoles(); 
    };
    
    const handleOpenDeleteDialog = (role: SpatieRole) => { 
        setRoleToDelete(role); 
        setDeleteDialogOpen(true); 
    };
    
    const handleCloseDeleteDialog = () => { 
        setRoleToDelete(null); 
        setDeleteDialogOpen(false); 
    };
    
    const handleDeleteConfirm = async () => {
        if (!roleToDelete) return;
        
        try {
            await deleteRole(roleToDelete.id);
            enqueueSnackbar('تم حذف الدور بنجاح', { variant: 'success' });
            handleCloseDeleteDialog();
            fetchSpatieRoles();
        } catch (error: unknown) {
            console.error('Error deleting role:', error);
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الدور';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    };

    return (
        <div className="container max-w-screen-md mx-auto py-6 px-4" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-semibold text-foreground flex items-center">
                    <KeyRound className="ml-3 h-7 w-7 text-primary"/> 
                    إدارة الأدوار والصلاحيات
                </h1>
                <div className="flex gap-2">
                    <Button onClick={() => handleOpenForm()}>
                        <PlusCircle className="ml-2 h-4 w-4"/> 
                        إضافة دور جديد
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/settings">
                            <ArrowRight className="w-4 h-4 ml-2"/>
                            عودة للإعدادات
                        </Link>
                    </Button>
                </div>
            </div>

            {(loadingRoles || loadingPermissions) && (
                <div className="flex justify-center py-5">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            )}
            
            {error && !loadingRoles && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!loadingRoles && !error && (
                <div className="border rounded-lg overflow-x-auto mx-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">اسم الدور</TableHead>
                                <TableHead className="text-center hidden sm:table-cell">عدد الصلاحيات</TableHead>
                                <TableHead className="text-center hidden md:table-cell">عدد المستخدمين</TableHead>
                                <TableHead className="text-left w-[80px]">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {spatieRoles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        لا توجد أدوار معرفة.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                spatieRoles.map((role) => (
                                    <TableRow key={role.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">{role.name}</TableCell>
                                        <TableCell className="text-center hidden sm:table-cell">
                                            <Badge variant="secondary">
                                                {role.permissions_count ?? role.permissions?.length ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center hidden md:table-cell">
                                            <Badge variant="outline">{role.users_count ?? 0}</Badge>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[180px]">
                                                     <DropdownMenuItem onSelect={() => handleOpenForm(role)}>
                                                         <Edit3 className="ml-2 h-4 w-4"/> 
                                                         تعديل الدور والصلاحيات
                                                     </DropdownMenuItem>
                                                     {role.name !== 'admin' && role.name !== 'super-admin' && (
                                                         <>
                                                            <DropdownMenuSeparator/>
                                                            <DropdownMenuItem 
                                                                onSelect={() => handleOpenDeleteDialog(role)} 
                                                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            >
                                                                <Trash2 className="ml-2 h-4 w-4"/> 
                                                                حذف الدور
                                                            </DropdownMenuItem>
                                                         </>
                                                     )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <RoleFormDialog
                open={formOpen} 
                onOpenChange={setFormOpen} 
                onSuccess={handleFormSuccess}
                initialData={editingRole}
                allPermissions={allPermissions} 
                loadingPermissions={loadingPermissions}
            />
            
            <ShadcnDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تأكيد حذف الدور</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من رغبتك في حذف الدور "{roleToDelete?.name}"؟ 
                            هذا الإجراء لا يمكن التراجع عنه.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">إلغاء</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            حذف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </ShadcnDialog>
        </div>
    );
};

export default RolePermissionManager;