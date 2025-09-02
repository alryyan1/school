// src/pages/finances/RevenuesPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudentStore } from "@/stores/studentStore";
import { useSchoolStore } from "@/stores/schoolStore";
import { useGradeLevelStore } from "@/stores/gradeLevelStore";
import { useClassroomStore } from "@/stores/classroomStore";
import { useAuth } from "@/context/authcontext";
import { User } from "lucide-react";
import { Student } from "@/types/student";

// This page imagines revenues primarily from student fees (enrollments.fee or students.fee)
const RevenuesPage: React.FC = () => {
  const { students, fetchStudents } = useStudentStore();
  const { schools, fetchSchools } = useSchoolStore();
  const { gradeLevels, fetchGradeLevels } = useGradeLevelStore();
  const { classrooms, fetchClassrooms, clearClassrooms } = useClassroomStore();
  const { userSchoolId } = useAuth();
  const navigate = useNavigate();

  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [gradeLevelId, setGradeLevelId] = useState<number | null>(null);
  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [availableGradeLevels, setAvailableGradeLevels] = useState<typeof gradeLevels>([]);

  // bootstrap lists
  useEffect(() => {
    if (schools.length === 0) fetchSchools();
    if (gradeLevels.length === 0) fetchGradeLevels();
  }, [fetchSchools, fetchGradeLevels, schools.length, gradeLevels.length]);

  // preselect school from user
  useEffect(() => {
    if (userSchoolId && schoolId === null) {
      console.log('Setting initial school from user:', userSchoolId);
      setSchoolId(Number(userSchoolId));
    }
  }, [userSchoolId, schoolId]);

  // load classrooms when school or grade changes
  useEffect(() => {
    if (schoolId) {
      console.log('Fetching classrooms for school:', schoolId, 'grade level:', gradeLevelId);
      fetchClassrooms({ school_id: schoolId, grade_level_id: gradeLevelId || undefined });
    } else {
      console.log('Clearing classrooms');
      clearClassrooms();
    }
  }, [schoolId, gradeLevelId, fetchClassrooms, clearClassrooms]);

  // filter grade levels based on selected school
  useEffect(() => {
    if (schoolId && classrooms.length > 0) {
      console.log('Filtering grade levels - schoolId:', schoolId, 'classrooms count:', classrooms.length);
      console.log('Available classrooms:', classrooms.map(c => ({ id: c.id, school_id: c.school_id, grade_level_id: c.grade_level_id })));
      
      // Filter grade levels to only show those available for the selected school
      // This assumes that classrooms have both school_id and grade_level_id
      // We find grade levels that have at least one classroom in the selected school
      const schoolGradeLevels = gradeLevels.filter(gl => 
        classrooms.some(c => c.school_id === schoolId && c.grade_level_id === gl.id)
      );
      console.log('Filtering grade levels for school:', schoolId, 'Available:', schoolGradeLevels);
      setAvailableGradeLevels(schoolGradeLevels);
      
      // Reset grade level selection if current selection is not available for the school
      if (gradeLevelId && !schoolGradeLevels.some(gl => gl.id === gradeLevelId)) {
        setGradeLevelId(null);
      }
    } else if (schoolId && classrooms.length === 0) {
      console.log('School selected but no classrooms loaded yet, waiting...');
      // Don't filter yet, wait for classrooms to load
    } else {
      setAvailableGradeLevels([]);
      setGradeLevelId(null);
    }
  }, [schoolId, gradeLevels, classrooms, gradeLevelId]);

  const buildFilters = useCallback(() => {
    const filters: Record<string, string | number | boolean> = {
      only_enrolled: true,
      only_approved: true,
      per_page: 1000,
      page: 1,
    };
    if (schoolId && schoolId !== null) filters.school_id = schoolId;
    if (gradeLevelId && gradeLevelId !== null) filters.grade_level_id = gradeLevelId;
    if (classroomId && classroomId !== null) filters.classroom_id = classroomId;
    return filters;
  }, [schoolId, gradeLevelId, classroomId]);

  // fetch students on filter changes
  useEffect(() => {
    const filters = buildFilters();
    console.log('Fetching students with filters:', filters);
    fetchStudents(filters);
  }, [buildFilters, fetchStudents]);

  // Debug: Log students data when it changes
  useEffect(() => {
    if (students.length > 0) {
      console.log('Students data received:', students[0]);
      console.log('First student enrollments:', (students[0] as unknown as { enrollments?: unknown[] }).enrollments);
    }
  }, [students]);

  const totalRevenue = students.reduce((sum, s) => {
    const enrollments = (s as unknown as { enrollments?: { fees?: number; fee?: number }[] }).enrollments ?? [];
    const studentTotal = enrollments.reduce((acc, e) => acc + (Number(e.fees ?? e.fee ?? 0) || 0), 0);
    return sum + studentTotal;
  }, 0);
  const studentsCount = students.length;

  const handleStudentClick = (student: Student) => {
    // Get the first enrollment ID for the student
    const enrollmentId = (student as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
    if (enrollmentId) {
      // Navigate to the ledger page for the specific enrollment
      navigate(`/finances/student-ledger/${enrollmentId}/${encodeURIComponent(student.student_name || '')}`);
    }
  };

  return (
    <section className="container mx-auto p-4 sm:p-6 max-w-6xl" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>الايرادات - رسوم الطلاب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* School filter */}
              <Select value={schoolId ? String(schoolId) : ""} onValueChange={(v) => { 
                if (v === " ") {
                  setSchoolId(null);
                } else {
                  setSchoolId(v ? Number(v) : null);
                }
                // Clear dependent filters when school changes
                setGradeLevelId(null); 
                setClassroomId(null); 
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="فلترة بالمدرسة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">جميع المدارس</SelectItem>
                  {schools.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Grade level filter */}
              <Select value={gradeLevelId ? String(gradeLevelId) : ""} onValueChange={(v) => { 
                if (v === " ") {
                  setGradeLevelId(null);
                } else {
                  setGradeLevelId(v ? Number(v) : null);
                }
                setClassroomId(null); 
              }} disabled={!schoolId}>
                <SelectTrigger>
                  <SelectValue placeholder={schoolId ? "فلترة بالمرحلة" : "اختر مدرسة أولاً"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">جميع المراحل</SelectItem>
                  {availableGradeLevels.length > 0 ? (
                    availableGradeLevels.map(gl => (
                      <SelectItem key={gl.id} value={String(gl.id)}>{gl.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value=" " disabled>لا توجد مراحل متاحة</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Classroom filter (depends on school/grade) */}
              <Select value={classroomId ? String(classroomId) : ""} onValueChange={(v) => {
                if (v === " ") {
                  setClassroomId(null);
                } else {
                  setClassroomId(v ? Number(v) : null);
                }
              }} disabled={!schoolId}>
                <SelectTrigger>
                  <SelectValue placeholder={schoolId ? "فلترة بالفصل" : "اختر مدرسة أولاً"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">جميع الفصول</SelectItem>
                  {classrooms.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">عدد الطلاب: {studentsCount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">اجمالي متوقع: {totalRevenue.toLocaleString()} جنيه</div>
            </div>
          </div>
          <div className="border rounded-md overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center text-xs sm:text-sm">#</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">الصورة</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">اسم الطالب</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">رقم التسجيل</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">المدرسة</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">المرحلة</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">الفصل</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">الرسوم (متوقع)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow 
                    key={s.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleStudentClick(s)}
                  >
                    <TableCell className="text-center text-xs sm:text-sm">{s.id}</TableCell>
                    <TableCell className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {s.image_url ? (
                          <img 
                            src={s.image_url} 
                            alt={s.student_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-primary ${s.image_url ? 'hidden' : ''}`}>
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { student_name?: string }).student_name ?? '-'}</TableCell>
                    <TableCell className="text-center text-xs sm:text-sm">{((s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id) ?? '-'}</TableCell>
                    <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { wished_school_details?: { name?: string } }).wished_school_details?.name ?? '-'}</TableCell>
                    <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { enrollments?: { grade_level?: { name?: string } }[] }).enrollments?.[0]?.grade_level?.name ?? '-'}</TableCell>
                    <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { enrollments?: { classroom?: { name?: string } }[] }).enrollments?.[0]?.classroom?.name ?? '-'}</TableCell>
                    <TableCell className="text-center text-xs sm:text-sm">{
                      (((s as unknown as { enrollments?: { fees?: number; fee?: number }[] }).enrollments ?? [])
                        .reduce((acc, e) => acc + (Number(e.fees ?? e.fee ?? 0) || 0), 0)).toLocaleString()
                    }</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RevenuesPage;


