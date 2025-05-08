// src/pages/explorer/SchoolExplorerPage.tsx
import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSchoolStore } from '@/stores/schoolStore'; // Adjust path
import { Card, CardContent } from "@/components/ui/card"; // Use shadcn card
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building, DoorOpen } from 'lucide-react'; // Example icons
import { cn } from "@/lib/utils";
// Animation Variants (same as before)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const SchoolExplorerPage: React.FC = () => {
    const { schools, fetchSchools, loading } = useSchoolStore();

    useEffect(() => {
        fetchSchools(); // Fetch schools (make sure backend includes classroom count)
    }, [fetchSchools]);

    return (
        <section className="min-h-[calc(100vh-64px)] w-full py-6 px-4 md:py-8 md:px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800" dir="rtl">
            <div className="container max-w-screen-xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 text-primary dark:text-blue-400"
                >
                    استكشاف المدارس
                </motion.h1>

                {loading && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5 lg:gap-6">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                    </div>
                )}

                {!loading && schools.length === 0 && (
                    <p className="text-center text-muted-foreground">لا توجد مدارس لعرضها.</p>
                )}

                {!loading && schools.length > 0 && (
                    <motion.div
                        variants={containerVariants} initial="hidden" animate="visible"
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5 lg:gap-6"
                    >
                        {schools.map((school) => (
                            <motion.div  transition={{duration:0.5}} animate={{opacity: 1, y: 0}}
                            initial={{ opacity: 0, y: 20 }} key={school.id} variants={itemVariants} className="h-full">
                                {/* Link to the classroom list for this school */}
                                <RouterLink to={`/schools-explorer/${school.id}/gradelevels`} className="h-full block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
                                     <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} className="h-full" transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                        <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-primary/10 relative">
                                             {/* Badge for classroom count */}
                                             <Badge variant="secondary" className="absolute top-2 left-2 z-10">
                                                {school.classrooms_count ?? 0} فصول
                                            </Badge>
                                             <CardContent className="flex flex-col items-center justify-center text-center p-6 flex-grow">
                                                 {/* Large Building Icon */}
                                                 <Building className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-3" strokeWidth={1.5}/>
                                                 <h3 className="mb-1 text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                                      {school.name}
                                                 </h3>
                                                 <p className="text-xs text-muted-foreground">
                                                    {school.code} - {school.address?.substring(0, 40)}...
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
export default SchoolExplorerPage;