// src/components/students/studentForm/StudentForm.tsx
import { useForm, FormProvider, } from "react-hook-form";
import { Student, EducationLevel, Gender } from "@/types/student";
import { Tabs, Tab, Box, Button, Typography, CircularProgress, Alert } from "@mui/material"; // Changed Grid2 to Grid, added CircularProgress, Alert
import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import { StudentInfoTab } from "./StudentTabs/StudentInfoTab";
import { FatherInfoTab } from "./StudentTabs/FatherInfoTab";
import { MotherInfoTab } from "./StudentTabs/MotherInfoTab";
import { AdditionalInfoTab } from "./StudentTabs/AdditionalInfoTab";
// Removed: import axiosClient from "@/axios-client"; // Use store actions instead
import dayjs from "dayjs";
import { useStudentStore } from "@/stores/studentStore";
import { useSnackbar } from "notistack";

// Keep initial state for create mode and form structure reference
const initialStudentState:Omit<Student,'id'|'created_at'|'updated_at'> = {
  student_name: "",
  father_name: "",
  father_job: "",
  father_address: "",
  father_phone: "",
  father_whatsapp: null, // Use null for optional fields
  mother_name: "",
  mother_job: "",
  mother_address: "",
  mother_phone: "",
  mother_whatsapp: null, // Use null for optional fields
  email: null, // Use null for optional fields
  date_of_birth: dayjs().subtract(5, 'year').format("YYYY-MM-DD"), // Default to a reasonable past date
  gender: Gender.Male,
  closest_name: null,
  closest_phone: null,
  referred_school: null,
  success_percentage: null,
  medical_condition: null,
  other_parent: "", // Keep as string if conditionally required, or use null
  relation_of_other_parent: "",
  relation_job: "",
  relation_phone: "",
  relation_whatsapp: "",
  image: null, // Use null for optional fields
  approved: false,
  // approve_date: null, // This is likely set by backend
  approved_by_user: null,
  message_sent: false,
  goverment_id: "", // Keep as string if conditionally required, or use null
  wished_level: EducationLevel.Primary,
};

// LocalStorage key (consider if still needed, might conflict with edit)
// const localStorageKey = "studentFormData";

export const StudentForm = () => {
  const { id } = useParams<{id:string}>(); // Get ID from URL
  const navigate = useNavigate();
  const studentId = id ? parseInt(id, 10) : undefined;
  const isEditMode = !!studentId;
  const methods = useForm<Student>({ // Use Student type directly
    defaultValues: initialStudentState, // Start with initial state
  });

  const {
    createStudent,
    updateStudent,
    getStudentById,
    currentStudent,
    loading: studentStoreLoading, // Renamed to avoid conflict
    resetCurrentStudent
  } = useStudentStore();

  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false); // Loading state for fetching

  // --- Fetch data on mount if in edit mode ---
  useEffect(() => {
    if (isEditMode && studentId) {
      const fetchData = async () => {
        setIsFetchingData(true);
        // Clear previous student data before fetching new one
        resetCurrentStudent();
        await getStudentById(studentId);
        setIsFetchingData(false);
      };
      fetchData();
    } else {
        // If in create mode, potentially load from localStorage or reset fully
        // For simplicity now, just ensure form is reset to initial defaults
        methods.reset(initialStudentState); 
        
      
    }

    // Cleanup on unmount or if ID changes (less likely for edit)
    return () => {
       resetCurrentStudent(); // Clear student data from store on unmount
    };
  }, [studentId, isEditMode, getStudentById, methods, resetCurrentStudent]); // Added resetCurrentStudent
  // console.log(methods,'methods')
  // for(let key in methods.formState.defaultValues){
    
  //   console.log(key)
  // }
  
  // --- Populate form once data is fetched in edit mode ---
  useEffect(() => {
    // Only reset form if in edit mode AND currentStudent data is available
    if (isEditMode && currentStudent && currentStudent.id === studentId) {
        // Ensure date is in correct format if needed, but reset usually handles it
        // If date_of_birth from backend is already 'YYYY-MM-DD', this is fine
        methods.reset(currentStudent);
    }
  }, [currentStudent, isEditMode, methods, studentId]);

  console.log(methods.formState.errors)
  // --- Handle form submission (Create or Update) ---
  const onSubmit = async (data: Student) => { // data will have full Student structure from form
    setIsSubmitting(true);
    try {
      if (isEditMode && studentId) {
        // Call updateStudent action - pass only changed fields if desired,
        // or pass the whole `data` object if your backend handles partial updates
        // For simplicity, passing the whole data object retrieved from the form
        await updateStudent(studentId, data); // Make sure updateStudent accepts partial data or full object
        enqueueSnackbar('تم تحديث بيانات الطالب بنجاح', { variant: 'success' });
        navigate(`/students/${studentId}`); // Navigate to view page after update
      } else {
        // Call createStudent action
        // Exclude fields that shouldn't be sent on creation if necessary
        const createData: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'approve_date'> = data;
        const createdStudent = await createStudent(createData); // createStudent should return the new student with ID
        navigate('../list')
        enqueueSnackbar('تم إضافة الطالب بنجاح', { variant: 'success' });
        methods.reset(initialStudentState); // Clear form after successful creation
        setActiveTab(0); // Go back to first tab
        // Optionally navigate to the new student's view page:
        // if (createdStudent && createdStudent.id) {
        //   navigate(`/students/${createdStudent.id}`);
        // } else {
        //   navigate('/students/list'); // Fallback navigation
        // }
      }
    } catch (error) {
      enqueueSnackbar(isEditMode ? 'حدث خطأ أثناء تحديث البيانات' : 'حدث خطأ أثناء إضافة الطالب', { variant: 'error' });
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Loading and Error States during initial data fetch ---
  if (isFetchingData || (isEditMode && studentStoreLoading && !currentStudent)) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>جار تحميل بيانات الطالب...</Typography>
          </Box>
      );
  }

  // if (isEditMode && studentStoreError) {
  //     return (
  //         <Alert severity="error" sx={{ m: 3 }}>
  //             حدث خطأ أثناء تحميل بيانات الطالب: {studentStoreError}
  //         </Alert>
  //     );
  // }

  if (isEditMode && !studentStoreLoading && !currentStudent && !isFetchingData) {
       // If finished loading/fetching in edit mode but no student found
       return (
            <Alert severity="warning" sx={{ m: 3 }}>
                لم يتم العثور على الطالب المحدد بالمعرف: {studentId}.
            </Alert>
       );
  }

  // --- Render the Form ---
  return (
    <FormProvider {...methods}>
      {/* Add a title indicating Create or Edit */}
      <Typography variant="h5" gutterBottom sx={{ p: 2, textAlign: 'center' }}>
        {isEditMode ? `تعديل بيانات الطالب: ${currentStudent?.student_name || ''}` : 'إضافة طالب جديد'}
      </Typography>

      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable" // Make tabs scrollable on smaller screens
          scrollButtons="auto"  // Show scroll buttons automatically
          allowScrollButtonsMobile
        >
          <Tab label="معلومات الطالب" />
          <Tab label="معلومات الأب" />
          <Tab label="معلومات الأم" />
          <Tab label="معلومات ولي الامر الاخر" />
          {/* <Tab label="تأكيد وحفظ" /> */} {/* Confirm tab maybe less useful now? */}
        </Tabs>

        <Box sx={{ p: 3, border: '1px solid #ddd', borderTop: 0, borderRadius: '0 0 4px 4px' }}>
          {activeTab === 0 && <StudentInfoTab />}
          {activeTab === 1 && <FatherInfoTab />}
          {activeTab === 2 && <MotherInfoTab />}
          {activeTab === 3 && <AdditionalInfoTab />}
          {/* {activeTab === 4 && <ConfirmTab errors={methods.formState.errors} />} */} {/* Pass errors if using ConfirmTab */}
        </Box>

        {/* Error Summary (Optional but helpful) */}
        {Object.keys(methods.formState.errors).length > 0 && ( // Don't show if on confirm tab maybe
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              يرجى مراجعة الأخطاء التالية:
            </Typography>
            <ul style={{ paddingRight: '20px' }}> {/* Basic list styling */}
              {Object.entries(methods.formState.errors).map(([key, error]) => (
                <li key={key}>
                  <Typography color="error" variant="body2">
                    - {error?.message} ({key}) {/* Show field name for easier debugging */}
                  </Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Navigation and Submit Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, p: 2 }}>
          <Button
            variant="outlined"
            disabled={activeTab === 0}
            onClick={() => setActiveTab(activeTab - 1)}
          >
            السابق
          </Button>

           {/* Submit Button - Always visible */}
           <Button
             type="submit"
             variant="contained"
             color="primary"
             disabled={isSubmitting || studentStoreLoading} // Disable during submission or fetch
           >
             {isSubmitting ? <CircularProgress size={24} /> : (isEditMode ? 'حفظ التعديلات' : 'إضافة الطالب')}
           </Button>

          <Button
            variant="outlined"
            // type="button" // Ensure it's not submitting the form
            onClick={() => activeTab < 3 && setActiveTab(activeTab + 1)} // Adjust max tab index
            disabled={activeTab === 3} // Disable if on the last tab (index 3)
          >
             التالي
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

// Export the component - Ensure file structure matches import in App.tsx
// Assuming this file is src/components/students/studentForm/StudentForm.tsx
// No default export needed if it's named export like 'export const StudentForm'