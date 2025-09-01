import ClassroomCard from "@/components/explorer/ClassroomCard";
import { useClassroomStore } from "@/stores/classroomStore";
import { useGradeLevelStore } from "@/stores/gradeLevelStore";
// Removed useSettingsStore import
import { ArrowBack } from "@mui/icons-material";
import { Container, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";

function GradeLevelClassroomListPage() {
  const { schoolId, gradeLevelId } = useParams<{
    schoolId: string;
    gradeLevelId: string;
  }>();
  console.log(schoolId, gradeLevelId, "school id and grade level id");
  // Removed useSettingsStore - implement your preferred state management
  const { classrooms, fetchClassrooms, loading ,clearClassrooms} = useClassroomStore(); // To get classrooms
  const { gradeLevels, fetchGradeLevels } = useGradeLevelStore(); // To get classrooms
  useEffect(() => {
    // Fetch classrooms for this school and the active year
    if (schoolId && gradeLevelId) {
      fetchGradeLevels(
      
      ); // Fetch grade levels for the school
      fetchClassrooms({
        school_id: Number(schoolId),
        grade_level_id: Number(gradeLevelId),
        active_academic_year_id: activeAcademicYearId,
      });
    }
   return ()=>{
    clearClassrooms()
    }
  }, [schoolId, gradeLevelId, fetchClassrooms, activeAcademicYearId,fetchGradeLevels]); // Fetch classrooms when schoolId or gradeLevelId changes
  console.log(classrooms, "classrooms"); // Debugging line
  console.log(classrooms, "classrooms"); // Debugging line
  return <Container className="">
    <div className="flex justify-between items-center my-4">
      <Typography variant="h4" className="text-center text-muted-foreground my-4">
        {`قائمة الفصول  - ${gradeLevels.find((gradeLevel) => gradeLevel.id === Number(gradeLevelId))?.name}`}
      </Typography>
      <NavLink to={`/schools-explorer/${schoolId}/gradelevels`}><ArrowBack/></NavLink>
    </div>
    
    <div className="bg-gray-50 grid grid-cols-1 gap-4 md:grid-rows-2 sm:grid-cols-1  lg:grid-cols-3 xl:grid-cols-4 p-4">
    {
         classrooms.map((classroom) => {
            return (
              <ClassroomCard
                schoolId={schoolId}
                classroom={classroom}
                key={classroom.id}
              />
            );
          })
    }
    </div>
   
  </Container>
}

export default GradeLevelClassroomListPage;
