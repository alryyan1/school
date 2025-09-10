import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import axiosClient from '@/axios-client';

interface Note {
  id: number;
  note: string;
  user: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
}

interface Student {
  id: number;
  student_name: string;
  image_url?: string;
}

const StudentEnrollmentNotesPage: React.FC = () => {
  const { studentId, enrollmentId } = useParams<{ studentId: string; enrollmentId: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [formValue, setFormValue] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());

  // قوالب الملاحظات الجاهزة
  const noteTemplates = [
    'الطالب متميز في الأداء الأكاديمي',
    'يحتاج الطالب إلى مزيد من التحفيز والمتابعة',
    'سلوك الطالب ممتاز داخل الفصل',
    'الطالب يواجه صعوبة في مادة الرياضيات',
    'الطالب نشيط ومتفاعل في الأنشطة الصفية',
    'يحتاج إلى تحسين في الانضباط والالتزام',
    'الطالب لديه مواهب فنية مميزة',
    'يحتاج إلى دعم إضافي في اللغة العربية',
    'الطالب قائد طبيعي بين زملائه',
    'يحتاج إلى تطوير مهارات التواصل',
    'الطالب مجتهد ومنظم في أداء واجباته',
    'يحتاج إلى تعزيز الثقة بالنفس'
  ];

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get(`/student-notes?enrollment_id=${enrollmentId}`);
      setNotes(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setError('فشل تحميل الملاحظات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudent = async () => {
    try {
      const res = await axiosClient.get(`/students/${studentId}`);
      setStudent(res.data.data);
    } catch {
      setError('فشل تحميل بيانات الطالب');
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchStudent();
    // eslint-disable-next-line
  }, [enrollmentId, studentId]);

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        note: formValue,
        created_at: selectedDate ? selectedDate.toISOString(): undefined,
      };
      if (editingNoteId) {
        await axiosClient.put(`/student-notes/${editingNoteId}`, payload);
      } else {
        await axiosClient.post('/student-notes', {
          enrollment_id: enrollmentId,
          ...payload,
        });
      }
      setFormValue('');
      setShowForm(false);
      setEditingNoteId(null);
      setSelectedDate(dayjs());
      fetchNotes();
    } catch {
      setError('فشل حفظ الملاحظة');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (note: Note) => {
    setFormValue(note.note);
    setEditingNoteId(note.id);
    setSelectedDate(note.created_at ? dayjs(note.created_at) : dayjs());
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return;
    try {
      await axiosClient.delete(`/student-notes/${id}`);
      fetchNotes();
    } catch {
      setError('فشل حذف الملاحظة');
    }
  };

  const handleTemplateSelect = (template: string) => {
    setFormValue(template);
    setShowTemplates(false);
  };


  const handleOpenPdfInNewTab = () => {
    const pdfUrl = `http://192.168.100.12/school-backend/public/student-notes/pdf?enrollment_id=${enrollmentId}`;
    window.open(pdfUrl, '_blank');
  };
  console.log(student, 'student');
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4" dir="rtl">
      {/* معلومات الطالب */}
    

      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <RouterLink to={`/students/${studentId}/enrollments/${enrollmentId}/dashboard`}>
            <ArrowRight className="ml-2 h-4 w-4" />عودة للوحة التسجيل
          </RouterLink>
        </Button>
        <h2 className="text-2xl font-bold">إدارة الملاحظات</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenPdfInNewTab}>
            <FileText className="ml-2 h-4 w-4" />
            عرض PDF
          </Button>
          <Button variant="default" onClick={() => { setShowForm(true); setEditingNoteId(null); setFormValue(''); setSelectedDate(dayjs()); }}>
            <Plus className="ml-2 h-4 w-4" />إضافة ملاحظة
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة الملاحظات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center min-h-[100px]">
              <Loader2 className="animate-spin h-6 w-6 text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 border">الملاحظة</th>
                    <th className="p-2 border">المستخدم</th>
                    <th className="p-2 border">تاريخ الإنشاء</th>
                    <th className="p-2 border">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(notes) && notes.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-4 text-muted-foreground">لا توجد ملاحظات.</td></tr>
                  ) : (
                    Array.isArray(notes) ? notes.map((note) => (
                      <tr key={note.id} className="hover:bg-muted/30">
                        <td className="p-2 border">{note.note}</td>
                        <td className="p-2 border">{note.user?.name ?? '-'}</td>
                        <td className="p-2 border">{note.created_at ? new Date(note.created_at).toLocaleString('ar-EG') : '-'}</td>
                        <td className="p-2 border">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(note)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(note.id)} className="ml-2"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    )) : null
                  )}
                </tbody>
              </table>
            </div>
          )}
          <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingNoteId(null); setFormValue(''); setSelectedDate(dayjs()); }}>
            <DialogTitle>{editingNoteId ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}</DialogTitle>
            <DialogContent className='max-w-6xl'>
              <form id="note-form" onSubmit={handleAddOrEdit}>
                {/* زر القوالب الجاهزة */}
                {!editingNoteId && (
                  <div className="mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="mb-2"
                    >
                      <FileText className="ml-2 h-4 w-4" />
                      {showTemplates ? 'إخفاء القوالب' : 'عرض القوالب الجاهزة'}
                    </Button>
                    
                    {/* القوالب الجاهزة */}
                    {showTemplates && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 bg-muted/30 rounded-lg">
                        {noteTemplates.map((template, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-right h-auto p-2 text-wrap"
                            onClick={() => handleTemplateSelect(template)}
                          >
                            {template}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <textarea
                  className="w-full border rounded p-2 mt-2"
                  rows={3}
                  cols={100}
                  value={formValue}
                  onChange={e => setFormValue(e.target.value)}
                  placeholder="اكتب الملاحظة هنا أو اختر من القوالب الجاهزة أعلاه..."
                  required
                  disabled={formLoading}
                />
                <div className="mt-4">
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
                    <DatePicker
                      label="تاريخ الملاحظة"
                      value={selectedDate}
                      format='DD/MM/YYYY'
                      onChange={(date) => setSelectedDate(date)}
                    />
                  </LocalizationProvider>
                </div>
              </form>
            </DialogContent>
            <DialogActions>
              <Button className='p-1 m-1' onClick={() => { setShowForm(false); setEditingNoteId(null); setFormValue(''); setSelectedDate(dayjs()); }} disabled={formLoading}>إلغاء</Button>
              <Button type="submit" form="note-form" disabled={formLoading}>{editingNoteId ? 'تحديث' : 'إضافة'}</Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEnrollmentNotesPage; 