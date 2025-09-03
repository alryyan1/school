// src/pages/schools/SchoolList.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Optional: for page/row animations

// shadcn/ui components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // shadcn Alert
import { Input } from "@/components/ui/input"; // For potential search

// lucide-react icons
import {
  PlusCircle,
  MoreHorizontal,
  Edit3,
  Eye,
  AlertCircle,
  UserPlus,
} from "lucide-react";

import { useSchoolStore } from "@/stores/schoolStore"; // Adjust path
import { School } from "@/types/school"; // Adjust path
import AssignUserDialog from "@/components/schools/AssignUserDialog";
import { numberWithCommas } from "@/constants";
// Removed MUI Pagination, DataGrid, Tooltip, etc.

const SchoolList: React.FC = () => {
  const navigate = useNavigate();

  // --- Store Data & Actions ---
  // Assuming useSchoolStore doesn't use pagination for schools as per previous request
  const { schools, loading, error, fetchSchools } = useSchoolStore();

  // --- Local State ---
  const [searchTerm, setSearchTerm] = useState(""); // For local search/filter
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
  const [schoolToAssignUser, setSchoolToAssignUser] = useState<School | null>(null);

  // --- Effects ---
  useEffect(() => {
    fetchSchools(); // Fetches all schools
  }, [fetchSchools]);

  // --- Handlers ---
  const handleOpenAssignUserDialog = (school: School) => {
    setSchoolToAssignUser(school);
    setAssignUserDialogOpen(true);
  };

  const handleUserAssigned = () => {
    fetchSchools(); // Refresh the schools list
  };

  // --- Filtered Schools for Display ---
  const filteredSchools = React.useMemo(() => {
    if (!searchTerm) return schools;
    return schools.filter(
      (school) =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [schools, searchTerm]);

  // --- Animation Variants (Optional) ---
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // --- Render Skeletons for Loading ---
  if (loading) {
    return (
      <div
        className="container max-w-screen-xl mx-auto py-6 px-4 md:py-8 md:px-6"
        dir="rtl"
      >
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full mb-4" /> {/* For search input */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(4)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-5 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(4)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  // --- Render Error State ---
  if (error) {
    return (
      <div
        className="container max-w-screen-xl mx-auto py-6 px-4 md:py-8 md:px-6"
        dir="rtl"
      >
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => fetchSchools()} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div
      className="container max-w-screen-xl mx-auto py-6 px-4 md:py-8 md:px-6"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          قائمة المدارس
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="بحث بالاسم أو الرمز..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs w-full"
          />
          <Button
            onClick={() => navigate("/schools/create")}
            className="whitespace-nowrap"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> إضافة مدرسة
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead className="text-center">اسم المدرسة</TableHead>
              <TableHead className="hidden md:table-cell text-center">الرسوم السنوية</TableHead>
              <TableHead className="hidden lg:table-cell text-center">المستخدم المسؤول</TableHead>
              <TableHead className="w-[80px] text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchools.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchTerm
                    ? "لم يتم العثور على مدارس تطابق بحثك."
                    : "لا توجد مدارس لعرضها. قم بإضافة مدرسة جديدة."}
                </TableCell>
              </TableRow>
            ) : (
              filteredSchools.map((school, index) => (
                <motion.tr
                  key={school.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="text-center font-mono text-sm font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-center">{school.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                     {school.annual_fees ? (
                       <span className="font-mono text-sm text-green-600 dark:text-green-400">
                         { numberWithCommas(school.annual_fees)} جنيه
                       </span>
                     ) : (
                       <span className="text-muted-foreground text-sm">غير محدد</span>
                     )}
                   </TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    {school.user ? (
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{school.user.name}</span>
                        <span className="text-xs text-muted-foreground">{school.user.username}</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">فتح القائمة</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[160px]"
                      >
                        <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                        <DropdownMenuItem
                          onSelect={() => navigate(`/schools/${school.id}`)}
                        >
                          <Eye className="ml-2 h-4 w-4" /> عرض
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            navigate(`/schools/${school.id}/edit`)
                          }
                        >
                          <Edit3 className="ml-2 h-4 w-4" /> تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleOpenAssignUserDialog(school)}
                        >
                          <UserPlus className="ml-2 h-4 w-4" /> تعيين مستخدم
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                   
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Assign User Dialog */}
      <AssignUserDialog
        open={assignUserDialogOpen}
        onOpenChange={setAssignUserDialogOpen}
        school={schoolToAssignUser}
        onUserAssigned={handleUserAssigned}
      />
    </div>
  );
};

export default SchoolList;
