import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// removed unused Input import
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight, Plus, Trash2, FileText, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudentWarning, WarningSeverity } from '@/types/studentWarning';
import { StudentWarningApi } from '@/api/studentWarningApi';
import { useSnackbar } from 'notistack';
import { webUrl } from '@/constants';

const StudentWarningsPage: React.FC = () => {
  const { studentId, enrollmentId } = useParams<{ studentId: string; enrollmentId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [warnings, setWarnings] = useState<StudentWarning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [severity, setSeverity] = useState<WarningSeverity>('low');
  const [reason, setReason] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewText, setViewText] = useState<string>('');
  const [editingReasons, setEditingReasons] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!enrollmentId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await StudentWarningApi.list(Number(enrollmentId));
      setWarnings(resp.data.data);
    } catch (e: unknown) {
      const message = extractErrorMessage(e, 'فشل تحميل الإنذارات');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => { load(); }, [load]);

  // Normalize only newline characters for cross-platform consistency without collapsing whitespace
  const normalizeForSave = (text: string) => (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const addWarning = async () => {
    if (!enrollmentId || !reason.trim()) { enqueueSnackbar('يرجى إدخال السبب', { variant: 'warning' }); return; }
    setIssuing(true);
    try {
      await StudentWarningApi.create({ enrollment_id: Number(enrollmentId), severity, reason: normalizeForSave(reason), issued_at: new Date().toISOString(), issued_by_user_id: null });
      setReason('');
      setSeverity('low');
      await load();
      enqueueSnackbar('تم تسجيل الإنذار', { variant: 'success' });
    } catch (e: unknown) {
      const message = extractErrorMessage(e, 'فشل تسجيل الإنذار');
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setIssuing(false);
    }
  };

  const deleteWarning = async (id: number) => {
    try {
      await StudentWarningApi.delete(id);
      setWarnings(prev => prev.filter(w => w.id !== id));
      enqueueSnackbar('تم حذف الإنذار', { variant: 'success' });
    } catch (e: unknown) {
      const message = extractErrorMessage(e, 'فشل حذف الإنذار');
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleReasonChange = (id: number, value: string) => {
    setEditingReasons(prev => ({ ...prev, [id]: value }));
  };

  const saveReason = async (id: number) => {
    const newText = (editingReasons[id] ?? '');
    try {
      setSavingId(id);
      const normalized = normalizeForSave(newText);
      await StudentWarningApi.update(id, { reason: normalized });
      setWarnings(prev => prev.map(w => (w.id === id ? { ...w, reason: normalized } : w)));
      enqueueSnackbar('تم حفظ السبب', { variant: 'success' });
    } catch (e: unknown) {
      const message = extractErrorMessage(e, 'فشل حفظ السبب');
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  const extractErrorMessage = (e: unknown, fallback: string): string => {
    if (typeof e === 'object' && e !== null) {
      const maybeResp = (e as { response?: { data?: { message?: string } } }).response;
      const msg = maybeResp?.data?.message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
    return fallback;
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <RouterLink to={`/students/${studentId}/enrollments/${enrollmentId}/dashboard`}>
            <ArrowRight className="ml-2 h-4 w-4" />عودة للوحة التسجيل
          </RouterLink>
        </Button>
        <h2 className="text-2xl font-bold">إنذارات الطالب</h2>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">تسجيل إنذار جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <Select value={severity} onValueChange={(v) => setSeverity(v as WarningSeverity)}>
                <SelectTrigger>
                  <SelectValue placeholder="الدرجة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">مرتفع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Textarea placeholder="اكتب سبب الإنذار..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            </div>
            <div className="md:col-span-1">
              <Button onClick={addWarning} disabled={issuing || !reason.trim()} className="w-full">
                {issuing && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                <Plus className="ml-2 h-4 w-4" /> إضافة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">سجل الإنذارات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : error ? (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          ) : warnings.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">لا توجد إنذارات لهذا التسجيل.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 border">التاريخ</th>
                    <th className="p-2 border">الدرجة</th>
                    <th className="p-2 border">السبب</th>
                    <th className="p-2 border">...</th>
                  </tr>
                </thead>
                <tbody>
                  {warnings.map(w => (
                    <tr key={w.id}>
                      <td className="p-2 border">{w.issued_at ? new Date(w.issued_at).toLocaleString('ar-EG') : '-'}</td>
                      <td className="p-2 border">{w.severity === 'high' ? 'مرتفع' : w.severity === 'medium' ? 'متوسط' : 'منخفض'}</td>
                      <td className="p-2 border align-top">
                        <Textarea
                          rows={2}
                          value={editingReasons[w.id] ?? w.reason ?? ''}
                          onChange={(e) => handleReasonChange(w.id, e.target.value)}
                          onBlur={() => saveReason(w.id)}
                          disabled={savingId === w.id}
                        />
                      </td>
                      <td className="p-2 border text-center space-x-1 space-x-reverse">
                     
                        <Button variant="ghost" size="icon" onClick={() => deleteWarning(w.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`${webUrl}student-warnings/${w.id}/pdf`} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 text-primary" />
                          </a>
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

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>تفاصيل الإنذار</DialogTitle>
          </DialogHeader>
          <div className="border rounded-md p-3 whitespace-pre-wrap text-right" dir="rtl">
            {viewText || '-'}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentWarningsPage;


