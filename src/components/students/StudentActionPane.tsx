// src/components/students/StudentActionPane.tsx
import React from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Edit3, DollarSign, ClipboardList, CalendarCheck, UserCheck, Car, FileText, ShieldAlert
} from 'lucide-react';
import { Student } from '@/types/student'; // Assuming you pass the student object
import { useAuth } from '@/context/authcontext'; // To check permissions
import { cn } from '@/lib/utils';

interface StudentActionPaneProps {
    student: Student | null; // Pass the current student's data
    // Add studentAcademicYearId if actions depend on current enrollment
    currentEnrollmentId?: number | null;
}

interface ActionItem {
    label: string;
    href?: string; // For navigation links
    onClick?: () => void; // For actions opening dialogs or performing direct actions
    icon: React.ElementType;
    permission?: string; // Optional Spatie permission needed to see/use this action
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
}

const StudentActionPane: React.FC<StudentActionPaneProps> = ({ student, currentEnrollmentId }) => {
    const { studentId: studentIdFromParams } = useParams<{ studentId?: string }>(); // Get ID if needed
    const studentId = student?.id || (studentIdFromParams ? Number(studentIdFromParams) : null);

    if (!studentId) return null; // Or some placeholder

    // Define actions - these will depend heavily on your implemented features
    const actionItems: ActionItem[] = [
        {
            label: 'تعديل بيانات الطالب',
            href: `/students/${studentId}/edit`,
            icon: Edit3,
            permission: 'edit students', // Spatie permission
            variant: "outline",
        },
        {
            label: 'كشف حساب الأقساط',
            // This needs to open a dialog or navigate to a page that knows the student's current enrollment ID
            // For now, assuming it opens a dialog or needs context
            onClick: () => {
                if (currentEnrollmentId) {
                     // Logic to open FeeInstallmentViewerDialog - typically managed by parent (StudentView)
                     console.log("Open fee statement for enrollment:", currentEnrollmentId);
                } else {
                    console.warn("No current enrollment ID to show fee statement.");
                    // You might want to navigate to the enrollments page for this student
                    // navigate(`/students/${studentId}/enrollments`); // Example
                }
            },
            icon: DollarSign,
            permission: 'manage fee payments', // Example permission
            variant: "outline",
        },
        {
            label: 'رصد درجات الامتحانات',
            href: `/exams?student_id=${studentId}`, // Link to exam results, pre-filtering by student
            // Or more specifically `/students/${studentId}/results` if you have such a page
            icon: ClipboardList,
            permission: 'enter marks', // Example permission
            variant: "outline",
        },
        {
            label: 'سجل الحضور والغياب',
            href: `/students/${studentId}/attendance`, // Example path
            icon: CalendarCheck,
            permission: 'view student attendance',
            variant: "outline",
        },
        {
            label: 'ملف التسجيل السنوي',
            href: `/enrollments?student_id=${studentId}`, // Link to student enrollments list filtered
            icon: UserCheck,
            permission: 'manage enrollments',
            variant: "outline",
        },
        {
            label: 'بيانات النقل المدرسي',
            href: `/students/${studentId}/transport`, // Example path
            icon: Car,
            permission: 'view student transport',
            variant: "outline",
        },
        {
            label: 'طباعة ملف الطالب (PDF)',
            href: `/students/${studentId}/pdf`, // Backend route for student PDF
            icon: FileText,
            permission: 'view students', // Or a specific print permission
            variant: "secondary",
            className: "bg-primary/10 hover:bg-primary/20 text-primary" // Example custom styling
        },
        // Add more actions here, e.g., disciplinary actions, health records
    ];

    const visibleActions = actionItems.filter(action => true);

    return (
        <Card className="sticky top-[calc(theme(spacing.14)+1rem)] h-fit max-h-[calc(100vh-theme(spacing.14)-2rem)] flex flex-col"> {/* Sticky positioning */}
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
                <CardDescription>الوصول إلى العمليات المتعلقة بالطالب.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                <ScrollArea className="h-[calc(100%-0px)]" dir="rtl"> {/* Adjust height based on your needs */}
                    <nav className="grid gap-1 p-3">
                        {visibleActions.map((action) => (
                            action.href ? (
                                <RouterLink to={action.href} key={action.label}>
                                    <Button
                                        variant={action.variant || "ghost"}
                                        className={cn("w-full justify-start text-right", action.className)}
                                    >
                                        <action.icon className="ml-3 h-4 w-4" /> {/* RTL: ml */}
                                        {action.label}
                                    </Button>
                                </RouterLink>
                            ) : (
                                <Button
                                    key={action.label}
                                    variant={action.variant || "ghost"}
                                    className={cn("w-full justify-start text-right", action.className)}
                                    onClick={action.onClick}
                                >
                                    <action.icon className="ml-3 h-4 w-4" /> {/* RTL: ml */}
                                    {action.label}
                                </Button>
                            )
                        ))}
                        {visibleActions.length === 0 && (
                            <p className="p-4 text-sm text-muted-foreground text-center">لا توجد إجراءات متاحة.</p>
                        )}
                    </nav>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default StudentActionPane;