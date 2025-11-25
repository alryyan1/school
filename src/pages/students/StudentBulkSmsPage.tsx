import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { School } from "@/types/school";
import { GradeLevel } from "@/types/gradeLevel";
import { Student } from "@/types/student";
import { StudentApi } from "@/api/studentApi";
import { useSchoolStore } from "@/stores/schoolStore";
import { useGradeLevelStore } from "@/stores/gradeLevelStore";
import { ultramsgApi } from "@/api/ultramsgApi";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  AlertCircle,
  Copy,
  Loader2,
  RefreshCw,
  School as SchoolIcon,
  Send,
  Users2,
} from "lucide-react";

type FilterMode = "school" | "grade";

const MAX_FETCHED_PER_PAGE = 1500;

const StudentBulkSmsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { schools, fetchSchools, loading: schoolsLoading } = useSchoolStore();
  const { gradeLevels, fetchGradeLevels, loading: gradesLoading } = useGradeLevelStore();

  const [filterMode, setFilterMode] = useState<FilterMode>("school");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [lastFetchCount, setLastFetchCount] = useState<number>(0);
  const [lastFetchFilterLabel, setLastFetchFilterLabel] = useState<string>("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchools();
    fetchGradeLevels();
  }, [fetchSchools, fetchGradeLevels]);

  useEffect(() => {
    setStudents([]);
    setLastFetchCount(0);
    setStudentsError(null);
    setSelectedGradeId("");
    setSelectedSchoolId("");
  }, [filterMode]);

  const loadStudents = useCallback(
    async (filters: Record<string, string | number | boolean>, description: string) => {
      setLoadingStudents(true);
      setStudentsError(null);
      try {
        const response = await StudentApi.getAll({
          ...filters,
          per_page: MAX_FETCHED_PER_PAGE,
          page: 1,
        });
        setStudents(response.data.data);
        setLastFetchCount(response.data.data.length);
        setLastFetchFilterLabel(description);
        setLastUpdatedAt(new Date().toLocaleString("ar-SA"));
      } catch (error: any) {
        const message = error?.response?.data?.message || "فشل في جلب قائمة الطلاب";
        setStudentsError(message);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    },
    []
  );

  useEffect(() => {
    if (filterMode === "school" && selectedSchoolId) {
      const school = schools.find((s) => s.id === Number(selectedSchoolId));
      loadStudents(
        { wished_school_id: Number(selectedSchoolId) },
        school ? `مدرسة ${school.name}` : "مدرسة محددة"
      );
    }
    if (filterMode === "grade" && selectedGradeId) {
      const grade = gradeLevels.find((g) => g.id === Number(selectedGradeId));
      loadStudents(
        { grade_level_id: Number(selectedGradeId) },
        grade ? `المرحلة ${grade.name}` : "مرحلة محددة"
      );
    }
  }, [filterMode, selectedSchoolId, selectedGradeId, loadStudents, schools, gradeLevels]);

  const collectParentPhones = (student: Student): string[] => {
    const sAny = student as any;
    const possibleFields = [
      student.father_phone,
      student.mother_phone,
      student.closest_phone,
      student.relation_phone,
      sAny.parent_phone,
      sAny.guardian_phone,
      sAny.other_parent_phone,
      sAny.father_whatsapp,
      sAny.mother_whatsapp,
    ];
    return possibleFields
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter((value) => value.length > 3);
  };

  const normalizePhone = (phone: string) => {
    const trimmed = phone.trim();
    if (!trimmed) return "";
    const sanitized = trimmed.replace(/[^\d+]/g, "");
    if (sanitized.startsWith("00")) {
      return `+${sanitized.slice(2)}`;
    }
    if (sanitized.startsWith("05")) {
      return `966${sanitized.slice(1)}`;
    }
    return sanitized;
  };

  const parentPhoneNumbers = useMemo(() => {
    const uniqueMap = new Map<string, string>();
    students.forEach((student) => {
      collectParentPhones(student).forEach((phone) => {
        const normalized = normalizePhone(phone);
        if (normalized && !uniqueMap.has(normalized)) {
          uniqueMap.set(normalized, normalized);
        }
      });
    });
    return Array.from(uniqueMap.values());
  }, [students]);

  const handleManualRefresh = () => {
    if (filterMode === "school" && selectedSchoolId) {
      const school = schools.find((s) => s.id === Number(selectedSchoolId));
      loadStudents(
        { wished_school_id: Number(selectedSchoolId) },
        school ? `مدرسة ${school.name}` : "مدرسة محددة"
      );
    } else if (filterMode === "grade" && selectedGradeId) {
      const grade = gradeLevels.find((g) => g.id === Number(selectedGradeId));
      loadStudents(
        { grade_level_id: Number(selectedGradeId) },
        grade ? `المرحلة ${grade.name}` : "مرحلة محددة"
      );
    } else {
      enqueueSnackbar("اختر مدرسة أو مرحلة لجلب قائمة الطلاب", { variant: "warning" });
    }
  };

  const handleCopyNumbers = async () => {
    try {
      await navigator.clipboard.writeText(parentPhoneNumbers.join("\n"));
      enqueueSnackbar("تم نسخ الأرقام إلى الحافظة", { variant: "success" });
    } catch {
      enqueueSnackbar("تعذّر نسخ الأرقام، جرّب يدويًا", { variant: "error" });
    }
  };

  const handleSend = async () => {
    if (parentPhoneNumbers.length === 0) {
      enqueueSnackbar("لا يوجد أرقام لإرسال الرسالة.", { variant: "warning" });
      return;
    }
    if (!message.trim()) {
      enqueueSnackbar("اكتب نص الرسالة أولاً.", { variant: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await ultramsgApi.bulkSendText({
        recipients: parentPhoneNumbers,
        body: message.trim(),
      });
      enqueueSnackbar(
        `تم جدولة إرسال ${parentPhoneNumbers.length} رسالة (رقم الإرسال ${res.bulk_send_id}).`,
        { variant: "success" }
      );
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || "تعذّر جدولة الإرسال", {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSchool = useMemo<School | undefined>(
    () => schools.find((s) => s.id === Number(selectedSchoolId)),
    [schools, selectedSchoolId]
  );

  const selectedGrade = useMemo<GradeLevel | undefined>(
    () => gradeLevels.find((g) => g.id === Number(selectedGradeId)),
    [gradeLevels, selectedGradeId]
  );

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6" dir="rtl">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>إرسال رسائل جماعية لأولياء الأمور</CardTitle>
              <CardDescription>
                اختر مدرسة أو مرحلة ليتم جمع أرقام أولياء الأمور تلقائيًا ثم أرسل رسالة موحّدة.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users2 className="h-4 w-4" />
                {lastFetchCount} طالب
              </Badge>
              {parentPhoneNumbers.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Send className="h-4 w-4" />
                  {parentPhoneNumbers.length} رقم فريد
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع التصفية</label>
              <Select value={filterMode} onValueChange={(value: FilterMode) => setFilterMode(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع التصفية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">حسب المدرسة</SelectItem>
                  <SelectItem value="grade">حسب المرحلة الدراسية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filterMode === "school" && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <SchoolIcon className="h-4 w-4" />
                  المدرسة
                </label>
                <Select
                  value={selectedSchoolId}
                  onValueChange={setSelectedSchoolId}
                  disabled={schoolsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={schoolsLoading ? "جاري التحميل..." : "اختر مدرسة"} />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={String(school.id)}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {filterMode === "grade" && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <SchoolIcon className="h-4 w-4" />
                  المرحلة الدراسية
                </label>
                <Select
                  value={selectedGradeId}
                  onValueChange={setSelectedGradeId}
                  disabled={gradesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={gradesLoading ? "جاري التحميل..." : "اختر المرحلة"} />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevels.map((grade) => (
                      <SelectItem key={grade.id} value={String(grade.id)}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-end justify-end">
              <Button variant="outline" onClick={handleManualRefresh} disabled={loadingStudents}>
                <RefreshCw className={`ml-2 h-4 w-4 ${loadingStudents ? "animate-spin" : ""}`} />
                تحديث القائمة
              </Button>
            </div>
          </div>

          {studentsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>حدث خطأ</AlertTitle>
              <AlertDescription>{studentsError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-muted/40">
              <CardHeader className="py-3">
                <CardTitle className="text-base">تفاصيل آخر استعلام</CardTitle>
                <CardDescription>
                  {lastFetchFilterLabel ? (
                    <>
                      {lastFetchFilterLabel}
                      {lastUpdatedAt && <div className="text-xs text-muted-foreground mt-1">آخر تحديث: {lastUpdatedAt}</div>}
                    </>
                  ) : (
                    "لم يتم اختيار مصدر بعد"
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-muted/40">
              <CardHeader className="py-3">
                <CardTitle className="text-base">عدد الطلاب</CardTitle>
                <CardDescription>{lastFetchCount} طالب مطابق للمعايير الحالية</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-muted/40">
              <CardHeader className="py-3">
                <CardTitle className="text-base">أرقام أولياء الأمور</CardTitle>
                <CardDescription>{parentPhoneNumbers.length} رقم فريد بعد إزالة التكرار</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>نص الرسالة</span>
                <span className="text-xs text-muted-foreground">{message.length} حرف</span>
              </label>
              <Textarea
                rows={8}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="اكتب الرسالة التي ترغب بإرسالها..."
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>الأرقام المستهدفة</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{parentPhoneNumbers.length}</Badge>
                  <Button variant="ghost" size="sm" onClick={handleCopyNumbers} disabled={!parentPhoneNumbers.length}>
                    <Copy className="ml-2 h-4 w-4" />
                    نسخ
                  </Button>
                </div>
              </div>
              <Textarea
                rows={8}
                readOnly
                value={parentPhoneNumbers.join("\n")}
                placeholder="ستظهر الأرقام هنا بعد اختيار المدرسة أو المرحلة..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={submitting || loadingStudents || parentPhoneNumbers.length === 0}>
              {submitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جارٍ الجدولة...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-4 w-4" />
                  إرسال الجدول الزمني
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">الطلاب المطابقون</h3>
              <div className="text-sm text-muted-foreground">
                يظهر حتى {Math.min(students.length, 200)} طالبًا. استخدم التصفية لتقليل القائمة عند الحاجة.
              </div>
            </div>
            <div className="border rounded-lg">
              <ScrollArea className="h-[340px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">الطالب</TableHead>
                      <TableHead className="text-center">المدرسة</TableHead>
                      <TableHead className="text-center">المرحلة/الصف</TableHead>
                      <TableHead className="text-center">عدد الأرقام</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingStudents && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            جاري التحميل...
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loadingStudents && students.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          لا يوجد طلاب مطابقون بعد. اختر مدرسة أو مرحلة.
                        </TableCell>
                      </TableRow>
                    )}
                    {students.slice(0, 200).map((student) => {
                      const name = (student as any).name || student.student_name;
                      const schoolName =
                        student.wished_school_details?.name ||
                        selectedSchool?.name ||
                        (student as any).school_name ||
                        "-";
                      const gradeName =
                        student.enrollments?.[0]?.grade_level?.name ||
                        selectedGrade?.name ||
                        (student as any).grade_level_name ||
                        "-";
                      const phoneCount = collectParentPhones(student).length;
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="text-center font-medium">{name}</TableCell>
                          <TableCell className="text-center">{schoolName}</TableCell>
                          <TableCell className="text-center">{gradeName}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{phoneCount}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentBulkSmsPage;


