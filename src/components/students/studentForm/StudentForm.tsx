// src/components/students/studentForm/StudentForm.tsx
import { useForm, FormProvider } from "react-hook-form";
import { Student, Gender } from "@/types/student";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { StudentInfoTab } from "./StudentTabs/StudentInfoTab";
import { FatherInfoTab } from "./StudentTabs/FatherInfoTab";
import { MotherInfoTab } from "./StudentTabs/MotherInfoTab";
import { AdditionalInfoTab } from "./StudentTabs/AdditionalInfoTab";
import dayjs from "dayjs";
import { useStudentStore } from "@/stores/studentStore";
import { useSnackbar } from "notistack";

// Keep initial state for create mode and form structure reference
const initialStudentState: Omit<Student, 'id' | 'created_at' | 'updated_at'> = {
  student_name: "",
  father_name: "",
  father_job: "",
  father_address: "",
  father_phone: "",
  father_whatsapp: null,
  mother_name: "",
  mother_job: "",
  mother_address: "",
  mother_phone: "",
  mother_whatsapp: null,
  email: null,
  date_of_birth: dayjs().subtract(5, 'year').format("YYYY-MM-DD"),
  gender: Gender.Male,
  closest_name: null,
  closest_phone: null,
  referred_school: null,
  success_percentage: null,
  medical_condition: null,
  other_parent: "",
  relation_of_other_parent: "",
  relation_job: "",
  relation_phone: "",
  relation_whatsapp: "",
  image: null,
  approved: false,
  approved_by_user: null,
  message_sent: false,
  goverment_id: "",
  wished_school: null,
};

// LocalStorage key (consider if still needed, might conflict with edit)
// const localStorageKey = "studentFormData";

export const StudentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = id ? parseInt(id, 10) : undefined;
  const isEditMode = !!studentId;
  const methods = useForm<Student>({
    defaultValues: initialStudentState,
  });

  const {
    createStudent,
    updateStudent,
    getStudentById,
    currentStudent,
    loading: studentStoreLoading,
    resetCurrentStudent
  } = useStudentStore();

  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState("student-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Fetch data on mount if in edit mode
  useEffect(() => {
    if (isEditMode && studentId) {
      const fetchData = async () => {
        setIsFetchingData(true);
        resetCurrentStudent();
        await getStudentById(studentId);
        setIsFetchingData(false);
      };
      fetchData();
    } else {
      methods.reset(initialStudentState);
    }

    return () => {
      resetCurrentStudent();
    };
  }, [studentId, isEditMode, getStudentById, methods, resetCurrentStudent]);

  // Populate form once data is fetched in edit mode
  useEffect(() => {
    if (isEditMode && currentStudent && currentStudent.id === studentId) {
      methods.reset(currentStudent);
    }
  }, [currentStudent, isEditMode, methods, studentId]);
  
  // Handle form submission (Create or Update)
  const onSubmit = async (data: Student) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && studentId) {
        await updateStudent(studentId, data);
        enqueueSnackbar('تم تحديث بيانات الطالب بنجاح', { variant: 'success' });
        navigate(`/students/${studentId}`);
      } else {
        const createData: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'approve_date'> = data;
        await createStudent(createData);
        navigate('../list');
        enqueueSnackbar('تم إضافة الطالب بنجاح', { variant: 'success' });
        methods.reset(initialStudentState);
        setActiveTab("student-info");
      }
    } catch (error) {
      enqueueSnackbar(isEditMode ? 'حدث خطأ أثناء تحديث البيانات' : 'حدث خطأ أثناء إضافة الطالب', { variant: 'error' });
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Loading and Error States during initial data fetch
  if (isFetchingData || (isEditMode && studentStoreLoading && !currentStudent)) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl" dir="rtl">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>جار تحميل بيانات الطالب...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditMode && !studentStoreLoading && !currentStudent && !isFetchingData) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl" dir="rtl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            لم يتم العثور على الطالب المحدد بالمعرف: {studentId}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tabItems = [
    { value: "student-info", label: "معلومات الطالب", shortLabel: "الطالب", component: <StudentInfoTab /> },
    { value: "father-info", label: "معلومات الأب", shortLabel: "الأب", component: <FatherInfoTab /> },
    { value: "mother-info", label: "معلومات الأم", shortLabel: "الأم", component: <MotherInfoTab /> },
    { value: "additional-info", label: "معلومات ولي الأمر الآخر", shortLabel: "ولي آخر", component: <AdditionalInfoTab /> },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl" dir="rtl">
      <Button className="mb-4" onClick={() => navigate(-1)}>الرجوع</Button>
      <FormProvider {...methods}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl text-center">
              {isEditMode ? `تعديل بيانات الطالب: ${currentStudent?.student_name || ''}` : 'إضافة طالب جديد'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Mobile: Vertical tabs list */}
                <div className="block sm:hidden">
                  <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
                    {tabItems.map((tab) => (
                      <TabsTrigger 
                        key={tab.value} 
                        value={tab.value} 
                        className="text-xs py-2 px-1 h-auto whitespace-nowrap"
                      >
                        {tab.shortLabel}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Desktop: Horizontal tabs list */}
                <div className="hidden sm:block">
                  <TabsList className="grid w-full grid-cols-4 h-auto">
                    {tabItems.map((tab) => (
                      <TabsTrigger 
                        key={tab.value} 
                        value={tab.value} 
                        className="text-sm py-3 px-2 h-auto"
                      >
                        <span className="hidden md:inline">{tab.label}</span>
                        <span className="md:hidden">{tab.shortLabel}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {tabItems.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value} className="mt-4 sm:mt-6">
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        {tab.component}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Error Summary */}
              {Object.keys(methods.formState.errors).length > 0 && (
                <Alert variant="destructive" className="mt-4 sm:mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">يرجى مراجعة الأخطاء التالية:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(methods.formState.errors).map(([key, error]) => (
                        <li key={key} className="text-sm">
                          {error?.message} ({key})
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Navigation and Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  disabled={activeTab === "student-info"}
                  onClick={() => {
                    const currentIndex = tabItems.findIndex(tab => tab.value === activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabItems[currentIndex - 1].value);
                    }
                  }}
                  className="w-full sm:w-auto order-1 sm:order-1"
                >
                  السابق
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || studentStoreLoading}
                  className="w-full sm:w-auto min-w-32 order-3 sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جار الحفظ...
                    </>
                  ) : (
                    isEditMode ? 'حفظ التعديلات' : 'إضافة الطالب'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = tabItems.findIndex(tab => tab.value === activeTab);
                    if (currentIndex < tabItems.length - 1) {
                      setActiveTab(tabItems[currentIndex + 1].value);
                    }
                  }}
                  disabled={activeTab === "additional-info"}
                  className="w-full sm:w-auto order-2 sm:order-3"
                >
                  التالي
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </FormProvider>
    </div>
  );
};

// Export the component - Ensure file structure matches import in App.tsx
// Assuming this file is src/components/students/studentForm/StudentForm.tsx
// No default export needed if it's named export like 'export const StudentForm'