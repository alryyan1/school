// src/pages/teachers/TeacherList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// shadcn/ui components
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogClose, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // For status
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// lucide-react icons
import { PlusCircle, MoreHorizontal, Edit3, Trash2, Eye, AlertCircle, GraduationCap } from 'lucide-react';

import { useTeacherStore } from '@/stores/teacherStore'; // Adjust path
import { Teacher } from '@/types/teacher';             // Adjust path
import { useSnackbar } from 'notistack'; // Still useful for general notifications

const TeacherList: React.FC = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    // --- Store Data & Actions ---
    const { teachers, loading, error, fetchTeachers, deleteTeacher } = useTeacherStore();

    // --- Local State ---
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // --- Effects ---
    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    // --- Handlers ---
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
                fetchTeachers();
            } else {
                enqueueSnackbar(useTeacherStore.getState().error || 'فشل حذف المدرس', { variant: 'error' });
            }
            handleCloseDeleteDialog();
        }
    };

    const filteredTeachers = useMemo(() => {
        if (!searchTerm) return teachers;
        return teachers.filter(teacher =>
            teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (teacher.national_id && teacher.national_id.includes(searchTerm))
        );
    }, [teachers, searchTerm]);

    // --- Animation Variants (Optional) ---
    const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

    // --- Render Skeletons ---
    if (loading && filteredTeachers.length === 0) {
        return (
            <div className="container mx-auto p-4 sm:p-6 max-w-7xl" dir="rtl">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <Skeleton className="h-8 w-32" />
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Skeleton className="h-10 w-full sm:w-64" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full flex justify-center">
                            <div className="w-full border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table className="w-full min-w-[700px]">
                                        <TableHeader>
                                            <TableRow>
                                                {[...Array(7)].map((_, i) => (
                                                    <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[...Array(5)].map((_, i) => (
                                                <TableRow key={i}>
                                                    {[...Array(7)].map((_, j) => (
                                                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    // --- Main Render ---
    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl" dir="rtl">
            <Card>
                <CardHeader>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-xl sm:text-2xl">قائمة المدرسين</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Input
                                type="text" 
                                placeholder="بحث بالاسم, الرقم الوطني, أو البريد..."
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:max-w-xs"
                            />
                            <Button onClick={() => navigate('/settings/teachers/create')} className="w-full sm:w-auto whitespace-nowrap">
                                <PlusCircle className="ml-2 h-4 w-4" /> إضافة مدرس
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>خطأ</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Table Container - Centered */}
                    <div className="w-full flex justify-center">
                        <div className="w-full border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table className="w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-60 text-center">الصورة</TableHead>
                                            <TableHead className="text-center">الاسم الكامل</TableHead>
                                            <TableHead className="hidden sm:table-cell ">الرقم الوطني</TableHead>
                                            <TableHead className="hidden sm:table-cell">البريد</TableHead>
                                            <TableHead className="hidden md:table-cell ">الهاتف</TableHead>
                                            <TableHead className="text-center hidden sm:table-cell w-20">الحالة</TableHead>
                                            <TableHead className="w-20 text-center">إجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading && filteredTeachers.length === 0 && (
                                            [...Array(5)].map((_, i) => (
                                                <TableRow key={`skel-${i}`}>
                                                    {[...Array(7)].map((_, j) => (
                                                        <TableCell key={`skel-cell-${j}`}>
                                                            <Skeleton className="h-4 w-full" />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        )}
                                        {!loading && filteredTeachers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                    {searchTerm ? "لم يتم العثور على مدرسين يطابقون بحثك." : "لا يوجد مدرسون لعرضهم. قم بإضافة مدرس جديد."}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTeachers.map((teacher) => (
                                                <motion.tr 
                                                    key={teacher.id} 
                                                    variants={itemVariants} 
                                                    initial="hidden" 
                                                    animate="visible" 
                                                    className="hover:bg-muted/50 transition-colors"
                                                >
                                                    <TableCell className="text-center">
                                                        <Avatar className="h-9 w-9 mx-auto">
                                                            <AvatarImage src={teacher.photo_path ?? undefined} alt={teacher.name} />
                                                            <AvatarFallback>
                                                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{teacher.name}</TableCell>
                                                    <TableCell className="hidden sm:table-cell text-sm font-mono">
                                                        {teacher.national_id || '-'}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-sm">
                                                        {teacher.email || '-'}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-sm">
                                                        {teacher.phone || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-center hidden sm:table-cell">
                                                        <Badge 
                                                            variant={teacher.is_active ? "default" : "outline"} 
                                                            className={teacher.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}
                                                        >
                                                            {teacher.is_active ? "نشط" : "غير نشط"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                                <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                                                                <DropdownMenuItem onSelect={() => navigate(`/settings/teachers/${teacher.id}`)}>
                                                                    <Eye className="ml-2 h-4 w-4" /> عرض
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => navigate(`/settings/teachers/${teacher.id}/edit`)}>
                                                                    <Edit3 className="ml-2 h-4 w-4" /> تعديل
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem 
                                                                    onSelect={() => handleOpenDeleteDialog(teacher)} 
                                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="ml-2 h-4 w-4" /> حذف
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من حذف المدرس "{teacherToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">إلغاء</Button>
                        </DialogClose>
                        <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
                            تأكيد الحذف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
export default TeacherList;