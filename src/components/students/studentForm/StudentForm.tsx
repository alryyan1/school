import { useForm, FormProvider } from "react-hook-form";
import { EducationLevel, Gender, Student } from "@/types/student";
import { Tabs, Tab, Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { StudentInfoTab } from "./StudentTabs/StudentInfoTab";
import { FatherInfoTab } from "./StudentTabs/FatherInfoTab";
import { MotherInfoTab } from "./StudentTabs/MotherInfoTab";
import { AdditionalInfoTab } from "./StudentTabs/AdditionalInfoTab";
import axiosClient from "@/axios-client";
import dayjs from "dayjs";

const localStorageKey = "studentFormData"
;

const initialStudentState: Omit<Student, "id" | "created_at" | "updated_at"|"aproove_date"> = {
  student_name: "",
  father_name: "",
  father_job: "",
  father_address: "",
  father_phone: "",
  father_whatsapp: "",
  mother_name: "",
  mother_job: "",
  mother_address: "",
  mother_phone: "",
  mother_whatsapp: "",
  email: "",
  date_of_birth: dayjs().format("YYYY-MM-DD"),
  gender: Gender.Male,
  closest_name: "",
  closest_phone: "",
  referred_school: "",
  success_percentage: "",
  medical_condition: "",
  other_parent: "",
  relation_of_other_parent: "",
  relation_job: "",
  relation_phone: "",
  relation_whatsapp: "",
  image: "",
  approved: false,
  approved_by_user: null,
  message_sent: false,
  goverment_id: "",
  wished_level: EducationLevel.Primary,
};

export const StudentForm = ({
  initialData,
}: {
  initialData?: Partial<Student>;
}) => {
  const methods = useForm({
    defaultValues: initialData
  });


  const [activeTab, setActiveTab] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<Omit<Student, "id" | "created_at" | "updated_at">>({
    defaultValues: initialStudentState,
    mode: "onBlur",
  });

  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());

  useEffect(() => {
    const storedData = localStorage.getItem(localStorageKey);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        Object.keys(parsedData).forEach((key) => {
          setValue(key as any, parsedData[key]);
        });
        setValue("date_of_birth", parsedData.date_of_birth);
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
        clearLocalStorageAndForm();
      }
    }
  }, [setValue]);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(watch()));
  }, [watch()]);

  const clearLocalStorageAndForm = () => {
    localStorage.removeItem(localStorageKey);
    reset(initialStudentState);
    setActiveTab(0);
  };

  const onSubmit = async (
    data: Omit<Student, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const response = await axiosClient.post("/students", data);
      console.log("Student created:", response.data);
      clearLocalStorageAndForm();
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab label="معلومات الطالب" />
          <Tab label="معلومات الأب" />
          <Tab label="معلومات الام" />
          <Tab label="معلومات اضافيه" />

          {/* Other tabs */}
        </Tabs>

        <Box mt={3}>
          {activeTab === 0 && <StudentInfoTab />}
          {activeTab === 1 && <FatherInfoTab />}
          {activeTab === 2 && <MotherInfoTab />}
          {activeTab === 3 && <AdditionalInfoTab />}
          {/* Other tab panels */}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button
            disabled={activeTab === 0}
            onClick={() => setActiveTab(activeTab - 1)}
          >
            السابق
          </Button>
          <Button
            type={activeTab === 4 ? "submit" : "button"}
            onClick={() => activeTab < 4 && setActiveTab(activeTab + 1)}
          >
            {activeTab === 4 ? "إرسال" : "التالي"}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};
