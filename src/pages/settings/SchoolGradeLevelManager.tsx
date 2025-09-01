// src/pages/settings/SchoolGradeLevelManager.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Button
} from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Card, CardContent, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import {
    Dialog as ShadcnDialog, DialogClose, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator"; // For visual separation
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// lucide-react icons
import { PlusCircle, Edit3, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion'; // For animations

import { useSchoolStore } from '@/stores/schoolStore';       // Adjust path
import { useGradeLevelStore } from '@/stores/gradeLevelStore'; // For ALL grades
// Removed useSettingsStore import
import { SchoolApi } from '@/api/schoolApi';                   // Adjust path
import { GradeLevel } from '@/types/gradeLevel';             // Adjust path
import { useSnackbar } from 'notistack';

// --- Re-usable Dialog Components (from previous, ensure they are shadcn compliant) ---
// AssignGradeLevelDialog.tsx (Needs to be refactored to shadcn if not already)
// EditGradeFeeDialog.tsx (Needs to be refactored to shadcn if not already)
// For this example, I'll provide inline mockups and you can extract them.

// Mockup for AssignGradeLevelDialog (replace with your actual shadcn component)
interface AssignGradeLevelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    schoolId: number;
    availableGrades: GradeLevel[];
}
const AssignGradeLevelDialog: React.FC<AssignGradeLevelDialogProps> = ({ open, onOpenChange, onSuccess, schoolId, availableGrades }) => {
    // ... (Internal form logic with react-hook-form and shadcn components for GradeLevel and BasicFees)
    // On submit, call SchoolApi.attachGradeLevels
    const [selectedGradeId, setSelectedGradeId] = useState<string>("");
    const [basicFees, setBasicFees] = useState<string>("0");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (open) {
            setSelectedGradeId("");
            setBasicFees("0");
            setError(null);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGradeId) {
            setError("الرجاء اختيار المرحلة الدراسية.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await SchoolApi.attachGradeLevels(
                schoolId,
                Number(selectedGradeId),
                Number(basicFees) || 0
            );
            enqueueSnackbar('تم تعيين المرحلة بنجاح', { variant: 'success' });
            onSuccess();
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            setError(errorObj.response?.data?.message || errorObj.message || "فشل تعيين المرحلة");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ShadcnDialog open={open} onOpenChange={onOpenChange}>
            <DialogContent dir="rtl" className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>تعيين مرحلة دراسية للمدرسة</DialogTitle>
                    <DialogDescription>اختر المرحلة وحدد الرسوم الأساسية لها في هذه المدرسة.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                        <div className="space-y-2">
                            <Label htmlFor="grade-level-assign">المرحلة الدراسية *</Label>
                            <Select value={selectedGradeId} onValueChange={setSelectedGradeId} required>
                                <SelectTrigger id="grade-level-assign"><SelectValue placeholder="اختر مرحلة..." /></SelectTrigger>
                                <SelectContent>
                                    {availableGrades.length === 0 && <SelectItem value=" " disabled><em>(لا مراحل أخرى متاحة)</em></SelectItem>}
                                    {availableGrades.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name} ({g.code})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="basic-fees-assign">الرسوم الأساسية *</Label>
                            <Input id="basic-fees-assign" type="number" value={basicFees} onChange={(e) => setBasicFees(e.target.value)} required min="0" step="1" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>إلغاء</Button></DialogClose>
                        <Button type="submit" disabled={isSubmitting || availableGrades.length === 0}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} تعيين وحفظ
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </ShadcnDialog>
    );
};

// Mockup for EditGradeFeeDialog
interface EditGradeFeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    schoolId: number;
    gradeLevel: GradeLevel | null; // Has assignment_details
}
const EditGradeFeeDialog: React.FC<EditGradeFeeDialogProps> = ({ open, onOpenChange, onSuccess, schoolId, gradeLevel }) => {
    // ... (Internal form logic with react-hook-form and shadcn Input for BasicFees)
    // On submit, call SchoolApi.updateGradeLevelFee
    const [basicFees, setBasicFees] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (open && gradeLevel) {
            setBasicFees(String(gradeLevel.assignment_details?.basic_fees ?? "0"));
            setError(null);
        }
    }, [open, gradeLevel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradeLevel) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await SchoolApi.updateGradeLevelFee(schoolId, gradeLevel.id, Number(basicFees) || 0);
            enqueueSnackbar('تم تحديث الرسوم بنجاح', { variant: 'success' });
            onSuccess();
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            setError(errorObj.response?.data?.message || errorObj.message || "فشل تحديث الرسوم");
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!gradeLevel) return null;

    return (
        <ShadcnDialog open={open} onOpenChange={onOpenChange}>
            <DialogContent dir="rtl" className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>تعديل الرسوم الأساسية</DialogTitle>
                    <DialogDescription>للمرحلة: {gradeLevel.name} ({gradeLevel.code})</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                        <div className="space-y-2">
                            <Label htmlFor="basic-fees-edit">الرسوم الأساسية *</Label>
                            <Input id="basic-fees-edit" type="number" value={basicFees} onChange={(e) => setBasicFees(e.target.value)} required min="0" step="1" />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>إلغاء</Button></DialogClose>
                         <Button type="submit" disabled={isSubmitting}>
                             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} حفظ التعديل
                         </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </ShadcnDialog>
    );
};


const SchoolGradeLevelManager: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    // Removed useSettingsStore - implement your preferred state management

    // --- Local State ---
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | ''>(initialActiveSchoolId ?? '');
    const [assignedGradeLevels, setAssignedGradeLevels] = useState<GradeLevel[]>([]);
    const [loadingAssigned, setLoadingAssigned] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // Dialog States
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [editFeeDialogOpen, setEditFeeDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentGradeLevel, setCurrentGradeLevel] = useState<GradeLevel | null>(null);

    // --- Data from Stores ---
    const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
    const { gradeLevels: allGradeLevels, fetchGradeLevels } = useGradeLevelStore();

    // --- Effects ---
    useEffect(() => { fetchSchools(); fetchGradeLevels(); }, [fetchSchools, fetchGradeLevels]);

    const fetchAssigned = useCallback(async (schoolId: number) => {
        setLoadingAssigned(true); setError(null);
        try {
            const response = await SchoolApi.getAssignedGradeLevels(schoolId);
            console.log('API Response:', response); // Debug log
            console.log('Response.data:', response.data); // Debug log
            
            // Handle axios response structure - the data might be nested
            let gradeLevels: GradeLevel[] = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    gradeLevels = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    gradeLevels = response.data.data;
                } else if (typeof response.data === 'object') {
                    // If it's an object, try to find the array
                    const keys = Object.keys(response.data);
                    console.log('Response.data keys:', keys);
                    for (const key of keys) {
                        if (Array.isArray(response.data[key])) {
                            gradeLevels = response.data[key];
                            break;
                        }
                    }
                }
            }
            
            console.log('Processed grade levels:', gradeLevels); // Debug log
            setAssignedGradeLevels(gradeLevels.sort((a: GradeLevel, b: GradeLevel) => a.id - b.id));
        } catch (err: unknown) {
            console.error('Error fetching assigned grade levels:', err); // Debug log
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            setError(errorObj.response?.data?.message || 'فشل تحميل المراحل المعينة');
            setAssignedGradeLevels([]);
        } finally { setLoadingAssigned(false); }
    }, []);

    useEffect(() => {
        if (selectedSchoolId) fetchAssigned(selectedSchoolId);
        else { setAssignedGradeLevels([]); setError(null); }
    }, [selectedSchoolId, fetchAssigned]);

    // --- Handlers ---
    const handleSchoolChange = (value: string) => setSelectedSchoolId(value ? Number(value) : '');

    const handleOpenAssignDialog = () => setAssignDialogOpen(true);
    const handleAssignSuccess = () => { setAssignDialogOpen(false); if (selectedSchoolId) fetchAssigned(selectedSchoolId); };

    const handleOpenEditFeeDialog = (gradeLevel: GradeLevel) => { setCurrentGradeLevel(gradeLevel); setEditFeeDialogOpen(true); };
    const handleEditFeeSuccess = () => { setEditFeeDialogOpen(false); setCurrentGradeLevel(null); if (selectedSchoolId) fetchAssigned(selectedSchoolId); };

    const handleCloseDeleteDialog = () => { setCurrentGradeLevel(null); setDeleteDialogOpen(false); };

    const handleDeleteConfirm = async () => {
        if (currentGradeLevel && selectedSchoolId) {
            try {
                await SchoolApi.detachGradeLevel(selectedSchoolId, currentGradeLevel.id);
                enqueueSnackbar('تم إلغاء تعيين المرحلة بنجاح', { variant: 'success' });
                fetchAssigned(selectedSchoolId);
            } catch (err: unknown) {
                const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
                enqueueSnackbar(errorObj.response?.data?.message || 'فشل إلغاء التعيين', { variant: 'error' });
            } finally { handleCloseDeleteDialog(); }
        }
    };

    const assignableGradeLevels = useMemo(() => {
         const assignedIds = new Set(assignedGradeLevels.map(gl => gl.id));
         return allGradeLevels.filter(gl => !assignedIds.has(gl.id)).sort((a,b) => a.id - b.id);
     }, [allGradeLevels, assignedGradeLevels]);

    // --- Animation Variants ---
    const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

    // Debug logging
    console.log('Current state:', {
        selectedSchoolId,
        assignedGradeLevels: assignedGradeLevels.length,
        loadingAssigned,
        error,
        hasData: assignedGradeLevels.length > 0
    });

    // --- Render Methods ---
    const renderCardsView = () => (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
            {assignedGradeLevels.map((grade) => (
                <motion.div key={grade.id} variants={itemVariants}>
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-md">{grade.name} <span className="text-xs text-muted-foreground">({grade.code})</span></CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground">الرسوم الأساسية:</p>
                            <p className="text-lg font-semibold text-primary">{(grade.assignment_details?.basic_fees || 0).toLocaleString('en-US')}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-3 border-t">
                            <Button variant="outline" size="sm" onClick={() => handleOpenEditFeeDialog(grade)}>
                                <Edit3 className="ml-1.5 h-3.5 w-3.5" /> تعديل الرسوم
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );

    const renderTableView = () => (
        <div className="hidden lg:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-right">المرحلة الدراسية</TableHead>
                        <TableHead className="text-right">الرمز</TableHead>
                        <TableHead className="text-right">الرسوم الأساسية</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assignedGradeLevels.map((grade) => (
                        <TableRow key={grade.id}>
                            <TableCell className="font-medium">{grade.name}</TableCell>
                            <TableCell>{grade.code}</TableCell>
                            <TableCell className="font-semibold text-primary">
                                {(grade.assignment_details?.basic_fees || 0).toLocaleString('en-US')} 
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" onClick={() => handleOpenEditFeeDialog(grade)}>
                                    <Edit3 className="ml-1.5 h-3.5 w-3.5" /> تعديل الرسوم
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="container  mx-auto py-6 px-4" dir="rtl">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h1 className="text-2xl font-semibold text-foreground mb-1">تعيين المراحل الدراسية للمدارس</h1>
                <p className="text-sm text-muted-foreground mb-6">اختر مدرسة لعرض وتعديل المراحل الدراسية المعينة لها ورسومها الأساسية.</p>
            </motion.div>

            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="school-select">اختر المدرسة *</Label>
                            <Select value={selectedSchoolId ? String(selectedSchoolId) : ""} onValueChange={handleSchoolChange} disabled={schoolsLoading}>
                                <SelectTrigger id="school-select"><SelectValue placeholder={schoolsLoading ? "جاري التحميل..." : "اختر مدرسة..."} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" " disabled><em>اختر مدرسة...</em></SelectItem>
                                    {schools.map(school => <SelectItem key={school.id} value={String(school.id)}>{school.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            {selectedSchoolId && !loadingAssigned && (
                                <div className="text-sm text-muted-foreground text-center">
                                    المراحل المعينة: <span className="font-semibold text-primary">{assignedGradeLevels.length}</span>
                                </div>
                            )}
                            <Button onClick={handleOpenAssignDialog} disabled={!selectedSchoolId || assignableGradeLevels.length === 0 || loadingAssigned} className="w-full md:w-auto">
                                <PlusCircle className="ml-2 h-4 w-4" /> تعيين مرحلة جديدة
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div>
                        <h2 className="text-lg font-medium mb-3 text-foreground">المراحل المعينة حالياً للمدرسة المختارة:</h2>
                        {loadingAssigned && <div className="flex justify-center py-5"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                        {!loadingAssigned && error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                        {!loadingAssigned && !error && !selectedSchoolId && <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"><AlertCircle className="h-4 w-4" /><AlertDescription>الرجاء اختيار مدرسة لعرض المراحل الدراسية المعينة.</AlertDescription></Alert>}
                        {!loadingAssigned && !error && selectedSchoolId && assignedGradeLevels.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">لا توجد مراحل دراسية معينة لهذه المدرسة حتى الآن.</p>
                        )}

                        {!loadingAssigned && !error && selectedSchoolId && assignedGradeLevels.length > 0 && (
                            <>
                                
                                
                                {/* Cards view for mobile and tablet */}
                                {renderCardsView()}
                                
                                {/* Table view for large screens */}
                                {renderTableView()}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dialogs */}
            {selectedSchoolId && (
                 <AssignGradeLevelDialog
                     open={assignDialogOpen}
                     onOpenChange={setAssignDialogOpen}
                     onSuccess={handleAssignSuccess}
                     schoolId={selectedSchoolId}
                     availableGrades={assignableGradeLevels}
                 />
             )}

             {selectedSchoolId && currentGradeLevel && (
                 <EditGradeFeeDialog
                      open={editFeeDialogOpen}
                      onOpenChange={setEditFeeDialogOpen}
                      onSuccess={handleEditFeeSuccess}
                      schoolId={selectedSchoolId}
                      gradeLevel={currentGradeLevel}
                 />
             )}

            <ShadcnDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تأكيد إلغاء التعيين</DialogTitle>
                        <DialogDescription>
                             هل أنت متأكد من إلغاء تعيين المرحلة "{currentGradeLevel?.name}" من هذه المدرسة؟
                             <br/>
                             <span className="text-destructive font-medium text-sm">(تحذير: قد يؤثر هذا على الفصول الدراسية أو تسجيلات الطلاب.)</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start">
                         <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
                         <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>إلغاء التعيين</Button>
                    </DialogFooter>
                </DialogContent>
            </ShadcnDialog>
        </div>
    );
};

export default SchoolGradeLevelManager;