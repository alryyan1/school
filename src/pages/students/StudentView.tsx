// src/pages/students/StudentView.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Avatar,
    Chip,
    Button,
    useTheme,
    Container,
    Stack, // Use Stack for vertical layout
    IconButton, // For potential close button on alert
    styled, // For hidden file input
    LinearProgress // For upload progress
} from '@mui/material';
import {
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon,
    CloudUpload as UploadIcon,
    Close as CloseIcon // For alert
} from '@mui/icons-material';
import { useStudentStore } from '@/stores/studentStore';
import { imagesUrl } from '@/constants';
import { Gender } from '@/types/student';
import { useSnackbar } from 'notistack';

// Helper to display data or placeholder
const displayData = (data: string | number | null | undefined, placeholder = 'غير محدد', suffix = '') => {
    return data ? `${data}${suffix}` : placeholder;
};

// Styled component for hidden file input
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

// Simple component for displaying info items consistently
const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={4} sm={3}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                {label}:
            </Typography>
        </Grid>
        <Grid item xs={8} sm={9}>
            {typeof value === 'string' || typeof value === 'number' ? (
                <Typography variant="body1">{value}</Typography>
            ) : (
                value // Render components like Chip directly
            )}
        </Grid>
    </Grid>
);

const StudentView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

    const {
        currentStudent,
        loading,
        error: storeError, // Rename to avoid conflict
        getStudentById,
        resetCurrentStudent,
        updateStudentPhoto // Get the new action
    } = useStudentStore();

    // State for photo upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        const studentId = parseInt(id ?? '', 10);
        if (!isNaN(studentId)) {
            getStudentById(studentId);
        } else {
            console.error("Invalid Student ID provided in URL");
        }
        return () => resetCurrentStudent();
    }, [id, getStudentById, resetCurrentStudent]);

    // Clear upload state if student changes
    useEffect(() => {
         setSelectedFile(null);
         setIsUploading(false);
         setUploadError(null);
    }, [currentStudent]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            // Basic validation (optional: add size/type check here)
             if (file.size > 2 * 1024 * 1024) { // Max 2MB example
                 setUploadError("حجم الملف كبير جداً (الحد الأقصى 2 ميجا).");
                 setSelectedFile(null);
                 if(fileInputRef.current) fileInputRef.current.value = ''; // Reset input
                 return;
             }
            setSelectedFile(file);
            setUploadError(null); // Clear previous error
        } else {
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !currentStudent) return;

        setIsUploading(true);
        setUploadError(null);
        const success = await updateStudentPhoto(currentStudent.id, selectedFile);
        setIsUploading(false);

        if (success) {
            enqueueSnackbar('تم تحديث صورة الطالب بنجاح', { variant: 'success' });
            setSelectedFile(null); // Clear selection
            if(fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            // No need to refetch, store update should trigger re-render with new image
        } else {
            // Error message is set in the store action or defaults here
            setUploadError(useStudentStore.getState().error || 'فشل رفع الصورة. حاول مرة أخرى.');
            // enqueueSnackbar(useStudentStore.getState().error || 'فشل رفع الصورة', { variant: 'error' });
        }
    };


    // --- Render Logic ---
    if (loading && !currentStudent) { // Show loading only on initial load
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress size={40} /></Box>;
    }
    if (storeError) {
        return <Container sx={{mt: 4}}><Alert severity="error">{storeError}</Alert></Container>;
    }
    if (!currentStudent) {
        return <Container sx={{mt: 4}}><Alert severity="info">لم يتم العثور على بيانات الطالب.</Alert></Container>;
    }

    const studentName = currentStudent.student_name || "الطالب";
    // Use photo_url from the resource for immediate display
    const imageUrl = currentStudent.image_url;
    // Preview selected file if it exists
    const imagePreviewUrl = selectedFile ? URL.createObjectURL(selectedFile) : imageUrl;
    console.log(imagePreviewUrl,'imagePreviewUrl',currentStudent,'current student',`${imagesUrl}${imagePreviewUrl }`)

    return (
        <Container style={{direction:'rtl'}} maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: `0 4px 12px ${theme.palette.action.hover}` }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                        ملف الطالب: {studentName}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<ArrowBackIcon />} component={RouterLink} to="/students/list">
                            القائمة
                        </Button>
                        <Button variant="contained" startIcon={<EditIcon />} component={RouterLink} to={`/students/${currentStudent.id}/edit`}>
                            تعديل
                        </Button>
                    </Stack>
                </Box>

                <Grid container spacing={4}>
                    {/* Image & Upload Section */}
                    <Grid item xs={12} md={3}>
                        <Stack spacing={2} alignItems="center">
                            <Avatar
                                src={`${imagePreviewUrl }`|| undefined} // Show preview or existing image
                                alt={studentName}
                                sx={{
                                    width: 160, height: 160,
                                    fontSize: '4rem',
                                    bgcolor: !imagePreviewUrl ? theme.palette.primary.light : undefined, // Show background only for placeholder
                                    border: `3px solid ${theme.palette.divider}`
                                }}
                            >
                                {!imagePreviewUrl && (studentName.charAt(0) || <PersonIcon fontSize="inherit" />)}
                            </Avatar>

                            {/* Hidden Input */}
                            <VisuallyHiddenInput
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/gif"
                                onChange={handleFileChange}
                            />

                             {/* Upload Button / Loading */}
                             <Button
                                component="label" // Makes the button trigger the hidden input
                                variant="contained"
                                startIcon={<UploadIcon />}
                                disabled={isUploading}
                                fullWidth
                                htmlFor="student-photo-upload" // Link to hidden input - ID needed on input
                                onClick={() => fileInputRef.current?.click()} // Trigger click programmatically
                             >
                                {isUploading ? 'جار الرفع...' : (selectedFile ? 'تأكيد الرفع' : 'تغيير الصورة')}
                                {/* Hidden input linked by component="label" */}
                                {/* <VisuallyHiddenInput id="student-photo-upload" type="file" accept="image/*" onChange={handleFileChange} /> */}
                             </Button>

                             {/* Conditionally show Upload button only if a file is selected */}
                              {selectedFile && !isUploading && (
                                 <Button
                                     variant="contained"
                                     color="primary"
                                     onClick={handleUpload}
                                     fullWidth
                                 >
                                     تأكيد رفع "{selectedFile.name.substring(0, 15)}..."
                                 </Button>
                              )}

                            {/* Show progress or error */}
                            {isUploading && <LinearProgress sx={{ width: '100%', mt: 1 }} />}
                            {uploadError && (
                                <Alert
                                    severity="error" sx={{ width: '100%', mt: 1 }}
                                    action={ <IconButton size="small" onClick={() => setUploadError(null)}><CloseIcon fontSize="inherit" /></IconButton> }
                                >
                                    {uploadError}
                                </Alert>
                            )}

                        </Stack>
                    </Grid>

                    {/* Details Section */}
                    <Grid item xs={12} md={9}>
                        <Stack spacing={3}> {/* Vertical spacing between sections */}
                            {/* Basic Info Section */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider', pb: 0.5 }}>المعلومات الأساسية</Typography>
                                <InfoItem label="الاسم الكامل" value={displayData(currentStudent.student_name)} />
                                <InfoItem label="تاريخ الميلاد" value={displayData(currentStudent.date_of_birth)} />
                                <InfoItem label="الجنس" value={<Chip label={displayData(currentStudent.gender)} size="small" color={currentStudent.gender === Gender.Male ? 'info' : 'secondary'} variant="outlined" />} />
                                <InfoItem label="المرحلة المرغوبة" value={<Chip label={displayData(currentStudent.wished_level)} size="small" variant="outlined" />} />
                                <InfoItem label="الرقم الوطني" value={displayData(currentStudent.goverment_id)} />
                                <InfoItem label="البريد الإلكتروني" value={displayData(currentStudent.email)} />
                                <InfoItem label="المدرسة السابقة" value={displayData(currentStudent.referred_school)} />
                                <InfoItem label="نسبة النجاح السابقة" value={displayData(currentStudent.success_percentage, undefined, '%')} />
                                <InfoItem label="الحالة الصحية" value={displayData(currentStudent.medical_condition)} />
                            </Box>

                            {/* Father Info Section */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider', pb: 0.5 }}>معلومات الأب</Typography>
                                <InfoItem label="اسم الأب" value={displayData(currentStudent.father_name)} />
                                <InfoItem label="الوظيفة" value={displayData(currentStudent.father_job)} />
                                <InfoItem label="الهاتف" value={displayData(currentStudent.father_phone)} />
                                <InfoItem label="واتساب" value={displayData(currentStudent.father_whatsapp)} />
                                <InfoItem label="العنوان" value={displayData(currentStudent.father_address)} />
                            </Box>

                            {/* Mother Info Section */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider', pb: 0.5 }}>معلومات الأم</Typography>
                                <InfoItem label="اسم الأم" value={displayData(currentStudent.mother_name)} />
                                <InfoItem label="الوظيفة" value={displayData(currentStudent.mother_job)} />
                                <InfoItem label="الهاتف" value={displayData(currentStudent.mother_phone)} />
                                <InfoItem label="واتساب" value={displayData(currentStudent.mother_whatsapp)} />
                                <InfoItem label="العنوان" value={displayData(currentStudent.mother_address)} />
                             </Box>

                            {/* Other Guardian Info Section (Only show if data exists) */}
                          
                                 <Box>
                                     <Typography variant="h6" sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider', pb: 0.5 }}>ولي الأمر الآخر</Typography>
                                     <InfoItem label="الاسم" value={displayData(currentStudent.other_parent)} />
                                     <InfoItem label="صلة القرابة" value={displayData(currentStudent.relation_of_other_parent)} />
                                     <InfoItem label="الوظيفة" value={displayData(currentStudent.relation_job)} />
                                     <InfoItem label="الهاتف" value={displayData(currentStudent.relation_phone)} />
                                     <InfoItem label="واتساب" value={displayData(currentStudent.relation_whatsapp)} />
                                 </Box>
                             


                            {/* Approval Status Section */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider', pb: 0.5 }}>حالة القبول</Typography>
                                <InfoItem label="الحالة" value={<Chip label={currentStudent.approved ? 'مقبول' : 'قيد المراجعة'} size="small" color={currentStudent.approved ? 'success' : 'warning'} variant="filled" />} />
                                <InfoItem label="تاريخ القبول" value={displayData(currentStudent.aproove_date)} />
                                <InfoItem label="تم القبول بواسطة (ID)" value={displayData(currentStudent.approved_by_user?.toString())} />
                                <InfoItem label="تم إرسال رسالة القبول" value={<Chip label={currentStudent.message_sent ? 'نعم' : 'لا'} size="small" color={currentStudent.message_sent ? 'success' : 'default'} variant="outlined" />} />
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default StudentView;