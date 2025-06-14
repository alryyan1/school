// src/pages/StudentOptions.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, List } from 'lucide-react';

const TermsAndPoliciesDialog = ({ open, onClose, onAccept }) => {
    const [accepted, setAccepted] = useState(false);

    const handleAcceptChange = (checked: boolean) => {
        setAccepted(checked);
    };

    const handleAccept = () => {
        if (accepted) {
            onAccept();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>شروط ولوائح القبول</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96 w-full rounded-md border p-4">
                    <div className="space-y-4 text-sm">
                        <p className="font-semibold">لوائح القبول والضوابط التربوية</p>
                        
                        <p>1) التقيد بالأداب الدينية والتمسك بها داخل وخارج المدرسة.</p>
                        
                        <p>2) الالتزام بالسلوك القويم مع الإدارة والمعلمين والموظفين والعمال والزملاء.</p>
                        
                        <p>3) الالتزام بالزي المدرسي طيلة العام الدراسي ويجب ان لا يكون ضيقا ولاق قصيرا ويطرد من المدرسة في حالة عدم الالتزام بعد الاتصال على ولي الامر.</p>
                        
                        <p>4) الظهور بمظهر شاذ وغير لائق كحلاقة راس شاذة وغير مرتبة ومهذبة واطالة الاظافر ولبس السلاسل والخاتم والذهب وغير ذلك يطرد من المدرسة في حالة عدم الالتزام بعد الاتصال على ولي الامر.</p>
                        
                        <p>5) الالتزام بالخروج من الفصل اثناء الحصص الا بعد نهاية اليوم الدراسي او خلال الفسحة.</p>
                        
                        <p>6) عدم حمل وتبادل اشرطة الكاست والاسطوانات والذواكر والفلاشات في المدرسة.</p>
                        
                        <p>7) الالتزام بالحضور للمدرسة بالوقت المحدد وعد الخروج منها الا بعد نهاية الدوام.</p>
                        
                        <p>8) الالتزام بعدم حمل المقتنيات الثمينة والالكترونية خاصة الموبايلات والتي ستصادر وتسلم الى نهاية العام الدراسي.</p>
                        
                        <p>9) الالتزام باحضار جميع الأدوات المدرسية وان لا يستخدم الدفتر او الكراس الا لمادة واحدة.</p>
                        
                        <p>10) الالتزام بالواجبات المدرسية لكل مادة وعرضها وتسليمها لمعلم المادة لتصحيحها وستكون هناك متابعة إدارية من مشرف الصف والإدارة.</p>
                        
                        <p>11) الالزام بالجلوس في الفصل وفي المكان التي تحدده إدارة المدرسة.</p>
                        
                        <p>12) اذا كان هناك طالب له ظرف خاص او حالة مرضية دائمة يجب توضيع ذلك بتقرير طبي يسلم للوحدة. الصحية بالمدرسة وفي حالة غياب الطالب بسبب حالة مرضية يجب الاتصال بإدارة المدرسة واعلامها بذلك.</p>
                        
                        <p>13) كل طالب في الصف الثالث الثانوي يجب ان يحضر كل المواد الاجبارية.</p>
                        
                        <p>14) الامتحانات الموحدة من الولاية او المحلية او امتحانات الشهادة يتحمل الطالب رسومها وذلك على حسب ما تحدده الولاية او المحلية وهي خارج الرسوم المدرسية.</p>
                        
                        <p>15) على جميع الطلاب المحافظة على مقتنيات واثاث المدرسة فهي ملك للجميع وعدم الكتابة على الحوائط والادراج وكل من يخالف ذلك يعرض نفسه لعقوبة الفصل.</p>
                        
                        <p>16) في حال عدم الالتزام بما جاء أعلاه من تعليمات يحق للمدرسة بفصل الطالب ولا يسترج رسومه.</p>
                        
                        <p>17) لا ترد الرسوم باي حال من الأحوال حيث يترتب عليها حجز مقعد دراسي او مقعد ترحيل.</p>
                    </div>
                </ScrollArea>
                <DialogFooter className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="accept-terms"
                            checked={accepted}
                            onCheckedChange={handleAcceptChange}
                        />
                        <Label htmlFor="accept-terms">أوافق على الشروط واللوائح</Label>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>إلغاء</Button>
                        <Button onClick={handleAccept} disabled={!accepted}>متابعة</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const StudentOptions: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAcceptTerms = () => {
        handleCloseDialog();
        navigate('/students/create');
    };

    return (
        <div className="container mx-auto p-6" dir="rtl">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">إدارة الطلاب</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                            onClick={handleOpenDialog}
                            className="h-20 text-lg"
                        >
                            <UserPlus className="ml-2 h-6 w-6" />
                            إضافة طالب جديد
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            asChild
                            className="h-20 text-lg"
                        >
                            <Link to="/students/list">
                                <List className="ml-2 h-6 w-6" />
                                عرض قائمة الطلاب
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <TermsAndPoliciesDialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                onAccept={handleAcceptTerms} 
            />
        </div>
    );
};

export default StudentOptions;