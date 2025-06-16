// src/pages/explorer/SchoolClassroomListPage.tsx
import React, { act, useCallback, useEffect, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSchoolStore } from "@/stores/schoolStore"; // To get school name maybe
import { useClassroomStore } from "@/stores/classroomStore"; // To get classrooms
import { useSettingsStore } from "@/stores/settingsStore"; // To get active year
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SchoolApi } from "@/api/schoolApi";
import { useSnackbar } from "notistack";
import ClassroomCard from "@/components/explorer/ClassroomCard";
import { ArrowRight } from "lucide-react";
import { Paper, Typography } from "@mui/material";
import { GradeLevel } from "@/types/gradeLevel";


const SchoolClassroomListPage: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { schools } = useSchoolStore(); // Get specific school details
  const { classrooms, fetchClassrooms, loading } = useClassroomStore();
  const { enqueueSnackbar } = useSnackbar(); // For notifications
  const [loadingGradeLevels, setLoadingGradeLevels] = useState(false); // Loading state for grade levels
  const [availableGradeLevels, setAvailableGradeLevels] = useState<GradeLevel[]>([]); // State for available grade levels
  const { activeAcademicYearId, activeSchoolId } = useSettingsStore(); // Get active year
  console.log(availableGradeLevels, "available grade levels"); // Debugging line
  console.log(
    activeAcademicYearId,
    activeSchoolId,
    "activeAcademiyYear",
    "active school id"
  ); // Debugging line
  const school = schools.find((s) => s.id === Number(schoolId)); // Find school from store
  // console.log(gradeLevels,'grade levels'); // Debugging line
  // Fetch Grade Levels SPECIFIC TO THE SELECTED SCHOOL
  const fetchSchoolGrades = useCallback(
    async (schoolId: number) => {
      setLoadingGradeLevels(true);
      try {
        const response = await SchoolApi.getAssignedGradeLevels(schoolId);
        setAvailableGradeLevels(response.data.data); // Assuming response wraps in 'data'
      } catch (err) {
        console.error("Failed to fetch grade levels for school", err);
        enqueueSnackbar("فشل تحميل المراحل الدراسية لهذه المدرسة", {
          variant: "error",
        });
        setAvailableGradeLevels([]); // Clear on error
      } finally {
        setLoadingGradeLevels(false);
      }
    },
    [enqueueSnackbar]
  );
  useEffect(() => {
    // Fetch classrooms for this school and the active year
    if (schoolId && activeAcademicYearId) {
    fetchSchoolGrades(Number(schoolId)); // Fetch grade levels for the school
      // fetchClassrooms({
      //   school_id: Number(schoolId),
      //   active_academic_year_id: activeAcademicYearId,
      // });
      // fetchGradeLevels()
    } else if (schoolId && !activeAcademicYearId) {
      console.warn("Active Academic Year not set in settings!"); // Handle missing active year
      // Optionally show an error or prompt user
    }
    // Fetch specific school details if not already loaded in store? Optional.
    // if (schoolId && !school) getSchoolById(Number(schoolId));
  }, [schoolId, activeAcademicYearId, fetchClassrooms,fetchSchoolGrades]); // Removed getSchoolById dependency for simplicity
  console.log(classrooms, "classrooms"); // Debugging line
  return (
    <section
      className="min-h-[calc(100vh-64px)] w-full py-6 px-4 md:py-8 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800"
      dir="rtl"
    >
      <div className="container max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-10 flex items-center justify-between"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-blue-400">
            الفصول الدراسية - {school?.name ?? "..."}
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/schools-explorer")}
          >
            <ArrowRight className="ml-2 h-4 w-4" /> العودة للمدارس
          </Button>
        </motion.div>

        {!activeAcademicYearId && (
          <Alert variant="destructive" className="mb-6">
            <p className="font-semibold">تنبيه:</p>
            <p>
              الرجاء تحديد العام الدراسي النشط في الإعدادات العامة لعرض الطلاب
              المسجلين بالفصول.
            </p>
          </Alert>
        )}

        {/* {!loading && classrooms.length > 0 && (
          <ClassroomCard schoolId={schoolId} classrooms={classrooms}/>
        )} */}

        {
            availableGradeLevels.map((gradeLevel) =>{
                return <Paper key={gradeLevel.id} elevation={3} className="p-4 mb-4 flex items-center justify-between">
                <Typography>{gradeLevel.name}</Typography>
                   {
                    
                        <RouterLink to={`/schools-explorer/${schoolId}/grade-levels/${gradeLevel.id}/classrooms`}>
                            <Button className="hover:cursor-pointer" variant="outline" size="sm">عرض الفصول الدراسية</Button>
                        </RouterLink>
                    
                   }
                </Paper>
            })
            
        }
      </div>
    </section>
  );
};
export default SchoolClassroomListPage;
