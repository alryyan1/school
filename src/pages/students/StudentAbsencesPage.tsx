import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { StudentAbsence } from '@/types/studentAbsence';
import { StudentAbsenceApi } from '@/api/studentAbsenceApi';
import { useSnackbar } from 'notistack';

const StudentAbsencesPage: React.FC = () => {
  const { studentId, enrollmentId } = useParams<{ studentId: string; enrollmentId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [absences, setAbsences] = useState<StudentAbsence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [excused, setExcused] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const load = async () => {
    if (!enrollmentId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await StudentAbsenceApi.list(Number(enrollmentId));
      setAbsences(resp.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'فشل تحميل سجلات الغياب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [enrollmentId]);

  const addAbsence = async () => {
    if (!enrollmentId || !date) { enqueueSnackbar('يرجى تحديد التاريخ', { variant: 'warning' }); return; }
    setSaving(true);
    try {
      await StudentAbsenceApi.create({ student_academic_year_id: Number(enrollmentId), absent_date: date, reason: reason || null, excused });
      setDate('');
      setReason('');
      setExcused(false);
      await load();
      enqueueSnackbar('تم تسجيل الغياب', { variant: 'success' });
    } catch (e:any) {
      enqueueSnackbar(e?.response?.data?.message || 'فشل تسجيل الغياب', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const deleteAbsence = async (id: number) => {
    try {
      await StudentAbsenceApi.delete(id);
      setAbsences(prev => prev.filter(a => a.id !== id));
      enqueueSnackbar('تم حذف سجل الغياب', { variant: 'success' });
    } catch (e:any) {
      enqueueSnackbar(e?.response?.data?.message || 'فشل حذف سجل الغياب', { variant: 'error' });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <RouterLink to={`/students/${studentId}/enrollments/${enrollmentId}/dashboard`}>
            <ArrowRight className="ml-2 h-4 w-4" />عودة للوحة التسجيل
          </RouterLink>
        </Button>
        <h2 className="text-2xl font-bold">غياب الطالب</h2>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">تسجيل غياب جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <Input placeholder="السبب (اختياري)" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="md:col-span-1 flex items-center gap-2">
              <Checkbox id="excused" checked={excused} onCheckedChange={(v) => setExcused(Boolean(v))} />
              <label htmlFor="excused" className="text-sm">مُبرّر؟</label>
            </div>
            <div className="md:col-span-1">
              <Button onClick={addAbsence} disabled={saving || !date} className="w-full">
                {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                <Plus className="ml-2 h-4 w-4" /> إضافة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">سجل الغياب</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : error ? (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          ) : absences.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">لا توجد سجلات غياب لهذا التسجيل.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 border">التاريخ</th>
                    <th className="p-2 border">السبب</th>
                    <th className="p-2 border">مُبرّر</th>
                    <th className="p-2 border">...</th>
                  </tr>
                </thead>
                <tbody>
                  {absences.map(a => (
                    <tr key={a.id}>
                      <td className="p-2 border">{a.absent_date}</td>
                      <td className="p-2 border">{a.reason || '-'}</td>
                      <td className="p-2 border">{a.excused ? 'نعم' : 'لا'}</td>
                      <td className="p-2 border text-center">
                        <Button variant="ghost" size="icon" onClick={() => deleteAbsence(a.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAbsencesPage;


