import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, House, Users } from "lucide-react"; // Example icons
import { containerVariants, itemVariants } from "@/constants";
import { Classroom } from "@/types/classroom";
function ClassroomCard({schoolId,classroom}:{classroom:Classroom, schoolId:string}) {
  return (
  
              <motion.div
                key={classroom.id}
                variants={itemVariants}
                className="h-full"
              >
                {/* Link to the student list for this classroom */}
                <RouterLink
                  to={`/schools-explorer/${schoolId}/classrooms/${classroom.id}/students`}
                  className="h-46 block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-primary/10 relative">
                      {/* Student Count Badge */}
                      <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 z-10 flex items-center gap-1"
                      >
                        <Users className="h-3 w-3" />{" "}
                        {classroom.students_count ?? 0}
                      </Badge>
                      <CardContent className="flex flex-col items-center justify-center text-center p-6 flex-grow">
                        <House
                          className="h-14 w-14 text-gray-400 dark:text-gray-500 mb-3"
                          strokeWidth={1.5}
                        />
                        <h3 className="mb-1 text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                          {classroom.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {classroom.grade_level?.name ?? "مرحلة غير محددة"}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </RouterLink>
              </motion.div>
            
     
  )
}

export default ClassroomCard