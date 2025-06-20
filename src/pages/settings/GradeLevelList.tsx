// src/pages/settings/GradeLevelList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// shadcn/ui components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog as ShadcnDialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle as ShadcnDialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"; // For search

// lucide-react icons
import { PlusCircle, MoreHorizontal, Edit3, Trash2, AlertCircle, Loader2, ArrowRight, FilterX, Milestone } from 'lucide-react';

import { useGradeLevelStore } from '@/stores/gradeLevelStore'; // Adjust path
import GradeLevelForm from '@/components/settings/GradeLevelForm'; // Adjust path
import { GradeLevel } from '@/types/gradeLevel';             // Adjust path
import { useSnackbar } from 'notistack';

const GradeLevelList: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // --- Store Data ---
    const { gradeLevels, loading, error, fetchGradeLevels, deleteGradeLevel } = useGradeLevelStore();

    // --- Local State ---
    const [formOpen, setFormOpen] = useState(false);
    const [editingGradeLevel, setEditingGradeLevel] = useState<GradeLevel | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [gradeLevelToDelete, setGradeLevelToDelete] = useState<GradeLevel | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // --- Effects ---
    useEffect(() => {
        fetchGradeLevels(); // Fetches all grade levels
    }, [fetchGradeLevels]);

    // --- Handlers ---
    const handleOpenForm = (gradeLevel?: GradeLevel) => {
        setEditingGradeLevel(gradeLevel || null);
        setFormOpen(true);
    };
    const handleFormSuccess = () => { // Renamed from handleCloseForm
        setFormOpen(false);
        setEditingGradeLevel(null);
        fetchGradeLevels(); // Refetch list after save
    };

    const handleOpenDeleteDialog = (gradeLevel: GradeLevel) => {
        setGradeLevelToDelete(gradeLevel);
        setDeleteDialogOpen(true);
    };
    const handleCloseDeleteDialog = () => {
        setGradeLevelToDelete(null);
        setDeleteDialogOpen(false);
    };
    const handleDeleteConfirm = async () => {
        if (gradeLevelToDelete) {
            const success = await deleteGradeLevel(gradeLevelToDelete.id);
            if (success) {
                enqueueSnackbar('تم حذف المرحلة الدراسية بنجاح', { variant: 'success' });
            } else {
                enqueueSnackbar(useGradeLevelStore.getState().error || 'فشل حذف المرحلة (قد تكون مستخدمة)', { variant: 'error' });
            }
            handleCloseDeleteDialog();
        }
    };

    // --- Filtered Grade Levels for Display ---
    const filteredGradeLevels = React.useMemo(() => {
        if (!searchTerm) return gradeLevels.sort((a, b) => a.id - b.id); // Sort by ID for consistency
        return gradeLevels
            .filter(gl =>
                gl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                gl.code.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.id - b.id);
    }, [gradeLevels, searchTerm]);

    // --- Animation Variants (Optional) ---
    const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };


    // --- Render Skeletons ---
    if (loading && gradeLevels.length === 0) {
        return (
            <div className="container max-w-screen-md mx-auto py-6 px-4" dir="rtl">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-10 w-48" /> <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-12 w-full sm:w-1/2 mb-4" /> {/* Search Input Skeleton */}
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader><TableRow>{[...Array(4)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow></TableHeader>
                        <TableBody>{[...Array(5)].map((_, i) => (<TableRow key={i}>{[...Array(4)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))}</TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-screen-md mx-auto py-6 px-4" dir="rtl"> {/* Max width for better readability */}
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <h1 className="text-2xl font-semibold text-foreground flex items-center">
                        <Milestone className="ml-3 h-7 w-7 text-primary"/> المراحل الدراسية (الصفوف العامة)
                    </h1>
                    <div className="flex gap-2">
                        <Button onClick={() => handleOpenForm()}><PlusCircle className="ml-2 h-4 w-4" /> إضافة مرحلة</Button>
                        <Button variant="outline" size="sm" asChild><Link to="/settings"><ArrowRight className="w-4 h-4 ml-2"/>عودة للإعدادات</Link></Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-card items-end">
                     <Input
                        type="text"
                        placeholder="بحث بالاسم أو الرمز..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                     {searchTerm && (<Button variant="ghost" onClick={() => setSearchTerm('')} size="sm" className="self-end text-muted-foreground hover:text-foreground"><FilterX className="ml-2 h-4 w-4" /> مسح البحث</Button>)}
                </div>
            </div>

            {/* Error Display */}
            {!loading && error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Table - Centered */}
            {!loading && !error && (
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                    <div className="border rounded-lg overflow-x-auto mx-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">اسم المرحلة</TableHead>
                                    <TableHead className="w-[100px]">الرمز</TableHead>
                                    <TableHead>الوصف</TableHead>
                                    <TableHead className="text-left w-[80px]">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredGradeLevels.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        {searchTerm ? "لم يتم العثور على مراحل تطابق بحثك." : "لا توجد مراحل دراسية لعرضها."}
                                    </TableCell></TableRow>
                                ) : (
                                    filteredGradeLevels.map((gradeLevel) => (
                                        <motion.tr key={gradeLevel.id} variants={itemVariants} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">{gradeLevel.name}</TableCell>
                                            <TableCell>{gradeLevel.code}</TableCell>
                                            <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{gradeLevel.description || '-'}</TableCell>
                                            <TableCell className="text-left">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]" dir="rtl">
                                                        <DropdownMenuItem onSelect={() => handleOpenForm(gradeLevel)}><Edit3 className="ml-2 h-4 w-4" /> تعديل</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onSelect={() => handleOpenDeleteDialog(gradeLevel)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="ml-2 h-4 w-4" /> حذف</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </motion.div>
            )}

            {/* Form Dialog */}
            <GradeLevelForm open={formOpen} onOpenChange={setFormOpen} onSuccess={handleFormSuccess} initialData={editingGradeLevel} />

            {/* Delete Confirmation Dialog */}
            <ShadcnDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} dir="rtl">
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <ShadcnDialogTitle>تأكيد الحذف</ShadcnDialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من حذف المرحلة الدراسية "{gradeLevelToDelete?.name}"؟
                             <br/>
                             <span className="text-destructive font-medium text-sm">(تحذير: لا يمكن حذف المرحلة إذا كانت مستخدمة في فصول دراسية أو تسجيلات طلاب.)</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start">
                        <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                        <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>تأكيد الحذف</Button>
                    </DialogFooter>
                </DialogContent>
            </ShadcnDialog>
        </div>
    );
};

export default GradeLevelList;