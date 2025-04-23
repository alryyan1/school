// src/pages/explorer/SchoolClassroomListPage.tsx
import React, { useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSchoolStore } from '@/stores/schoolStore'; // To get school name maybe
import { useClassroomStore } from '@/stores/classroomStore'; // To get classrooms
import { useSettingsStore } from '@/stores/settingsStore'; // To get active year
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, Users, ArrowRight } from 'lucide-react'; // Example icons
import { Button } from "@/components/ui/button";
import { Alert } from '@/components/ui/alert';

const containerVariants = { /* ... */ };
const itemVariants = { /* ... */ };

const SchoolClassroomListPage: React.FC = () => {
    const { schoolId } = useParams<{ schoolId: string }>();
    const navigate = useNavigate();
    const { schools, getSchoolById } = useSchoolStore(); // Get specific school details
    const { classrooms, fetchClassrooms, loading } = useClassroomStore();
    const { activeAcademicYearId } = useSettingsStore(); // Get active year

    const school = schools.find(s => s.id === Number(schoolId)); // Find school from store

    useEffect(() => {
        // Fetch classrooms for this school and the active year
        if (schoolId && activeAcademicYearId) {
            fetchClassrooms({ school_id: Number(schoolId), active_academic_year_id: activeAcademicYearId });
        } else if (schoolId && !activeAcademicYearId) {
             console.warn("Active Academic Year not set in settings!"); // Handle missing active year
             // Optionally show an error or prompt user
        }
         // Fetch specific school details if not already loaded in store? Optional.
         // if (schoolId && !school) getSchoolById(Number(schoolId));
    }, [schoolId, activeAcademicYearId, fetchClassrooms]); // Removed getSchoolById dependency for simplicity

    return (
         <section className="min-h-[calc(100vh-64px)] w-full py-6 px-4 md:py-8 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800" dir="rtl">
            <div className="container max-w-screen-xl mx-auto">
                 <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8 md:mb-10 flex items-center justify-between">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-blue-400">
                       الفصول الدراسية - {school?.name ?? '...'}
                    </h1>
                     <Button variant="outline" size="sm" onClick={() => navigate('/schools-explorer')}>
                         <ArrowRight className="ml-2 h-4 w-4" /> العودة للمدارس
                     </Button>
                </motion.div>

                 {!activeAcademicYearId && (
                     <Alert variant="destructive" className="mb-6">
                         <p className="font-semibold">تنبيه:</p>
                         <p>الرجاء تحديد العام الدراسي النشط في الإعدادات العامة لعرض الطلاب المسجلين بالفصول.</p>
                     </Alert>
                 )}

               

                {!loading && classrooms.length > 0 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6">
                        {classrooms.map((classroom) => (
                             <motion.div key={classroom.id} variants={itemVariants} className="h-full">
                                {/* Link to the student list for this classroom */}
                                 <RouterLink to={`/schools-explorer/${schoolId}/classrooms/${classroom.id}/students`} className="h-full block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
                                      <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} className="h-full" transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                         <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-primary/10 relative">
                                              {/* Student Count Badge */}
                                              <Badge variant="secondary" className="absolute top-2 left-2 z-10 flex items-center gap-1">
                                                 <Users className="h-3 w-3" /> {classroom.students_count ?? 0}
                                              </Badge>
                                              <CardContent className="flex flex-col items-center justify-center text-center p-6 flex-grow">
                                                  <DoorOpen className="h-14 w-14 text-gray-400 dark:text-gray-500 mb-3" strokeWidth={1.5}/>
                                                  <h3 className="mb-1 text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                                      {classroom.name}
                                                  </h3>
                                                  <p className="text-xs text-muted-foreground">
                                                      {classroom.grade_level?.name ?? 'مرحلة غير محددة'}
                                                  </p>
                                              </CardContent>
                                          </Card>
                                     </motion.div>
                                 </RouterLink>
                             </motion.div>
                        ))}
                    </motion.div>
                )}
             </div>
        </section>
    );
};
export default SchoolClassroomListPage;