// src/pages/settings/SchoolGradeLevelManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Container, Typography, CircularProgress, Alert, Paper,
    FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel,
    Checkbox, Stack, SelectChangeEvent, Divider,
    Grid
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useSchoolStore } from '@/stores/schoolStore';
import { useGradeLevelStore } from '@/stores/gradeLevelStore';
import { SchoolApi } from '@/api/schoolApi'; // Direct API call for simplicity
import { GradeLevel } from '@/types/gradeLevel';
import { useSnackbar } from 'notistack';

const SchoolGradeLevelManager: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();

    // --- State ---
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | ''>('');
    const [assignedGradeLevelIds, setAssignedGradeLevelIds] = useState<number[]>([]); // IDs assigned to selected school
    const [checkedGradeLevelIds, setCheckedGradeLevelIds] = useState<number[]>([]); // IDs currently checked in UI
    const [loadingAssigned, setLoadingAssigned] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // --- Data from Stores ---
    const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
    const { gradeLevels, fetchGradeLevels, loading: gradeLevelsLoading } = useGradeLevelStore();

    // --- Effects ---
    // Fetch initial school and grade level lists
    useEffect(() => {
        fetchSchools();
        fetchGradeLevels();
    }, [fetchSchools, fetchGradeLevels]);

    // Fetch assigned grades when a school is selected
    const fetchAssigned = useCallback(async (schoolId: number) => {
        setLoadingAssigned(true);
        setError(null);
        try {
            const response = await SchoolApi.getAssignedGradeLevels(schoolId);
            const assignedIds = response.data.data.map(gl => gl.id);
            setAssignedGradeLevelIds(assignedIds);
            setCheckedGradeLevelIds(assignedIds); // Sync checkboxes with fetched data
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل تحميل المراحل المعينة للمدرسة');
            setAssignedGradeLevelIds([]);
            setCheckedGradeLevelIds([]);
        } finally {
            setLoadingAssigned(false);
        }
    }, []); // useCallback ensures function identity is stable

    useEffect(() => {
        if (selectedSchoolId) {
            fetchAssigned(selectedSchoolId);
        } else {
            // Clear when no school is selected
            setAssignedGradeLevelIds([]);
            setCheckedGradeLevelIds([]);
            setError(null);
        }
    }, [selectedSchoolId, fetchAssigned]);

    // --- Handlers ---
    const handleSchoolChange = (event: SelectChangeEvent<number>) => {
        setSelectedSchoolId(event.target.value as number | '');
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = parseInt(event.target.value, 10);
        const isChecked = event.target.checked;
        setCheckedGradeLevelIds(prev =>
            isChecked ? [...prev, id] : prev.filter(checkedId => checkedId !== id)
        );
    };

    const handleSelectAll = () => {
        setCheckedGradeLevelIds(gradeLevels.map(gl => gl.id));
    }
    const handleDeselectAll = () => {
        setCheckedGradeLevelIds([]);
    }

    const handleSaveChanges = async () => {
        if (!selectedSchoolId) return;
        setIsSaving(true);
        setError(null);
        try {
            await SchoolApi.updateAssignedGradeLevels(selectedSchoolId, checkedGradeLevelIds);
            // Update the 'assigned' state to match the saved state for immediate UI feedback
            setAssignedGradeLevelIds(checkedGradeLevelIds);
            enqueueSnackbar('تم حفظ تعيينات المراحل بنجاح', { variant: 'success' });
        } catch (err: any) {
             setError(err.response?.data?.message || 'فشل حفظ التغييرات');
             enqueueSnackbar(error || 'فشل حفظ التغييرات', { variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    // Determine if changes have been made
    const hasChanges = JSON.stringify([...assignedGradeLevelIds].sort()) !== JSON.stringify([...checkedGradeLevelIds].sort());

    // --- Render ---
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }} dir="rtl">
            <Typography variant="h4" component="h1" gutterBottom>
                تعيين المراحل الدراسية للمدارس
            </Typography>

            <Paper elevation={2} sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* School Selector */}
                    <Grid item xs={12}>
                        <FormControl fullWidth error={!selectedSchoolId && isSaving} required> {/* Indicate error if trying to save without school */}
                            <InputLabel id="manage-grades-school-label">اختر المدرسة *</InputLabel>
                            <Select
                                labelId="manage-grades-school-label"
                                label="اختر المدرسة *"
                                value={selectedSchoolId}
                                onChange={handleSchoolChange}
                                disabled={schoolsLoading || isSaving}
                            >
                                <MenuItem value="" disabled><em>-- اختر المدرسة --</em></MenuItem>
                                {schoolsLoading ? <MenuItem disabled><em>جاري التحميل...</em></MenuItem> :
                                 schools.map(school => <MenuItem key={school.id} value={school.id}>{school.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Divider */}
                    <Grid item xs={12}> <Divider sx={{ my: 1 }} /> </Grid>

                    {/* Grade Level Checkboxes (shown only when school selected) */}
                    {selectedSchoolId && (
                        <Grid item xs={12}>
                             <Typography variant="h6" gutterBottom>المراحل المتاحة لهذه المدرسة:</Typography>
                             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                             {(loadingAssigned || gradeLevelsLoading) && <Box sx={{ my: 2 }}><CircularProgress size={24} /></Box>}

                             {!loadingAssigned && !gradeLevelsLoading && (
                                 <>
                                     <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
                                          <Button size="small" onClick={handleSelectAll} disabled={isSaving}>تحديد الكل</Button>
                                          <Button size="small" onClick={handleDeselectAll} disabled={isSaving}>إلغاء تحديد الكل</Button>
                                     </Box>
                                     <FormGroup>
                                         <Grid container spacing={1}>
                                             {gradeLevels
                                                 .sort((a,b) => a.id - b.id) // Sort by ID for consistent order
                                                 .map((gradeLevel) => (
                                                     <Grid item xs={12} sm={6} md={4} key={gradeLevel.id}>
                                                         <FormControlLabel
                                                             control={
                                                                 <Checkbox
                                                                     checked={checkedGradeLevelIds.includes(gradeLevel.id)}
                                                                     onChange={handleCheckboxChange}
                                                                     value={gradeLevel.id}
                                                                     disabled={isSaving}
                                                                     icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                                                     checkedIcon={<CheckBoxIcon fontSize="small" />}
                                                                     size="small"
                                                                 />
                                                             }
                                                             label={`${gradeLevel.name} (${gradeLevel.code})`}
                                                         />
                                                     </Grid>
                                                 ))}
                                         </Grid>
                                     </FormGroup>
                                 </>
                             )}
                        </Grid>
                    )}

                    {/* Save Button */}
                    {selectedSchoolId && !loadingAssigned && !gradeLevelsLoading && (
                        <Grid item xs={12} sx={{ mt: 2, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveChanges}
                                disabled={!hasChanges || isSaving}
                                sx={{ minWidth: 150 }}
                            >
                                {isSaving ? <CircularProgress size={24} color="inherit" /> : 'حفظ التغييرات'}
                            </Button>
                        </Grid>
                    )}

                </Grid>
            </Paper>
        </Container>
    );
};

export default SchoolGradeLevelManager;