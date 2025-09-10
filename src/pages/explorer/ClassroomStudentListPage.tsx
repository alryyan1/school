// src/pages/explorer/ClassroomStudentListPage.tsx
import React, { useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useClassroomStore } from '@/stores/classroomStore'; // Maybe needed for classroom details
import { useStudentEnrollmentStore } from '@/stores/studentEnrollmentStore'; // Get enrollments
// Removed useSettingsStore import
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, ArrowRight } from 'lucide-react'; // Fallback Icon
import { Button } from "@/components/ui/button";
import { Alert } from '@/components/ui/alert'; // Shadcn alert if available

const containerVariants = { /* ... */ };
const itemVariants = { /* ... */ };

const ClassroomStudentListPage: React.FC = () => {
    const { schoolId, classroomId } = useParams<{ schoolId: string, classroomId: string }>();
    const navigate = useNavigate();
    // Get active year from settings
    // Removed useSettingsStore - implement your preferred state management
    // Fetch enrollments for this classroom and year
    const { enrollments, fetchEnrollments, loading, error, clearEnrollments } = useStudentEnrollmentStore();
    // Optionally fetch specific classroom details if needed for title etc.
    // const { classrooms, fetchClassrooms } = useClassroomStore();
    // const classroom = classrooms.find(c => c.id === Number(classroomId));

    useEffect(() => {
        if (schoolId && classroomId) {
            // Note: academic_year_id temporarily removed until settings store is restored
            fetchEnrollments({
                school_id: Number(schoolId),
                // academic_year_id: activeAcademicYearId, // Temporarily removed
                classroom_id: Number(classroomId) // Specific classroom filter
            });
        } else {
             clearEnrollments();
        }
        // Cleanup on unmount
        return () => clearEnrollments();
    }, [schoolId, classroomId, fetchEnrollments, clearEnrollments]);

    return (
         <section className="min-h-[calc(100vh-64px)] w-full py-6 px-4 md:py-8 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800" dir="rtl">
            <div className="container max-w-screen-xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8 md:mb-10 flex items-center justify-between">
                    {/* Improve title - needs classroom name */}
                    <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-blue-400">
                       طلاب الفصل {/* Classroom Name Needed Here */}
                    </h1>
                     {/* Back button to classroom list */}
                     <Button variant="outline" size="sm" onClick={() => navigate(`..`)}>
                         <ArrowRight className="ml-2 h-4 w-4" /> العودة للفصول
                     </Button>
                </motion.div>

                {!loading && enrollments.length > 0 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                         {enrollments.map(({ student }) => ( // Destructure student from enrollment
                            student && ( // Check if student data exists
                                 <motion.div key={student.id} variants={itemVariants} className="flex flex-col items-center">
                                      {/* Link to student profile page */}
                                     <RouterLink to={`/students/${student.id}`} className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg p-1">
                                         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-2 border-2 border-transparent group-hover:border-primary transition-colors">
                                                 <AvatarImage src={student.image_url ?? undefined} alt={student.student_name} />
                                                 <AvatarFallback className="text-2xl">
                                                     {student.student_name ? student.student_name.substring(0, 1) : <UserIcon />}
                                                 </AvatarFallback>
                                             </Avatar>
                                         </motion.div>
                                          <p className="text-sm font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors truncate w-full px-1">
                                              {student.student_name}
                                         </p>
                                     </RouterLink>
                                 </motion.div>
                             )
                         ))}
                     </motion.div>
                )}
             </div>
        </section>
    );
};
export default ClassroomStudentListPage;