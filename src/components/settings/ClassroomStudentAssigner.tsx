// src/components/settings/ClassroomStudentAssigner.tsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

// lucide-react icons
import {
  Users,
  Loader2,
  AlertCircle,
  GripVertical,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useSchoolStore } from "@/stores/schoolStore";
import { useClassroomStore } from "@/stores/classroomStore";
import { useStudentEnrollmentStore } from "@/stores/studentEnrollmentStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { StudentAcademicYear } from "@/types/studentAcademicYear";
import { GradeLevel } from "@/types/gradeLevel"; // Ensure this type is correctly defined
import { Classroom } from "@/types/classroom";
import { SchoolApi } from "@/api/schoolApi";
import { useSnackbar } from "notistack";
import { Link, useNavigate } from "react-router-dom";

// Extended types for this component
interface ClassroomWithEnrollments extends Classroom {
  student_enrollments?: StudentAcademicYear[];
}

interface StudentWithImage {
  id: number;
  student_name: string;
  goverment_id?: string;
  image_url?: string;
}



const UNASSIGNED_STUDENTS_DROPPABLE_ID = "unassigned-students";

const ClassroomStudentAssigner: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const {
    activeSchoolId: defaultSchoolId,
    activeAcademicYear: defaultYear,
  } = useSettingsStore.getState();

  // --- Filters State ---
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | "">(
    defaultSchoolId ?? ""
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    defaultYear ?? "2024/2025"
  );
  const [selectedGradeId, setSelectedGradeId] = useState<number | "">("");

  // --- Data for Dropdowns ---
  const [availableGradeLevels, setAvailableGradeLevels] = useState<
    GradeLevel[]
  >([]);
  const [loadingSchoolSpecificGrades, setLoadingSchoolSpecificGrades] =
    useState<boolean>(false);

  // --- DND & List State ---
  const [unassignedListInternal, setUnassignedListInternal] = useState<
    StudentAcademicYear[]
  >([]);
  const [classroomMapInternal, setClassroomMapInternal] = useState<
    Record<string, StudentAcademicYear[]>
  >({});
  const [error] = useState<string | null>(null);

  // --- Store Data & Actions ---
  const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
  const { activeAcademicYear } = useSettingsStore();
  
  // Available academic years
  const availableAcademicYears = [
    "2024/2025",
    "2023/2024", 
    "2022/2023",
    "2021/2022",
    "2020/2021"
  ];

  const {
    classrooms,
    fetchClassrooms: fetchClassroomsFromStore,
    loading: classroomsLoading,
    clearClassrooms: clearClassroomStore,
  } = useClassroomStore();
  const {
    unassignedStudentsForGrade,
    loadingUnassigned,
    fetchUnassignedStudentsForGrade,
    assignStudentToClassroom,
    clearEnrollments: clearUnassignedStore,
  } = useStudentEnrollmentStore();

  // --- Effects ---
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const fetchSchoolSpecificGrades = useCallback(
    async (schoolId: number) => {
      setLoadingSchoolSpecificGrades(true);
      setAvailableGradeLevels([]);
      try {
        const response = await SchoolApi.getAssignedGradeLevels(schoolId);
        setAvailableGradeLevels(
          response.data.data?.sort((a, b) => a.id - b.id) ?? []
        );
      } catch (err) {
        console.error("Failed to fetch school grades", err);
        enqueueSnackbar("فشل تحميل مراحل المدرسة المختارة", {
          variant: "error",
        });
      } finally {
        setLoadingSchoolSpecificGrades(false);
      }
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    if (selectedSchoolId) {
      fetchSchoolSpecificGrades(selectedSchoolId);
      if (selectedYear && selectedGradeId) {
        fetchUnassignedStudentsForGrade({
          school_id: selectedSchoolId,
          academic_year: selectedYear,
          grade_level_id: selectedGradeId,
        });
        fetchClassroomsFromStore({
          school_id: selectedSchoolId,
          grade_level_id: selectedGradeId,
          active_academic_year: selectedYear,
        });
      } else {
        clearUnassignedStore();
        clearClassroomStore();
      }
    } else {
      clearUnassignedStore();
      clearClassroomStore();
      setAvailableGradeLevels([]);
      setSelectedYear("");
      setSelectedGradeId("");
    }
  }, [
    selectedSchoolId,
    selectedYear,
    selectedGradeId,
    fetchUnassignedStudentsForGrade,
    fetchClassroomsFromStore,
    clearUnassignedStore,
    clearClassroomStore,
    fetchSchoolSpecificGrades,
  ]);

  // Sync local DND state from store
  useEffect(() => {
    setUnassignedListInternal(unassignedStudentsForGrade);
  }, [unassignedStudentsForGrade]);
  useEffect(() => {
    const newMap: Record<string, StudentAcademicYear[]> = {};
    classrooms.forEach((cr) => {
      // Backend ClassroomResource should include student_enrollments (aliased if needed)
      const classroomWithEnrollments = cr as ClassroomWithEnrollments;
      const enrollments = classroomWithEnrollments.student_enrollments || [];
      newMap[String(cr.id)] = enrollments.sort((a, b) =>
        a.student!.student_name.localeCompare(b.student!.student_name)
      );
    });
    setClassroomMapInternal(newMap);
  }, [classrooms]);

  // --- Handlers ---
  const handleSchoolChange = (value: string) => {
    setSelectedSchoolId(value ? Number(value) : "");
    setSelectedYear("");
    setSelectedGradeId("");
  };
  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setSelectedGradeId("");
  };
  const handleGradeChange = (value: string) =>
    setSelectedGradeId(value ? Number(value) : "");

  const handleStudentClick = (studentId: number) => {
    navigate(`/students/${studentId}`);
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const enrollmentId = Number(draggableId.split("-")[1]); // student-{enrollmentId}
    if (
      isNaN(enrollmentId) ||
      !selectedSchoolId ||
      !selectedYear ||
      !selectedGradeId
    ) {
      console.error("Drag end error: Invalid IDs or context");
      return;
    }

    const studentToMove = // Find student in either list
      unassignedListInternal.find((s) => s.id === enrollmentId) ||
      Object.values(classroomMapInternal)
        .flat()
        .find((s) => s.id === enrollmentId);

    if (!studentToMove) {
      console.error("Draggable student not found", enrollmentId);
      return;
    }

    // Optimistic UI Update
    let tempUnassigned = [...unassignedListInternal];
    const tempClassroomMap = { ...classroomMapInternal };
    Object.keys(tempClassroomMap).forEach((key) => {
      tempClassroomMap[key] = [...(tempClassroomMap[key] || [])];
    }); // Deep copy arrays

    // Remove from source
    if (source.droppableId === UNASSIGNED_STUDENTS_DROPPABLE_ID) {
      tempUnassigned = tempUnassigned.filter((s) => s.id !== enrollmentId);
    } else {
      const sourceClassroomId = source.droppableId.split("-")[1];
      tempClassroomMap[sourceClassroomId] = (
        tempClassroomMap[sourceClassroomId] || []
      ).filter((s) => s.id !== enrollmentId);
    }

    // Add to destination
    const targetClassroomId =
      destination.droppableId === UNASSIGNED_STUDENTS_DROPPABLE_ID
        ? null
        : Number(destination.droppableId.split("-")[1]);
    if (targetClassroomId !== null) {
      // Moving to a classroom
      const destClassroom = classrooms.find((c) => c.id === targetClassroomId);
      const currentOccupancy =
        tempClassroomMap[String(targetClassroomId)]?.length || 0;
      if (destClassroom && currentOccupancy >= destClassroom.capacity) {
        enqueueSnackbar(
          `فصل "${destClassroom.name}" ممتلئ (${currentOccupancy}/${destClassroom.capacity}). لا يمكن إضافة المزيد.`,
          { variant: "warning" }
        );
        return; // Do not proceed with API call or UI update
      }
      tempClassroomMap[String(targetClassroomId)] = [
        ...(tempClassroomMap[String(targetClassroomId)] || []),
        studentToMove,
      ].sort((a, b) =>
        a.student!.student_name.localeCompare(b.student!.student_name)
      );
    } else {
      // Moving to Unassigned
      tempUnassigned = [...tempUnassigned, studentToMove].sort((a, b) =>
        a.student!.student_name.localeCompare(b.student!.student_name)
      );
    }

    setUnassignedListInternal(tempUnassigned);
    setClassroomMapInternal(tempClassroomMap);
    // End Optimistic UI Update

    try {
      await assignStudentToClassroom(
        enrollmentId,
        targetClassroomId,
        selectedSchoolId,
        selectedYear,
        selectedGradeId
      );
      enqueueSnackbar("تم تحديث تعيين الطالب بنجاح", { variant: "success" });
      // The store actions should ideally refetch both unassigned and classroom students
      // This will overwrite the optimistic update with fresh data from the server.
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "فشل تحديث تعيين الطالب";
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
      // Revert UI by refetching from store (which should have original state or refetch itself)
              fetchUnassignedStudentsForGrade({
          school_id: selectedSchoolId,
          academic_year: selectedYear,
          grade_level_id: selectedGradeId,
        });
        fetchClassroomsFromStore({
          school_id: selectedSchoolId,
          grade_level_id: selectedGradeId,
          active_academic_year: selectedYear,
        });
    }
  };

  // --- Filtered Academic Years for Dropdown ---
  const filteredAcademicYears = useCallback(() => {
    if (!selectedSchoolId) return [];
    return availableAcademicYears
      .filter((ay) => ay.includes(selectedYear))
      .sort((a, b) => b.localeCompare(a)); // Sort desc
  }, [selectedYear, selectedSchoolId]);

  // --- Dynamic Grid Columns Calculation ---
  const getGridColumns = useCallback(() => {
    const totalColumns = classrooms.length + 1; // +1 for unassigned students column
    
    if (totalColumns <= 1) return "grid-cols-1";
    if (totalColumns <= 2) return "grid-cols-1 md:grid-cols-2";
    if (totalColumns <= 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (totalColumns <= 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    if (totalColumns <= 5) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
    if (totalColumns <= 6) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
    if (totalColumns <= 8) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8";
    if (totalColumns <= 10) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-10";
    
    // For more than 10 columns, use auto-fit with min-width
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6";
  }, [classrooms.length]);

  // --- Render Student Card for DND ---
  const renderStudentCard = (
    enrollment: StudentAcademicYear,
    index: number,
    isUnassigned = false
  ) => (
    <Draggable
      key={`enrollment-${enrollment.id}`}
      draggableId={`enrollment-${enrollment.id}`}
      index={index}
    >
      {(provided, snapshot) => (
        <div
         dir="rtl"
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "p-2.5 mb-2 border rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md hover:bg-accent/50 transition-all cursor-pointer",
            snapshot.isDragging && "ring-2 ring-primary shadow-lg opacity-90"
          )}
          onClick={() => handleStudentClick(enrollment.student?.id || 0)}
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <div {...provided.dragHandleProps} className="cursor-grab p-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <ShadcnAvatar className="h-19 w-19">
              <AvatarImage
                src={(enrollment.student as StudentWithImage)?.image_url ?? undefined}
                alt={enrollment.student?.student_name}
              />
              <AvatarFallback>
                {enrollment.student?.student_name?.charAt(0) || (
                  <Users className="h-4 w-4" />
                )}
              </AvatarFallback>
            </ShadcnAvatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-center text-lg  font-bold">
                {enrollment.student?.student_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                 كود الطالب {enrollment.id} 
                {!isUnassigned && enrollment.classroom && (
                  <span className="text-blue-600 dark:text-blue-400">
                    {" "}
                    (في {enrollment.classroom.name})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  // --- Main Render ---
  return (
    <div className="container max-w-screen-2xl mx-auto py-6 px-4" dir="rtl">
      {" "}
      {/* Wider container */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-semibold">
                توزيع الطلاب على الفصول
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings">
                  <ArrowRight className="ml-2 h-4 w-4" />
                  عودة للإعدادات
                </Link>
              </Button>
            </div>
            <CardDescription>
              اختر المدرسة والعام الدراسي والمرحلة، ثم قم بسحب الطلاب إلى الفصول
              المناسبة.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="school-filter-assign" className="text-lg font-bold">المدرسة *</Label>
              <Select
                value={String(selectedSchoolId)}
                onValueChange={handleSchoolChange}
                disabled={schoolsLoading}
              >
                <SelectTrigger id="school-filter-assign" className="text-lg font-bold">
                  <SelectValue placeholder="..." className="text-lg font-bold" />
                </SelectTrigger>
                <SelectContent className="text-lg font-bold">
                  <SelectItem value=" " disabled className="text-lg font-bold">
                    اختر مدرسة...
                  </SelectItem>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)} className="text-lg font-bold">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year-filter-assign" className="text-lg font-bold">العام الدراسي *</Label>
              <Select
                value={selectedYear}
                onValueChange={handleYearChange}
                disabled={!selectedSchoolId}
              >
                <SelectTrigger id="year-filter-assign" className="text-lg font-bold">
                  <SelectValue placeholder="..." className="text-lg font-bold" />
                </SelectTrigger>
                <SelectContent className="text-lg font-bold">
                  <SelectItem value=" " disabled className="text-lg font-bold">
                    اختر عاماً...
                  </SelectItem>
                  {filteredAcademicYears.map((ay) => (
                    <SelectItem key={ay} value={ay} className="text-lg font-bold">
                      {ay}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade-filter-assign" className="text-lg font-bold">المرحلة الدراسية *</Label>
              <Select
                value={String(selectedGradeId)}
                onValueChange={handleGradeChange}
                disabled={!selectedYear || loadingSchoolSpecificGrades}
              >
                <SelectTrigger id="grade-filter-assign" className="text-lg font-bold">
                  <SelectValue placeholder="..." className="text-lg font-bold" />
                </SelectTrigger>
                <SelectContent className="text-lg font-bold">
                  <SelectItem value=" " disabled className="text-lg font-bold">
                    اختر مرحلة...
                  </SelectItem>
                  {availableGradeLevels.map((gl) => (
                    <SelectItem key={gl.id} value={String(gl.id)} className="text-lg font-bold">
                      {gl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {(loadingUnassigned || classroomsLoading) && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {(!selectedSchoolId || !selectedYear || !selectedGradeId) &&
        !loadingUnassigned &&
        !classroomsLoading && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              الرجاء اختيار المدرسة والعام الدراسي والمرحلة لعرض وتوزيع الطلاب.
            </AlertDescription>
          </Alert>
        )}
      {selectedSchoolId &&
        selectedYear &&
        selectedGradeId &&
        !loadingUnassigned &&
        !classroomsLoading &&
        !error && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className={`grid ${getGridColumns()} gap-4`}>
              {" "}
              {/* Dynamic columns based on number of classrooms */}
              {/* Unassigned Students Column */}
              <Droppable droppableId={UNASSIGNED_STUDENTS_DROPPABLE_ID}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "min-h-[400px] flex flex-col",
                      snapshot.isDraggingOver &&
                        "bg-primary/5 ring-1 ring-primary"
                    )}
                  >
                    <CardHeader className="p-3 border-b sticky top-0 bg-card z-10">
                      <CardTitle className="text-center text-sm font-medium text-muted-foreground">
                        طلاب غير معينين ({unassignedListInternal.length})
                      </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-grow p-3">
                      {unassignedListInternal.length === 0 ? (
                        <p className="text-xs text-center text-muted-foreground py-4">
                          لا يوجد طلاب غير معينين لهذه المرحلة.
                        </p>
                      ) : (
                        unassignedListInternal.map((enrollment, index) =>
                          renderStudentCard(enrollment, index, true)
                        )
                      )}
                      {provided.placeholder}
                    </ScrollArea>
                  </Card>
                )}
              </Droppable>
              {/* Classroom Columns */}
              {classrooms.map((classroom) => (
                <Droppable
                  key={classroom.id}
                  droppableId={`classroom-${classroom.id}`}
                >
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[400px] flex flex-col",
                        snapshot.isDraggingOver &&
                          "bg-primary/5 ring-1 ring-primary"
                      )}
                    >
                      <CardHeader className="p-3 border-b sticky top-0 bg-card z-10">
                        <CardTitle className="text-center text-sm font-medium text-foreground">
                          {classroom.name}
                          <Badge variant="secondary" className="mr-2 text-xs">
                            {classroomMapInternal[String(classroom.id)]
                              ?.length || 0}{" "}
                            / {classroom.capacity}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <ScrollArea className="flex-grow p-3">
                        {(classroomMapInternal[String(classroom.id)] || [])
                          .length === 0 ? (
                          <p className="text-xs text-center text-muted-foreground py-4">
                            اسحب الطلاب إلى هنا.
                          </p>
                        ) : (
                          (
                            classroomMapInternal[String(classroom.id)] || []
                          ).map((enrollment, index) =>
                            renderStudentCard(enrollment, index)
                          )
                        )}
                        {provided.placeholder}
                      </ScrollArea>
                    </Card>
                  )}
                </Droppable>
              ))}
              {classrooms.length === 0 && selectedGradeId && (
                <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 p-3">
                  <Alert
                    variant="default"
                    className="bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      لا توجد فصول دراسية معرفة لهذه المرحلة في المدرسة
                      المختارة.
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="p-0 h-auto mr-1"
                      >
                        <Link to="/settings/classrooms">إضافة فصول</Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </DragDropContext>
        )}
    </div>
  );
};

export default ClassroomStudentAssigner;
