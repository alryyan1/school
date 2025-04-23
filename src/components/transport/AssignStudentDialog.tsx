// src/components/transport/AssignStudentDialog.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Box,
    Typography, CircularProgress, Alert, List, ListItem, ListItemText,
    ListItemIcon, Checkbox, Paper, Divider, IconButton, Tooltip, TextField,
    InputAdornment, // Keep for potential future use
    Stack
} from '@mui/material';
import {
    ArrowForward, ArrowBack, Edit as EditIcon,
    Save as SaveIcon, Cancel as CancelIcon
} from '@mui/icons-material'; // Example icons
import { TransportRoute } from '@/types/transportRoute'; // Adjust path
import { AssignableStudentInfo, StudentTransportAssignment, StudentTransportAssignmentFormData } from '@/types/studentTransportAssignment'; // Adjust path
import { AcademicYear } from '@/types/academicYear'; // Adjust path
import { useStudentTransportAssignmentStore } from '@/stores/studentTransportAssignmentStore'; // Adjust path
import { useSnackbar } from 'notistack';
import { SchoolApi } from '@/api/schoolApi'; // Import SchoolApi

interface AssignStudentDialogProps {
    open: boolean;
    onClose: () => void;
    route: TransportRoute | null;
    academicYear: AcademicYear | null; // Changed from academicYearId
}

// --- Helper functions for Transfer List ---
// Difference: items in 'a' that are NOT in 'b' based on student_academic_year_id
function notAssignable(a: readonly AssignableStudentInfo[], b: readonly StudentTransportAssignment[]) {
    const bIds = new Set(b.map(item => item.student_academic_year_id));
    return a.filter((value) => !bIds.has(value.student_academic_year_id));
}
// Intersection for left list (checked items that are in the left list)
function intersectionAssignable(a: readonly (AssignableStudentInfo | StudentTransportAssignment)[], b: readonly AssignableStudentInfo[]) {
    const bIds = new Set(b.map(item => item.student_academic_year_id));
    // Ensure item has student_id property before accessing it
    return a.filter(value => 'student_id' in value && bIds.has(value.student_academic_year_id)) as AssignableStudentInfo[];
}
// Intersection for right list (checked items that are in the right list)
function intersectionAssigned(a: readonly (AssignableStudentInfo | StudentTransportAssignment)[], b: readonly StudentTransportAssignment[]) {
    const bIds = new Set(b.map(item => item.id)); // Use assignment ID for right list
    // Ensure item does NOT have student_id (meaning it's an assignment) before accessing item.id
    return a.filter(value => !('student_id' in value) && bIds.has(value.id)) as StudentTransportAssignment[];
}
// Difference for checked list based on left list items
function checkedDifferenceLeft(checked: readonly (AssignableStudentInfo | StudentTransportAssignment)[], itemsToMove: readonly AssignableStudentInfo[]) {
    const moveIds = new Set(itemsToMove.map(item => item.student_academic_year_id));
    return checked.filter(value => !('student_id' in value) || !moveIds.has(value.student_academic_year_id));
}
// Difference for checked list based on right list items
function checkedDifferenceRight(checked: readonly (AssignableStudentInfo | StudentTransportAssignment)[], itemsToMove: readonly StudentTransportAssignment[]) {
    const moveIds = new Set(itemsToMove.map(item => item.id));
    return checked.filter(value => 'student_id' in value || !moveIds.has(value.id));
}
// ------------------------------------------


const AssignStudentDialog: React.FC<AssignStudentDialogProps> = ({
    open, onClose, route, academicYear
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const {
        assignments, loadingAssignments, fetchAssignments,
        assignableStudents, loadingAssignable, fetchAssignableStudents,
        assignStudent, unassignStudent, updateAssignmentDetails, clearAll: clearAssignmentStore
    } = useStudentTransportAssignmentStore();

    // State for Transfer List
    const [checked, setChecked] = useState<readonly (AssignableStudentInfo | StudentTransportAssignment)[]>([]);
    const [left, setLeft] = useState<readonly AssignableStudentInfo[]>([]); // Available to assign
    const [right, setRight] = useState<readonly StudentTransportAssignment[]>([]); // Currently assigned

    // State for editing pickup/dropoff
    const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
    const [pickupPoint, setPickupPoint] = useState('');
    const [dropoffPoint, setDropoffPoint] = useState('');
    const [isSavingDetails, setIsSavingDetails] = useState(false);

    // State for API operations
    const [isProcessingAssign, setIsProcessingAssign] = useState(false); // Loading for assign button
    const [isProcessingUnassign, setIsProcessingUnassign] = useState(false); // Loading for unassign button
    const [error, setError] = useState<string | null>(null);

    // Fetch data when dialog opens or dependencies change
    useEffect(() => {
        if (open && route && academicYear?.id && route.school_id) {
            setError(null);
            fetchAssignments(route.id);
            fetchAssignableStudents(academicYear.id, route.school_id);
        } else {
            // Clear state when dialog closes or prerequisites missing
            setLeft([]);
            setRight([]);
            setChecked([]);
            if (open === false) { // Only clear store if dialog is closing
                 clearAssignmentStore();
            }
        }
    }, [open, route, academicYear, fetchAssignments, fetchAssignableStudents, clearAssignmentStore]);

    // Update local lists when store data changes
    useEffect(() => {
        setRight(assignments);
        setLeft(assignableStudents);
         // Clear checked items that might no longer exist in the lists after store update
         setChecked(prevChecked => prevChecked.filter(checkedItem => {
            if ('student_id' in checkedItem) { // It's an AssignableStudentInfo
                 return assignableStudents.some(s => s.student_academic_year_id === checkedItem.student_academic_year_id);
            } else { // It's a StudentTransportAssignment
                 return assignments.some(a => a.id === checkedItem.id);
            }
        }));
    }, [assignments, assignableStudents]);

    // --- Transfer List Logic ---
    const leftChecked = intersectionAssignable(checked, left);
    const rightChecked = intersectionAssigned(checked, right);

    const handleToggle = (value: AssignableStudentInfo | StudentTransportAssignment) => () => {
        const id = 'student_id' in value ? value.student_academic_year_id : value.id;
        const currentIndex = checked.findIndex(item => ('student_id' in item ? item.student_academic_year_id : item.id) === id);
        const newChecked = [...checked];

        if (currentIndex === -1) newChecked.push(value);
        else newChecked.splice(currentIndex, 1);

        setChecked(newChecked);
    };

    // --- Assign/Unassign Handlers ---
    const handleAssignChecked = async () => {
        if (!route || !academicYear?.id) return;
        setIsProcessingAssign(true);
        setError(null);
        const itemsToAssign = leftChecked;
        let successCount = 0;
        let errors: string[] = [];

        for (const item of itemsToAssign) {
             const gradeLevelId = item.grade_level_id; // Ensure backend provides this
             if (!gradeLevelId) {
                  errors.push(`فشل تعيين ${item.student_name}: بيانات المرحلة غير متوفرة.`);
                  continue;
             }
             try {
                  await assignStudent({
                      student_academic_year_id: item.student_academic_year_id,
                      transport_route_id: route.id,
                      school_id: route.school_id,
                      grade_level_id: gradeLevelId,
                      pickup_point: null, dropoff_point: null, status: 'active',
                  });
                  successCount++;
             } catch (err: any) { errors.push(err.message || `فشل تعيين ${item.student_name}`); }
         }

        setIsProcessingAssign(false);
        if (errors.length > 0) setError(errors.join('\n'));
        if (successCount > 0) {
             enqueueSnackbar(`تم تعيين ${successCount} طالب للمسار بنجاح`, { variant: 'success' });
             setChecked(checkedDifferenceLeft(checked, itemsToAssign));
         }
    };

     const handleUnassignChecked = async () => {
         if (!route || !academicYear?.id) return;
         setIsProcessingUnassign(true);
         setError(null);
         const itemsToUnassign = rightChecked;
         let successCount = 0;
         let errors: string[] = [];

          for (const item of itemsToUnassign) {
             try {
                  await unassignStudent(item.id);
                  successCount++;
             } catch (err: any) { errors.push(err.message || `فشل إلغاء تعيين ${item.student_enrollment?.student?.student_name}`); }
         }

         setIsProcessingUnassign(false);
          if (errors.length > 0) setError(errors.join('\n'));
         if (successCount > 0) {
              enqueueSnackbar(`تم إلغاء تعيين ${successCount} طالب من المسار بنجاح`, { variant: 'success' });
              setChecked(checkedDifferenceRight(checked, itemsToUnassign));
         }
     };
    // --- End Assign/Unassign Handlers ---

    // --- Edit Details Logic ---
     const handleEditDetails = (assignment: StudentTransportAssignment) => {
         setEditingAssignmentId(assignment.id);
         setPickupPoint(assignment.pickup_point || '');
         setDropoffPoint(assignment.dropoff_point || '');
     };
     const handleCancelEditDetails = () => { setEditingAssignmentId(null); };
     const handleSaveDetails = async (assignmentId: number) => {
          setIsSavingDetails(true); setError(null);
          try {
               await updateAssignmentDetails(assignmentId, { pickup_point: pickupPoint || null, dropoff_point: dropoffPoint || null });
               enqueueSnackbar('تم حفظ نقاط الصعود/النزول', { variant: 'success' });
               setEditingAssignmentId(null);
          } catch (err:any) { setError(err.message || 'فشل حفظ التفاصيل'); }
          finally { setIsSavingDetails(false); }
     }
     // --- End Edit Details Logic ---


    // --- Custom List Component ---
    const customList = (title: React.ReactNode, items: readonly (AssignableStudentInfo | StudentTransportAssignment)[]) => (
        <Paper sx={{ width: 320, height: 350, overflow: 'auto', display: 'flex', flexDirection: 'column' }} elevation={2}>
            <Typography sx={{ p: 1.5, fontWeight:'medium', bgcolor:'grey.100', borderBottom: 1, borderColor:'divider', position: 'sticky', top: 0, zIndex: 1 }} variant="body2" align="center">
                {title} ({items.length})
            </Typography>
            <Divider />
            <List dense component="div" role="list" sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {items.map((value) => {
                    // --- Corrected Data Access ---
                    const isAssignable = 'student_id' in value;
                    const id = isAssignable ? value.student_academic_year_id : value.id;
                    const labelId = `transfer-list-item-${id}-label`;
                    // Get name and govId based on type
                    const name = isAssignable ? value.student_name : value.student_enrollment?.student?.student_name;
                    const govId = isAssignable ? value.goverment_id : value.student_enrollment?.student?.goverment_id;
                    // -----------------------------
                    const isChecked = checked.findIndex(item => ('student_id' in item ? item.student_academic_year_id : item.id) === id) !== -1;
                    const isBeingEdited = !isAssignable && editingAssignmentId === value.id;

                    // Content for Assigned List Item (Right)
                     const assignedItemContent = isBeingEdited ? (
                         // --- Inline Edit Form ---
                         <Stack spacing={1} sx={{ width: '100%', pr: 1, py: 0.5 }}>
                              <TextField size="small" label="نقطة الصعود" value={pickupPoint} onChange={(e)=> setPickupPoint(e.target.value)} variant="outlined" margin="dense"/>
                              <TextField size="small" label="نقطة النزول" value={dropoffPoint} onChange={(e)=> setDropoffPoint(e.target.value)} variant="outlined" margin="dense"/>
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <IconButton size="small" onClick={handleCancelEditDetails} color="warning" disabled={isSavingDetails}><CancelIcon fontSize="inherit"/></IconButton>
                                  <IconButton size="small" onClick={() => handleSaveDetails(value.id)} color="success" disabled={isSavingDetails}>{isSavingDetails ? <CircularProgress size={16} color="inherit"/> :<SaveIcon fontSize="inherit"/>}</IconButton>
                              </Stack>
                         </Stack>
                     ) : (
                          // --- Standard Display ---
                          <ListItemText
                                id={labelId}
                                primary={name ?? '...'} // Display corrected name
                                secondary={isAssignable ? govId || '-' : `الصعود: ${value.pickup_point || '-'} | النزول: ${value.dropoff_point || '-'}`}
                                sx={{ textAlign: 'right', mr: 1 }}
                          />
                     );

                    return (
                        <ListItem
                            key={id} role="listitem" button onClick={handleToggle(value)}
                            disabled={isProcessingAssign || isProcessingUnassign || isSavingDetails}
                            secondaryAction={!isAssignable && !isBeingEdited ? (
                                 <Tooltip title="تعديل نقاط الصعود/النزول">
                                      <IconButton edge="end" size="small" onClick={(e) => { e.stopPropagation(); handleEditDetails(value); }}>
                                         <EditIcon fontSize="inherit" />
                                      </IconButton>
                                 </Tooltip>
                            ) : null}
                            sx={{bgcolor: isBeingEdited ? 'action.selected' : 'inherit'}}
                         >
                             <ListItemIcon sx={{ minWidth: 'auto' }}>
                                 <Checkbox
                                     checked={isChecked} tabIndex={-1} disableRipple
                                     inputProps={{ 'aria-labelledby': labelId }} size="small"
                                     edge="start"
                                     disabled={isBeingEdited}
                                 />
                             </ListItemIcon>
                              {assignedItemContent}
                        </ListItem>
                    );
                })}
                 {/* Empty/Loading States */}
                 {items.length === 0 && !loadingAssignments && !loadingAssignable && (
                    <ListItem>
                        <ListItemText primary="-- لا يوجد طلاب --" sx={{textAlign:'center', color:'text.disabled', py: 2}} />
                    </ListItem>
                 )}
                  {(loadingAssignments || loadingAssignable) && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                          <CircularProgress size={24} />
                      </Box>
                  )}
            </List>
        </Paper>
    );

    // --- Render ---
    if (!route || !academicYear) return null; // Check both props

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" dir="rtl"> {/* Added RTL */}
            <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
                 إدارة تسجيل الطلاب للمسار: {route.name}
                 <Typography variant="body2" color="text.secondary" gutterBottom>
                      للعام الدراسي المحدد ({academicYear?.name ?? '...'})
                 </Typography>
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

                <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
                    {/* Left List (Available) */}
                    <Grid item>{customList('الطلاب المتاحون للتسجيل', left)}</Grid>
                    {/* Transfer Buttons */}
                    <Grid item>
                        <Grid container direction="column" alignItems="center">
                            <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleAssignChecked} disabled={leftChecked.length === 0 || isProcessingAssign || isProcessingUnassign} aria-label="Assign selected">
                                {isProcessingAssign ? <CircularProgress size={18} /> : <ArrowForward />} {/* Assign right */}
                            </Button>
                            <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleUnassignChecked} disabled={rightChecked.length === 0 || isProcessingAssign || isProcessingUnassign} aria-label="Unassign selected">
                                {isProcessingUnassign ? <CircularProgress size={18} /> : <ArrowBack />} {/* Unassign left */}
                            </Button>
                        </Grid>
                    </Grid>
                    {/* Right List (Assigned) */}
                    <Grid item>{customList('الطلاب المسجلون بالمسار', right)}</Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit">إغلاق</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignStudentDialog;