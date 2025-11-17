// src/pages/finances/RevenuesPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudentStore } from "@/stores/studentStore";
import { useSchoolStore } from "@/stores/schoolStore";
import { useGradeLevelStore } from "@/stores/gradeLevelStore";
import { useClassroomStore } from "@/stores/classroomStore";
import { User, Truck } from "lucide-react";
import { Student } from "@/types/student";
import { EnrollmentType } from "@/types/enrollment";
import { useLedgerStore } from "@/stores/ledgerStore";
import { webUrl } from "@/constants";

// Helper function to format numbers with thousands separator
const numberWithCommas = (x: number): string => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// This page imagines revenues primarily from student fees (enrollments.fee or students.fee)
const RevenuesPage: React.FC = () => {
  const { students, fetchStudents, pagination } = useStudentStore();
  const { schools, fetchSchools } = useSchoolStore();
  const { gradeLevels, fetchGradeLevels } = useGradeLevelStore();
  const { classrooms, fetchClassrooms, clearClassrooms } = useClassroomStore();
  const navigate = useNavigate();
  const { getLedgerSummary } = useLedgerStore();

  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [gradeLevelId, setGradeLevelId] = useState<number | null>(null);
  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [availableGradeLevels, setAvailableGradeLevels] = useState<typeof gradeLevels>([]);
  const [ledgerSummaryMap, setLedgerSummaryMap] = useState<Record<number, { total_fees: number; total_payments: number; total_discounts?: number; total_refunds?: number; total_adjustments?: number }>>({});
  const [onlyDiscounts, setOnlyDiscounts] = useState<boolean>(false);
  const [onlyNoPayments, setOnlyNoPayments] = useState<boolean>(false);
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType | null>(null);
  const [perPage, setPerPage] = useState<number>(30);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  console.log("ledgerSummaryMap", ledgerSummaryMap);
  // bootstrap lists
  useEffect(() => {
    if (schools.length === 0) fetchSchools();
    if (gradeLevels.length === 0) fetchGradeLevels();
  }, [fetchSchools, fetchGradeLevels, schools.length, gradeLevels.length]);

  // Do not preselect school; show all schools by default

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
      per_page: perPage,
      page: page,
    };
    if (schoolId && schoolId !== null) filters.school_id = schoolId;
    if (gradeLevelId && gradeLevelId !== null) filters.grade_level_id = gradeLevelId;
    if (classroomId && classroomId !== null) filters.classroom_id = classroomId;
    if (search && search.trim() !== "") filters.search = search.trim();
    if (onlyNoPayments) filters.only_no_payments = true;
    if (enrollmentType) filters.enrollment_type = enrollmentType;
    return filters;
  }, [schoolId, gradeLevelId, classroomId, perPage, page, search, onlyNoPayments, enrollmentType]);

  // Reset to first page on filter/perPage/search change
  useEffect(() => {
    setPage(1);
  }, [schoolId, gradeLevelId, classroomId, perPage, search, onlyNoPayments, enrollmentType]);

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

  // Fetch ledger summaries for visible enrollments (first enrollment per student)
  useEffect(() => {
    const enrollmentIds = students
      .map((s) => (s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id)
      .filter((id): id is number => typeof id === 'number');
    const uniqueIds = Array.from(new Set(enrollmentIds));
    if (uniqueIds.length === 0) return;

    (async () => {
      try {
        const res = await getLedgerSummary({ enrollment_ids: uniqueIds });
        const arr = (res?.summary ?? []) as Array<{ enrollment_id: number; total_fees: number; total_payments: number; total_discounts?: number; total_refunds?: number; total_adjustments?: number }>;
        const map: Record<number, { total_fees: number; total_payments: number; total_discounts?: number; total_refunds?: number; total_adjustments?: number }> = {};
        for (const item of arr) {
          map[item.enrollment_id] = {
            total_fees: Number(item.total_fees || 0),
            total_payments: Number(item.total_payments || 0),
            total_discounts: Number(item.total_discounts || 0),
            total_refunds: Number(item.total_refunds || 0),
            total_adjustments: Number(item.total_adjustments || 0),
          };
        }
        setLedgerSummaryMap(map);
      } catch (e) {
        console.error('Failed to load ledger summaries', e);
      }
    })();
  }, [students, getLedgerSummary]);

  // Server-side search is applied; keep client list as-is
  const filteredStudents = students;

  const totalRevenue = students.reduce((sum, s) => {
    const enrollments = (s as unknown as { enrollments?: { fees?: number; fee?: number }[] }).enrollments ?? [];
    const studentTotal = enrollments.reduce((acc, e) => acc + (Number(e.fees ?? e.fee ?? 0) || 0), 0);
    return sum + studentTotal;
  }, 0);
  const studentsCount = students.length;
  const totalStudents = pagination?.total ?? studentsCount;

  const handleExportPdf = async () => {
    const params = new URLSearchParams();
    const filters = buildFilters();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
    });
    const pdfUrl = `${webUrl}reports/revenues?${params.toString()}`;
    window.open(pdfUrl, '_blank');
  };

  const handleExportExcel = async () => {
    const params = new URLSearchParams();
    const filters = buildFilters();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
    });
    const excelUrl = `${webUrl}reports/revenues-excel?${params.toString()}`;
    window.open(excelUrl, '_blank');
  };

  const handleStudentClick = (student: Student) => {
    // Get the first enrollment ID for the student
    const enrollmentId = (student as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
    if (enrollmentId) {
      // Navigate to the ledger page for the specific enrollment
      navigate(`/finances/student-ledger/${enrollmentId}/${encodeURIComponent(student.student_name || '')}`);
    }
  };

  return (
    <section className="container mx-auto p-4 sm:p-6 max-w-8xl" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <CardTitle>الايرادات - رسوم الطلاب</CardTitle>
              <div className="max-w-xs w-full">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث بالاسم أو رقم التسجيل"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={onlyDiscounts ? "default" : "outline"}
                onClick={() => setOnlyDiscounts(v => !v)}
              >
                خصومات فقط
              </Button>
              <Button
                variant={onlyNoPayments ? "default" : "outline"}
                onClick={() => setOnlyNoPayments(v => !v)}
              >
                غير مدفوع
              </Button>
              <Button variant="outline" onClick={handleExportPdf}>تصدير PDF</Button>
              <Button variant="outline" onClick={handleExportExcel}>تصدير Excel</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
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
              }} disabled={!gradeLevelId}>
                <SelectTrigger>
                  <SelectValue placeholder={gradeLevelId ? "فلترة بالفصل" : "اختر مرحلة أولاً"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">جميع الفصول</SelectItem>
                  {classrooms.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Enrollment type filter */}
              <Select value={enrollmentType || ""} onValueChange={(v) => {
                if (v === " ") {
                  setEnrollmentType(null);
                } else {
                  setEnrollmentType(v as EnrollmentType);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع التسجيل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">جميع الأنواع</SelectItem>
                  <SelectItem value="regular">عادي</SelectItem>
                  <SelectItem value="scholarship">منحة</SelectItem>
                  <SelectItem value="free">إعفاء</SelectItem>
                </SelectContent>
              </Select>

              {/* Per page selector */}
              <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="عدد الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
                          <div className="flex items-center justify-between">
                              {/* <div className="text-sm text-muted-foreground">عدد الطلاب: {numberWithCommas(totalStudents)}</div> */}
              {/* <div className="text-sm text-muted-foreground">اجمالي متوقع: {numberWithCommas(totalRevenue)} جنيه</div> */}
              </div>
          </div>
          <div className="border rounded-md overflow-x-auto">
            <Table className="min-w-full">
                              <TableHeader>
                  <TableRow>
                    <TableHead className="text-center text-xs sm:text-sm">رقم التسجيل</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">الصورة</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">اسم الطالب</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">المدرسة</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">المرحلة</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">الفصل</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">الرسوم (دفتر)</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">المدفوع (دفتر)</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">الخصومات</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">المتبقي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents
                    .filter(s => (s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id)
                    .filter(s => {
                      if (!onlyDiscounts) return true;
                      const eid = (s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
                      if (!eid) return false;
                      return Number(ledgerSummaryMap[eid]?.total_discounts || 0) > 0;
                    })
                    .sort((a, b) => {
                      const aId = (a as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id || 0;
                      const bId = (b as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id || 0;
                      return bId - aId; // Descending order
                    })
                    .map((s) => (
                                      <TableRow 
                      key={s.id} 
                      className={`cursor-pointer transition-colors ${(() => {
                        const eid = (s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
                        const hasDiscount = eid ? Number(ledgerSummaryMap[eid]?.total_discounts || 0) > 0 : false;
                        const hasNoPayments = eid ? Number(ledgerSummaryMap[eid]?.total_payments || 0) === 0 : false;
                        
                        if (hasDiscount) return 'bg-amber-50 hover:bg-amber-100';
                        if (hasNoPayments) return 'bg-red-50 hover:bg-red-100';
                        return 'hover:bg-muted/50';
                      })()}`}
                      onClick={() => handleStudentClick(s)}
                    >
                      <TableCell className="text-center text-xs sm:text-sm font-mono font-bold">
                        {((s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id) ?? '-'}
                      </TableCell>
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
                      <TableCell className="text-center text-xs sm:text-sm">
                        <div className="flex items-center justify-center gap-2">
                          {(s as unknown as { student_name?: string }).student_name ?? '-'}
                          {((s as unknown as { enrollments?: { deportation?: boolean }[] }).enrollments?.[0]?.deportation) && (
                            <Truck className="w-4 h-4 text-blue-600" title="مشترك في الترحيل" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { wished_school_details?: { name?: string } }).wished_school_details?.name ?? '-'}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { enrollments?: { grade_level?: { name?: string } }[] }).enrollments?.[0]?.grade_level?.name ?? '-'}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { enrollments?: { classroom?: { name?: string } }[] }).enrollments?.[0]?.classroom?.name ?? '-'}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{
                        (() => {
                          const eid = (s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
                          const summary = eid ? ledgerSummaryMap[eid] : undefined;
                          const expected = summary ? Number(summary.total_fees || 0) : (((s as unknown as { enrollments?: { fees?: number; fee?: number }[] }).enrollments ?? [])
                            .reduce((acc, e) => acc + (Number(e.fees ?? e.fee ?? 0) || 0), 0));
                          return numberWithCommas(expected);
                        })()
                      } جنيه</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{
                        (() => {
                          const eid = (s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
                          const summary = eid ? ledgerSummaryMap[eid] : undefined;
                          const paid = summary ? Number(summary.total_payments || 0) : (((s as unknown as { enrollments?: { total_amount_paid?: number }[] }).enrollments ?? [])
                            .reduce((acc, e) => acc + (Number(e.total_amount_paid ?? 0) || 0), 0));
                          return numberWithCommas(paid);
                        })()
                      } جنيه</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{
                        (() => {
                          const eid = (s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
                          const summary = eid ? ledgerSummaryMap[eid] : undefined;
                          const discounts = summary ? Number(summary.total_discounts || 0) : 0;
                          return numberWithCommas(discounts);
                        })()
                      } جنيه</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{
                        (() => {
                          const eid = (s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
                          const summary = eid ? ledgerSummaryMap[eid] : undefined;
                          const expectedFallback = (((s as unknown as { enrollments?: { fees?: number; fee?: number }[] }).enrollments ?? [])
                            .reduce((acc, e) => acc + (Number(e.fees ?? e.fee ?? 0) || 0), 0));
                          const paidFallback = (((s as unknown as { enrollments?: { total_amount_paid?: number }[] }).enrollments ?? [])
                            .reduce((acc, e) => acc + (Number(e.total_amount_paid ?? 0) || 0), 0));
                          const expected = summary ? Number(summary.total_fees || 0) : expectedFallback;
                          const paid = summary ? Number(summary.total_payments || 0) : paidFallback;
                          const discounts = summary ? Number(summary.total_discounts || 0) : 0;
                          return numberWithCommas(Math.max(expected - paid - discounts, 0));
                        })()
                      } جنيه</TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {pagination ? (
                <span>
                  عرض {numberWithCommas(pagination.from ?? 0)} - {numberWithCommas(pagination.to ?? 0)} من {numberWithCommas(pagination.total)}
                </span>
              ) : (
                <span>عرض {numberWithCommas(studentsCount)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={!pagination || pagination.current_page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                السابق
              </Button>
              <div className="text-xs sm:text-sm text-muted-foreground">
                صفحة {pagination?.current_page ?? page} من {pagination?.last_page ?? 1}
              </div>
              <Button
                variant="outline"
                disabled={!pagination || (pagination.current_page >= pagination.last_page)}
                onClick={() => setPage((p) => (pagination ? Math.min(pagination.last_page, p + 1) : p + 1))}
              >
                التالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RevenuesPage;


