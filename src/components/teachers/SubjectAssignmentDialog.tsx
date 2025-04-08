// src/components/teachers/SubjectAssignmentDialog.tsx
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, List, ListItem, ListItemIcon, ListItemText, Checkbox, Paper, Typography, CircularProgress, Alert, Box, Divider
} from '@mui/material';
import { Subject } from '@/types/subject';
import { Teacher } from '@/types/teacher';
import { useSubjectStore } from '@/stores/subjectStore'; // To get all subjects
import { TeacherApi } from '@/api/teacherApi'; // Direct API call for simplicity here
import { useSnackbar } from 'notistack';

interface SubjectAssignmentDialogProps {
    open: boolean;
    onClose: () => void;
    teacher: Teacher | null;
}

// Helper function for Transfer List intersections/differences
function not(a: readonly Subject[], b: readonly Subject[]) {
    return a.filter((value) => b.findIndex(item => item.id === value.id) === -1);
}
function intersection(a: readonly Subject[], b: readonly Subject[]) {
    return a.filter((value) => b.findIndex(item => item.id === value.id) !== -1);
}

const SubjectAssignmentDialog: React.FC<SubjectAssignmentDialogProps> = ({ open, onClose, teacher }) => {
    const { enqueueSnackbar } = useSnackbar();
    const { subjects: allSubjects, fetchSubjects, loading: loadingAllSubjects } = useSubjectStore();

    // State for the transfer list
    const [checked, setChecked] = useState<readonly Subject[]>([]);
    const [left, setLeft] = useState<readonly Subject[]>([]); // Available subjects
    const [right, setRight] = useState<readonly Subject[]>([]); // Assigned subjects

    // State for API calls within the dialog
    const [loadingAssigned, setLoadingAssigned] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all subjects if not already loaded
    useEffect(() => {
        if (open && allSubjects.length === 0) {
            fetchSubjects();
        }
    }, [open, allSubjects.length, fetchSubjects]);

    // Fetch assigned subjects when dialog opens with a teacher
    useEffect(() => {
        if (open && teacher && allSubjects.length > 0) {
            const fetchAssigned = async () => {
                setLoadingAssigned(true);
                setError(null);
                try {
                    const response = await TeacherApi.getAssignedSubjects(teacher.id);
                    const assigned = response.data.data;
                    setRight(assigned);
                    setLeft(not(allSubjects, assigned).sort((a,b) => a.name.localeCompare(b.name))); // Calculate available
                } catch (err: any) {
                    setError(err.response?.data?.message || 'فشل تحميل المواد المعينة');
                    setLeft([...allSubjects].sort((a,b) => a.name.localeCompare(b.name))); // Show all as available on error
                    setRight([]);
                } finally {
                    setLoadingAssigned(false);
                    setChecked([]); // Clear checks on load
                }
            };
            fetchAssigned();
        } else if (!teacher) {
            // Clear lists if no teacher
            setLeft([]);
            setRight([]);
            setChecked([]);
        }
    }, [open, teacher, allSubjects]); // Rerun if teacher or allSubjects change

    // --- Transfer List Logic ---
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = (value: Subject) => () => {
        const currentIndex = checked.findIndex(item => item.id === value.id);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };

    const handleAllRight = () => {
        setRight(right.concat(left).sort((a,b) => a.name.localeCompare(b.name)));
        setLeft([]);
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked).sort((a,b) => a.name.localeCompare(b.name)));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked).sort((a,b) => a.name.localeCompare(b.name)));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleAllLeft = () => {
        setLeft(left.concat(right).sort((a,b) => a.name.localeCompare(b.name)));
        setRight([]);
    };
    // --- End Transfer List Logic ---

    // --- Save Handler ---
    const handleSave = async () => {
         if (!teacher) return;
         setIsSaving(true);
         setError(null);
         const assignedSubjectIds = right.map(subject => subject.id); // Get IDs from the right list
         try {
             await TeacherApi.updateAssignedSubjects(teacher.id, assignedSubjectIds);
             enqueueSnackbar('تم حفظ تعيينات المواد بنجاح', { variant: 'success' });
             onClose(); // Close dialog on success
         } catch (err: any) {
              setError(err.response?.data?.message || 'فشل حفظ التعيينات');
         } finally {
             setIsSaving(false);
         }
    };

    // --- Custom List Component ---
    const customList = (title: React.ReactNode, items: readonly Subject[]) => (
        <Paper sx={{ width: 250, height: 300, overflow: 'auto' }} elevation={2}>
            <Typography sx={{ p: 1.5, fontWeight:'medium', bgcolor:'grey.100', borderBottom: 1, borderColor:'divider' }} variant="body2" align="center">{title}</Typography>
            <Divider />
            <List dense component="div" role="list">
                {items.map((value: Subject) => {
                    const labelId = `transfer-list-item-${value.id}-label`;
                    return (
                        <ListItem
                            key={value.id}
                            role="listitem"
                            button
                            onClick={handleToggle(value)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.findIndex(item => item.id === value.id) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                    size="small"
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={value.name} secondary={value.code} />
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );


    if (!teacher) return null; // Don't render if no teacher selected

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md"> {/* Wider dialog */}
            <DialogTitle>إدارة المواد الدراسية للمدرس: {teacher.name}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {(loadingAllSubjects || loadingAssigned) && <Box sx={{display:'flex', justifyContent:'center', my:2}}><CircularProgress /></Box>}

                {!(loadingAllSubjects || loadingAssigned) && (
                    <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
                        <Grid item>{customList('المواد المتاحة', left)}</Grid>
                        <Grid item>
                            <Grid container direction="column" alignItems="center">
                                <Button
                                    sx={{ my: 0.5 }} variant="outlined" size="small"
                                    onClick={handleAllRight} disabled={left.length === 0}
                                    aria-label="move all right"
                                >تحريك الكل لليمين</Button>
                                <Button
                                    sx={{ my: 0.5 }} variant="outlined" size="small"
                                    onClick={handleCheckedRight} disabled={leftChecked.length === 0}
                                    aria-label="move selected right"
                                >تحديد المحدد الي اليمين</Button>
                                <Button
                                    sx={{ my: 0.5 }} variant="outlined" size="small"
                                    onClick={handleCheckedLeft} disabled={rightChecked.length === 0}
                                    aria-label="move selected left"
                                >تحديد المحدد الي الشمال</Button>
                                <Button
                                    sx={{ my: 0.5 }} variant="outlined" size="small"
                                    onClick={handleAllLeft} disabled={right.length === 0}
                                    aria-label="move all left"
                                >تحريك الكل الي الشمال</Button>
                            </Grid>
                        </Grid>
                        <Grid item>{customList('المواد المعينة', right)}</Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit" disabled={isSaving}>إلغاء</Button>
                <Button onClick={handleSave} variant="contained" color="primary" disabled={isSaving || loadingAllSubjects || loadingAssigned}>
                     {isSaving ? <CircularProgress size={22} /> : 'حفظ التغييرات'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubjectAssignmentDialog;