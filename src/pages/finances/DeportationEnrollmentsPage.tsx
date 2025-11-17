// src/pages/finances/DeportationEnrollmentsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Autocomplete, TextField } from "@mui/material";
import { useStudentStore } from "@/stores/studentStore";
import { useSchoolStore } from "@/stores/schoolStore";
import { useGradeLevelStore } from "@/stores/gradeLevelStore";
import { Student } from "@/types/student";
import { DeportationType } from "@/types/enrollment";
import { useDeportationLedgerStore } from "@/stores/deportationLedgerStore";
import { DeportationPathApi, DeportationPath } from "@/api/deportationPathApi";
import { webUrl } from "@/constants";

// Helper function to format numbers with thousands separator
const numberWithCommas = (x: number): string => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// This page shows revenues from student fees for deportation enrollments only
const DeportationEnrollmentsPage: React.FC = () => {
  const { students, fetchStudents, pagination } = useStudentStore();
  const { schools, fetchSchools } = useSchoolStore();
  const { gradeLevels, fetchGradeLevels } = useGradeLevelStore();
  const navigate = useNavigate();
  const { getLedgerSummary } = useDeportationLedgerStore();

  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [gradeLevelId, setGradeLevelId] = useState<number | null>(null);
  const [deportationType, setDeportationType] = useState<DeportationType | null>(null);
  const [availableGradeLevels, setAvailableGradeLevels] = useState<typeof gradeLevels>([]);
  const [ledgerSummaryMap, setLedgerSummaryMap] = useState<Record<number, { total_fees: number; total_payments: number; total_discounts?: number; total_refunds?: number; total_adjustments?: number }>>({});
  const [onlyDiscounts, setOnlyDiscounts] = useState<boolean>(false);
  const [onlyNoPayments, setOnlyNoPayments] = useState<boolean>(false);
  const [deportationPathId, setDeportationPathId] = useState<number | null>(null);
  const [deportationPaths, setDeportationPaths] = useState<DeportationPath[]>([]);
  const [perPage, setPerPage] = useState<number>(30);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  console.log("ledgerSummaryMap", ledgerSummaryMap);
  
  // bootstrap lists
  useEffect(() => {
    if (schools.length === 0) fetchSchools();
    if (gradeLevels.length === 0) fetchGradeLevels();
  }, [fetchSchools, fetchGradeLevels, schools.length, gradeLevels.length]);

  // Fetch deportation paths
  useEffect(() => {
    const fetchDeportationPaths = async () => {
      try {
        const response = await DeportationPathApi.getAll();
        setDeportationPaths(response.data.data || []);
      } catch (error) {
        console.error('Error fetching deportation paths:', error);
      }
    };
    fetchDeportationPaths();
  }, []);

  // Do not preselect school; show all schools by default

  // Note: Classroom filter has been replaced with deportation type filter

  // Show all grade levels when school is selected, or all if no school selected
  useEffect(() => {
    if (schoolId) {
      // For now, show all grade levels when a school is selected
      // You can add filtering logic here if needed based on school-grade relationships
      setAvailableGradeLevels(gradeLevels);
    } else {
      setAvailableGradeLevels(gradeLevels);
    }
  }, [schoolId, gradeLevels]);

  const buildFilters = useCallback(() => {
    const filters: Record<string, string | number | boolean> = {
      only_enrolled: true,
      only_approved: true,
      only_deportation: true, // Filter for deportation enrollments only
      per_page: perPage,
      page: page,
    };
    if (schoolId && schoolId !== null) filters.school_id = schoolId;
    if (gradeLevelId && gradeLevelId !== null) filters.grade_level_id = gradeLevelId;
    if (deportationType && deportationType !== null) filters.deportation_type = deportationType;
    if (search && search.trim() !== "") filters.search = search.trim();
    if (onlyNoPayments) filters.only_no_payments = true;
    if (deportationPathId && deportationPathId !== null) filters.deportation_path_id = deportationPathId;
    return filters;
  }, [schoolId, gradeLevelId, deportationType, perPage, page, search, onlyNoPayments, deportationPathId]);

  // Reset to first page on filter/perPage/search change
  useEffect(() => {
    setPage(1);
  }, [schoolId, gradeLevelId, deportationType, perPage, search, onlyNoPayments, deportationPathId]);

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
        console.error('Failed to load deportation ledger summaries', e);
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
    const pdfUrl = `${webUrl}reports/deportation-revenues?${params.toString()}`;
    window.open(pdfUrl, '_blank');
  };

  const handleExportExcel = async () => {
    const params = new URLSearchParams();
    const filters = buildFilters();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
    });
    const excelUrl = `${webUrl}reports/deportation-revenues-excel?${params.toString()}`;
    window.open(excelUrl, '_blank');
  };

  const handleStudentClick = (student: Student) => {
    // Get the first enrollment ID for the student
    const enrollmentId = (student as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
    if (enrollmentId) {
      // Navigate to the deportation ledger page for the specific enrollment
      navigate(`/finances/student-deportation-ledger/${enrollmentId}/${encodeURIComponent(student.student_name || '')}`);
    }
  };

  return (
    <section className="container mx-auto p-4 sm:p-6 max-w-8xl" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <CardTitle>الايرادات - تسجيلات الترحيل</CardTitle>
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

              {/* Deportation type filter */}
              <Select value={deportationType || ""} onValueChange={(v) => {
                if (v === " ") {
                  setDeportationType(null);
                } else {
                  setDeportationType(v as DeportationType);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الترحيل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">جميع الأنواع</SelectItem>
                  <SelectItem value="داخلي">داخلي</SelectItem>
                  <SelectItem value="خارجي">خارجي</SelectItem>
                </SelectContent>
              </Select>

              {/* Deportation path filter */}
              <Autocomplete
                options={deportationPaths}
                getOptionLabel={(option) => option.name}
                value={deportationPaths.find(p => p.id === deportationPathId) || null}
                onChange={(_, newValue) => {
                  setDeportationPathId(newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="مسار الترحيل"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                      },
                    }}
                  />
                )}
                sx={{ minWidth: 200 }}
                dir="rtl"
              />

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
                    <TableHead className="text-center text-xs sm:text-sm">اسم الطالب</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">المدرسة</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">نوع الترحيل</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">مسار الترحيل</TableHead>
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
                      <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { student_name?: string }).student_name ?? '-'}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { wished_school_details?: { name?: string } }).wished_school_details?.name ?? '-'}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { enrollments?: { deportation_type?: string }[] }).enrollments?.[0]?.deportation_type ?? '-'}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{(s as unknown as { enrollments?: { deportation_path?: { name?: string } }[] }).enrollments?.[0]?.deportation_path?.name ?? '-'}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{
                        (() => {
                          const eid = (s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
                          const summary = eid ? ledgerSummaryMap[eid] : undefined;
                          const expected = summary ? Number(summary.total_fees || 0) : 0;
                          return numberWithCommas(expected);
                        })()
                      } جنيه</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm">{
                        (() => {
                          const eid = (s as unknown as { enrollments?: { id: number }[] }).enrollments?.[0]?.id;
                          const summary = eid ? ledgerSummaryMap[eid] : undefined;
                          const paid = summary ? Number(summary.total_payments || 0) : 0;
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
                          const expected = summary ? Number(summary.total_fees || 0) : 0;
                          const paid = summary ? Number(summary.total_payments || 0) : 0;
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

export default DeportationEnrollmentsPage;


