// src/components/students/StudentActionPane.tsx
import React from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Edit3, FileText, List as ListIcon
} from 'lucide-react';
import { Student } from '@/types/student'; // Assuming you pass the student object
import { cn } from '@/lib/utils';
import { webUrl } from '@/constants';

interface StudentActionPaneProps {
    student: Student | null; // Pass the current student's data
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

const StudentActionPane: React.FC<StudentActionPaneProps> = ({ student }) => {
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
            label: 'التسجيلات',
            href: `/students/${studentId}/enrollments`,
            icon: ListIcon,
            permission: 'view students',
            variant: "outline",
        },
        {
            label: 'طباعة ملف الطالب (PDF)',
            href: `${webUrl}students/${studentId}/pdf`, // Backend route for student PDF
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
                        {visibleActions.map((_action) => (
                            _action.href ? (
                                <RouterLink to={_action.href} key={_action.label}>
                                    <Button
                                        variant={_action.variant || "ghost"}
                                        className={cn("w-full justify-start text-right", _action.className)}
                                    >
                                        <_action.icon className="ml-3 h-4 w-4" />
                                        {_action.label}
                                    </Button>
                                </RouterLink>
                            ) : (
                                <Button
                                    key={_action.label}
                                    variant={_action.variant || "ghost"}
                                    className={cn("w-full justify-start text-right", _action.className)}
                                    onClick={_action.onClick}
                                >
                                    <_action.icon className="ml-3 h-4 w-4" />
                                    {_action.label}
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