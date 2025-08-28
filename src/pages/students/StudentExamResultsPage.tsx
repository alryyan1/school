// src/pages/students/StudentExamResultsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    BookOpen,
    GraduationCap,
    Calendar,
    User,
    ArrowRight,
} from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
import { useExamStore } from '@/stores/examStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useExamScheduleStore } from '@/stores/examScheduleStore';
import { useExamResultStore } from '@/stores/examResultStore';
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore'; // For specific enrollment data
import { useSettingsStore } from '@/stores/settingsStore';
import { Student } from '@/types/student';
import { Exam } from '@/types/exam';
import { Subject } from '@/types/subject';
import { ExamSchedule } from '@/types/examSchedule';
import { ExamResultFormData } from '@/types/examResult';
import { StudentAcademicYear } from '@/types/studentAcademicYear';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { SubjectApi } from '@/api/subjectApi';
import { ExamScheduleApi } from '@/api/examScheduleApi';
import { StudentAcademicYearApi } from '@/api/studentAcademicYearApi';

// Extended form data for student page with additional display fields
type StudentExamResultFormData = Omit<ExamResultFormData, 'student_academic_year_id'> & {
    student_id: number;
    exam_schedule_id?: number;
    subject_id_display?: number;
    subject_name_display?: string;
    max_marks_display?: string | number;
};

type ResultsPageFormData = {
    results: StudentExamResultFormData[];
};

const StudentExamResultsPage: React.FC = () => {
    const { studentId: studentIdParam } = useParams<{ studentId: string }>();
    const studentId = Number(studentIdParam);
    const { enqueueSnackbar } = useSnackbar();

    const { activeAcademicYear } = useSettingsStore.getState();
    const {enrollments: studentEnrollments, fetchEnrollments: fetchStudentEnrollments} = useStudentEnrollmentStore();

    // --- Animation variants ---
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    // --- Local State ---
    const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
    const [currentStudentEnrollment, setCurrentStudentEnrollment] = useState<StudentAcademicYear | null>(null);
    console.log(currentStudentEnrollment, "currentStudentEnrollment");
    const [subjectsForGrade, setSubjectsForGrade] = useState<Subject[]>([]);
    const [scheduleMap, setScheduleMap] = useState<Record<number, ExamSchedule>>({}); // subjectId -> ExamSchedule
    const [pageError, setPageError] = useState<string | null>(null);
    const [isSubmittingResults, setIsSubmitting] = useState(false);
    const [loadingGradeSubjects, setLoadingGradeSubjects] = useState(false);
    const [schedulesLoading, setSchedulesLoading] = useState(false);

    // --- Store Data ---
    const { currentStudent, getStudentById: fetchStudentDetails, loading: studentLoading } = useStudentStore();
    const { exams: relevantExams, fetchExams, loading: examsLoading } = useExamStore();
    const { resultsForSchedule, fetchResultsForSchedule, saveResults, loadingResults: resultsLoading } = useExamResultStore();

    console.log(currentStudent, "currentStudent");
    // --- React Hook Form ---
    const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<ResultsPageFormData>({
        defaultValues: { results: [] }
    });
    const { fields, replace } = useFieldArray({ control, name: "results" });
   const {activeSchoolId} = useSettingsStore.getState();
    // --- Effects ---
    // 1. Fetch Student Details & Their Enrollments
    useEffect(() => {
        if (studentId) {
            fetchStudentDetails(studentId);
            fetchStudentEnrollments({academic_year: activeAcademicYear,school_id: activeSchoolId});   
            // Fetch all enrollments for this student to find the active one
            if (activeAcademicYear) {
                StudentAcademicYearApi.getAll({
                    academic_year: activeAcademicYear,
                            school_id:activeSchoolId
                            
                })
                .then(response => {
                    // Filter for the specific student from the response
                    const studentEnrollments = response.data.data?.filter(
                        enrollment => enrollment.student?.id === studentId
                    ) || [];
                    
                    if (studentEnrollments.length > 0) {
                        setCurrentStudentEnrollment(studentEnrollments[0]); // Take first enrollment
                    } else {
                        setPageError("لم يتم العثور على تسجيل نشط للطالب في العام الدراسي الحالي.");
                    }
                })
                .catch(() => setPageError("فشل تحميل بيانات تسجيل الطالب."));
            }
        }
    }, [studentId, fetchStudentDetails, activeAcademicYear]);

    // 2. Fetch Relevant Exams for the Student (based on active enrollment's school/year)
    useEffect(() => {
        if (currentStudentEnrollment?.school_id) {
            fetchExams({ school_id: currentStudentEnrollment.school_id });
        } else {
            useExamStore.getState().clearExams(); // Clear exams if no enrollment
        }
    }, [currentStudentEnrollment, fetchExams]);

    // 3. Fetch Subjects and Exam Schedules when an Exam and Enrollment (with grade) are selected
    useEffect(() => {
        const loadSubjectAndScheduleData = async () => {
            if (selectedExamId && currentStudentEnrollment?.grade_level_id && currentStudentEnrollment?.school_id && activeAcademicYear) {
                setLoadingGradeSubjects(true);
                setSchedulesLoading(true);
                try {
                     // Fetch subjects for the student's current grade, school, and active year
                    const subjectsResponse = await SubjectApi.getSubjectsForGradeLevel({
                        school_id: Number(currentStudentEnrollment.school_id),
                        academic_year: activeAcademicYear,
                        grade_level_id: Number(currentStudentEnrollment.grade_level_id)
                    });
                    setSubjectsForGrade(subjectsResponse.data.data || []);
                    console.log(subjectsResponse.data.data, "subjectsResponse");

                    // Fetch all schedules for this exam and the student's grade
                    const schedulesResponse = await ExamScheduleApi.getAll(Number(selectedExamId), {
                        grade_level_id: Number(currentStudentEnrollment.grade_level_id)
                    });

                    const scheduleData = schedulesResponse.data.data || [];
                    console.log(scheduleData, "scheduleData");
                    const newScheduleMap: Record<number, ExamSchedule> = {};
                    
                    // Add null/undefined checks before calling forEach
                    if (scheduleData && Array.isArray(scheduleData)) {
                        scheduleData.forEach(sch => { newScheduleMap[sch.subject_id] = sch; });
                        setScheduleMap(newScheduleMap);

                        // Also fetch existing results for each of these schedules
                        // This could be optimized later if needed
                        scheduleData.forEach(sch => fetchResultsForSchedule(sch.id));
                    } else {
                        setScheduleMap({});
                    }

                } catch (err) {
                    console.error("Error fetching subjects/schedules:", err);
                    enqueueSnackbar("فشل تحميل المواد أو جدول الامتحان.", { variant: "error" });
                    setSubjectsForGrade([]);
                    setScheduleMap({});
                } finally {
                    setLoadingGradeSubjects(false);
                    setSchedulesLoading(false);
                }
            } else {
                setSubjectsForGrade([]);
                setScheduleMap({});
                useExamResultStore.getState().clearResultsState(); // Clear previous results
            }
        };
        loadSubjectAndScheduleData();
    }, [selectedExamId, currentStudentEnrollment, activeAcademicYear, fetchResultsForSchedule, enqueueSnackbar]);
    console.log("Selected Exam ID:", selectedExamId);
    console.log("Current Student Enrollment:", currentStudentEnrollment);
    console.log("Active Academic Year ID:", activeAcademicYear);
    console.log("Subjects for Grade:", subjectsForGrade);
    console.log("Available Schedules for Exam/Grade:", scheduleMap); // From useExamScheduleStore
    console.log("Existing Results for selected Schedules:", resultsForSchedule); // From useExamResultStore

    // 4. Populate Form Array based on Subjects, Schedules, and existing Results
    useEffect(() => {
        if (!selectedExamId || subjectsForGrade.length === 0) {
            replace([]); // Clear form if no exam or subjects
            return;
        }

        const formValues: StudentExamResultFormData[] = subjectsForGrade.map(subject => {
            const schedule = scheduleMap[subject.id]; // Get schedule for this subject
            const existingResult = schedule && resultsForSchedule && Array.isArray(resultsForSchedule) ? 
                resultsForSchedule.find(
                    res => res.exam_schedule_id === schedule.id && res.student_id === currentStudentEnrollment?.id
                ) : null;

            return {
                student_id: Number(currentStudentEnrollment!.id), // Ensure it's a number
                exam_schedule_id: schedule?.id || 0,
                subject_id_display: subject.id,
                subject_name_display: subject.name,
                max_marks_display: schedule?.max_marks || 'N/A',

                marks_obtained: existingResult?.marks_obtained != null ? String(existingResult.marks_obtained) : '',
                is_absent: existingResult?.is_absent || false,
                grade_letter: existingResult?.grade_letter || '',
                remarks: existingResult?.remarks || ''
            };
        });
        replace(formValues);
    }, [selectedExamId, subjectsForGrade, scheduleMap, resultsForSchedule, currentStudentEnrollment, replace]);


    // --- Form Submission ---
    const onSubmit = async (data: ResultsPageFormData) => {
        if (!selectedExamId || !currentStudentEnrollment) return;

        const resultsToSubmit = data.results
            .filter(r => r.exam_schedule_id !== 0) // Only submit if there's a valid schedule
            .filter(r => (r.marks_obtained !== '' && r.marks_obtained !== null) || r.is_absent === true)
            .map(r => ({
                student_id: r.student_id,
                exam_schedule_id: r.exam_schedule_id, // Ensure this is the actual schedule ID
                marks_obtained: r.is_absent ? '' : r.marks_obtained,
                is_absent: r.is_absent,
                grade_letter: r.grade_letter,
                remarks: r.remarks,
            }));

        if (resultsToSubmit.length === 0) { /* ... info no data ... */ return; }

        // Since we are saving results for multiple schedules (one per subject) for one exam,
        // we need to call saveResults for each schedule, or backend bulkUpsert needs to handle an array
        // For simplicity with current saveResults, we'd iterate and save per schedule.
        // However, bulkUpsert is per *one* schedule.
        // This UI is different: it lists all subjects for a student for ONE EXAM PERIOD.
        // We need a different backend endpoint: POST /students/{student_enrollment_id}/exam-period/{exam_id}/results
        // For now, let's assume we save for each subject's schedule within the exam period.

        let success = true;
        let firstError = "";
        setIsSubmitting(true); // Manually manage global submitting state for the page

        for (const result of resultsToSubmit) {
            if (result.exam_schedule_id) { // Check if there is a schedule for this subject
                try {
                    // This is a simplified save. A true bulk save for one student across many schedules
                    // for one exam period would be better in a single API call.
                    await saveResults(result.exam_schedule_id, [result]); // saveResults expects an array
                } catch (err: any) {
                    success = false;
                    if(!firstError) firstError = err.message || "فشل حفظ بعض النتائج";
                    console.error("Error saving result for schedule", result.exam_schedule_id, err);
                }
            }
        }
        setIsSubmitting(false); // Reset global submitting state

        if (success) enqueueSnackbar("تم حفظ النتائج بنجاح!", { variant: "success" });
        else enqueueSnackbar(firstError || "فشل حفظ بعض النتائج.", { variant: "error" });

        // Refetch after saving
        if (selectedExamId && subjectsForGrade && Array.isArray(subjectsForGrade)) {
             subjectsForGrade.forEach(subj => {
                 const sch = scheduleMap[subj.id];
                 if (sch) fetchResultsForSchedule(sch.id);
             });
        }
    };

    // --- Render Logic ---
    if (studentLoading || (studentId && !currentStudent && !pageError)) {
        return <div className="container mx-auto p-6 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
    }
    if (pageError) {
        return <div className="container mx-auto p-6"><Alert variant="destructive"><AlertDescription>{pageError}</AlertDescription></Alert></div>;
    }
    if (!currentStudent) {
        return <div className="container mx-auto p-6"><Alert><AlertDescription>لم يتم العثور على الطالب.</AlertDescription></Alert></div>;
    }


    return (
        <div className="container max-w-screen-lg mx-auto py-6 px-4" dir="rtl">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <CardTitle className="text-xl font-semibold">سجل درجات الطالب: {currentStudent.student_name}</CardTitle>
                            <Button variant="outline" size="sm" asChild><Link to={`/students/${studentId}`}><ArrowRight className="ml-2 h-4 w-4"/>عودة لملف الطالب</Link></Button>
                        </div>
                        <CardDescription>
                            المدرسة: {currentStudentEnrollment?.school?.name ?? '-'} |
                            العام: {currentStudentEnrollment?.academic_year?.name ?? activeAcademicYear ?? '-'} |
                            الصف: {currentStudentEnrollment?.grade_level?.name ?? '-'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 items-end"> {/* Simplified for one filter */}
                        <div className="space-y-1">
                            <Label htmlFor="exam-period-select">دورة الامتحان *</Label>
                            <Select
                                value={selectedExamId ? String(selectedExamId) : ""}
                                onValueChange={val => setSelectedExamId(val ? Number(val) : "")}
                                disabled={examsLoading || !currentStudentEnrollment}
                            >
                                <SelectTrigger id="exam-period-select"><SelectValue placeholder={examsLoading ? "..." : "اختر دورة امتحان..."} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" " disabled>اختر دورة امتحان...</SelectItem>
                                    {relevantExams.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Loading/Error for Table Data */}
            {(resultsLoading || loadingGradeSubjects || schedulesLoading) && <div className="flex justify-center py-10"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>}
            {/* Display store error if any during table data fetch */}
            {useExamResultStore.getState().error && <Alert variant="destructive" className="mb-4"><AlertDescription>{useExamResultStore.getState().error}</AlertDescription></Alert>}


            {selectedExamId && currentStudentEnrollment && !resultsLoading && !loadingGradeSubjects && !schedulesLoading && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>إدخال الدرجات لدورة: {relevantExams.find(e => e.id === selectedExamId)?.name}</CardTitle>
                            <CardDescription>للطالب: {currentStudent.student_name} - الصف: {currentStudentEnrollment.grade_level?.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-x-auto">
                                <Table className="min-w-[700px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px] text-center ">المادة الدراسية</TableHead>
                                            <TableHead className="w-[100px] text-center">العلامة العظمى</TableHead>
                                            <TableHead className="w-[120px] text-center">الدرجة المحصلة</TableHead>
                                            <TableHead className="w-[80px] text-center">غياب؟</TableHead>
                                            <TableHead className="w-[150px]">التقدير</TableHead>
                                            <TableHead>ملاحظات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.length === 0 && (
                                            <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                {subjectsForGrade.length > 0 ? "جاري تجهيز حقول الإدخال..." : "لا توجد مواد معرفة لهذه المرحلة في العام الدراسي النشط أو لم يتم تحديد جدول امتحان لهذه المواد." }
                                            </TableCell></TableRow>
                                        )}
                                        {fields.map((fieldItem, index) => {
                                            const scheduleForSubject = scheduleMap[fieldItem.subject_id_display!]; // subject_id_display from our form prep
                                            // console.log(scheduleForSubject, "scheduleForSubject",scheduleMap,'scheduleMap',fieldItem,'fieldItem');
                                            const maxMarks = scheduleForSubject?.max_marks || '100'; // Fallback
                                            const isAbsent = watch(`results.${index}.is_absent`);
                                            const marksError = errors.results?.[index]?.marks_obtained;

                                            return (
                                            <motion.tr key={fieldItem.id} variants={itemVariants} initial="hidden" animate="visible">
                                                <TableCell className="font-medium py-2 text-center">{fieldItem.subject_name_display || 'مادة غير معروفة'}</TableCell>
                                                <TableCell className="text-center py-2">{maxMarks}</TableCell>
                                                <TableCell className="py-2">
                                                    <Controller name={`results.${index}.marks_obtained`} control={control}
                                                        rules={{
                                                            validate: value => isAbsent || ((value !== '' && value !== null) && !isNaN(parseFloat(value))) || 'مطلوب',
                                                            min: { value: 0, message: '>=0' },
                                                            max: { value: Number(maxMarks), message: `<= ${maxMarks}` }
                                                        }}
                                                        render={({ field: marksField }) => (
                                                            <Input type="number" placeholder={`0-${maxMarks}`}
                                                                {...marksField}
                                                                value={isAbsent ? '' : marksField.value}
                                                                onChange={(e) => marksField.onChange(e.target.value)}
                                                                disabled={isAbsent || isSubmitting || !scheduleForSubject}
                                                                className={cn("w-24 text-center", marksError && "border-destructive")}
                                                                step="0.25"
                                                            />
                                                        )} />
                                                    {marksError && <p className="text-xs text-destructive mt-1">{marksError.message}</p>}
                                                </TableCell>
                                                <TableCell className="text-center py-2">
                                                    <Controller name={`results.${index}.is_absent`} control={control}
                                                        render={({ field: absentField }) => (
                                                            <Checkbox id={`absent-${index}-${fieldItem.id}`} checked={!!absentField.value} onCheckedChange={(checked) => {
                                                                absentField.onChange(checked);
                                                                if (checked) setValue(`results.${index}.marks_obtained`, '');
                                                            }} disabled={isSubmitting || !scheduleForSubject} />
                                                        )} />
                                                </TableCell>
                                                <TableCell className="py-2">
                                                    <Controller name={`results.${index}.grade_letter`} control={control}
                                                        render={({ field }) => <Input placeholder="مثال: A+, جيد" {...field} value={field.value ?? ''} disabled={isSubmitting || !scheduleForSubject} className="w-28"/>} />
                                                </TableCell>
                                                <TableCell className="py-2">
                                                     <Controller name={`results.${index}.remarks`} control={control}
                                                         render={({ field }) => <Textarea placeholder="ملاحظات..." {...field} value={field.value ?? ''} rows={1} className="min-h-[38px]" disabled={isSubmitting || !scheduleForSubject} />} />
                                                </TableCell>
                                            </motion.tr>
                                        )})
                                        }
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                             <Button type="submit" disabled={isSubmitting || resultsLoading || loadingGradeSubjects || fields.length === 0} className="min-w-[150px]">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="ml-2 h-4 w-4" /> حفظ النتائج</>}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            )}
        </div>
    );
};

export default StudentExamResultsPage;