import React, { useEffect, useMemo, useState } from 'react';
import { useTeacherStore } from '@/stores/teacherStore';
import { Teacher } from '@/types/teacher';
import { ultramsgApi, BulkSendStatus } from '@/api/ultramsgApi';
import { useSnackbar } from 'notistack';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Send, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const TeachersWhatsappBulkPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { teachers, loading, error, fetchTeachers } = useTeacherStore();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bulkSendId, setBulkSendId] = useState<number | null>(null);
  const [bulkStatus, setBulkStatus] = useState<BulkSendStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Auto-refresh status if we have an active bulk send
  useEffect(() => {
    if (!bulkSendId || !bulkStatus || bulkStatus.status === 'completed') return;

    const interval = setInterval(async () => {
      try {
        const status = await ultramsgApi.getBulkSendStatus(bulkSendId);
        setBulkStatus(status);
      } catch (e) {
        console.error('Failed to refresh bulk send status:', e);
      }
    }, 2000); // Refresh every 2 seconds

    return () => clearInterval(interval);
  }, [bulkSendId, bulkStatus]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      (t.phone || '').toLowerCase().includes(q) ||
      (t.whatsapp_number || '').toLowerCase().includes(q)
    );
  }, [teachers, search]);

  const allVisibleIds = useMemo(() => filtered.map((t) => t.id), [filtered]);
  const isAllVisibleChecked = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleAllVisible = (checked: boolean) => {
    if (checked) {
      const merged = Array.from(new Set([...selectedIds, ...allVisibleIds]));
      setSelectedIds(merged);
    } else {
      const remaining = selectedIds.filter((id) => !allVisibleIds.includes(id));
      setSelectedIds(remaining);
    }
  };

  const toggleOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const getRecipientForTeacher = (t: Teacher): string | null => {
    const number = (t.whatsapp_number || t.phone || '').trim();
    if (!number) return null;
    // Ensure E.164 with country code if needed; backend may accept local, but normalize best-effort
    // For simplicity, send as-is; adjust normalization rules if required
    return number;
  };

  const handleSend = async () => {
    const chosen = teachers.filter((t) => selectedIds.includes(t.id));
    const recipients = chosen
      .map(getRecipientForTeacher)
      .filter((x): x is string => !!x);

    if (recipients.length === 0) {
      enqueueSnackbar('اختر معلمين لديهم رقم واتساب أو هاتف.', { variant: 'warning' });
      return;
    }
    if (!message.trim()) {
      enqueueSnackbar('اكتب نص الرسالة أولاً.', { variant: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await ultramsgApi.bulkSendText({ recipients, body: message.trim() });
      setBulkSendId(res.bulk_send_id);
      enqueueSnackbar(`تم جدولة الإرسال لعدد ${res.queued} معلمين (كل 30 ثانية).`, { variant: 'success' });
      
      // Fetch initial status
      const status = await ultramsgApi.getBulkSendStatus(res.bulk_send_id);
      setBulkStatus(status);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'فشل جدولة الإرسال', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!bulkSendId) return;
    
    setRefreshing(true);
    try {
      const status = await ultramsgApi.getBulkSendStatus(bulkSendId);
      setBulkStatus(status);
    } catch (e: any) {
      enqueueSnackbar('فشل تحديث الحالة', { variant: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimeRemaining = (seconds: number | null): string => {
    if (!seconds || seconds <= 0) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) return `${minutes}د ${secs}ث`;
    return `${secs}ث`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline"><Clock className="w-3 h-3 ml-1" />في الانتظار</Badge>;
      case 'sent': return <Badge variant="default" className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 ml-1" />تم الإرسال</Badge>;
      case 'failed': return <Badge variant="destructive"><XCircle className="w-3 h-3 ml-1" />فشل</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMessageTimeRemaining = (msg: any) => {
    if (msg.status === 'sent' || msg.status === 'failed') {
      return <span className="text-gray-500">-</span>;
    }
    
    const scheduledTime = new Date(msg.scheduled_at).getTime();
    const now = new Date().getTime();
    const timeRemaining = Math.max(0, Math.floor((scheduledTime - now) / 1000));
    
    if (timeRemaining <= 0) {
      return <span className="text-blue-600 font-medium">الآن</span>;
    }
    
    return (
      <span className="text-orange-600 font-medium">
        {formatTimeRemaining(timeRemaining)}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>إرسال واتساب جماعي للمعلمين</CardTitle>
            {bulkSendId && (
              <Button onClick={handleRefreshStatus} disabled={refreshing} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>خطأ</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Progress Tracking */}
          {bulkStatus && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">تتبع الإرسال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{bulkStatus.progress.total}</div>
                    <div className="text-sm text-gray-600">إجمالي</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{bulkStatus.progress.sent}</div>
                    <div className="text-sm text-gray-600">تم الإرسال</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{bulkStatus.progress.failed}</div>
                    <div className="text-sm text-gray-600">فشل</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{bulkStatus.progress.pending}</div>
                    <div className="text-sm text-gray-600">في الانتظار</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التقدم</span>
                    <span>{bulkStatus.progress.percentage}%</span>
                  </div>
                  <Progress value={bulkStatus.progress.percentage} className="h-2" />
                </div>

                {bulkStatus.timing.time_until_next_seconds !== null && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span>الرسالة التالية خلال: {formatTimeRemaining(bulkStatus.timing.time_until_next_seconds)}</span>
                  </div>
                )}

                {bulkStatus.status === 'completed' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>تم الانتهاء</AlertTitle>
                    <AlertDescription>تم إرسال جميع الرسائل بنجاح</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Checkbox checked={isAllVisibleChecked} onCheckedChange={(c) => toggleAllVisible(!!c)} id="checkAll" />
              <label htmlFor="checkAll" className="text-sm">تحديد كل الظاهر</label>
            </div>
            <Input placeholder="بحث بالاسم أو الرقم" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-center">تحديد</TableHead>
                    <TableHead className="text-center">الاسم</TableHead>
                    <TableHead className="text-center">الهاتف</TableHead>
                    <TableHead className="text-center">واتساب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow><TableCell colSpan={4} className="text-center">جاري التحميل...</TableCell></TableRow>
                  )}
                  {!loading && filtered.map((t) => {
                    const checked = selectedIds.includes(t.id);
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="text-center">
                          <Checkbox checked={checked} onCheckedChange={(c) => toggleOne(t.id, !!c)} />
                        </TableCell>
                        <TableCell className="text-center">{t.name}</TableCell>
                        <TableCell className="text-center">{t.phone || '-'}</TableCell>
                        <TableCell className="text-center">{t.whatsapp_number || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm">نص الرسالة</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="اكتب رسالتك هنا..." />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={submitting || bulkStatus?.status === 'in_progress'}>
              <Send className="ml-2 h-4 w-4" />
              {submitting ? 'جارٍ الجدولة...' : 'إرسال مجدول'}
            </Button>
          </div>

          {/* Message Details Table */}
          {bulkStatus && bulkStatus.messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الرسائل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">#</TableHead>
                          <TableHead className="text-center">المستقبل</TableHead>
                          <TableHead className="text-center">الحالة</TableHead>
                          <TableHead className="text-center">الوقت المتبقي</TableHead>
                          <TableHead className="text-center">مجدول في</TableHead>
                          <TableHead className="text-center">تم الإرسال في</TableHead>
                          <TableHead className="text-center">ملاحظات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bulkStatus.messages.map((msg) => (
                          <TableRow key={msg.id}>
                            <TableCell className="text-center">{msg.sequence_order}</TableCell>
                            <TableCell className="text-center font-mono">{msg.recipient}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(msg.status)}</TableCell>
                            <TableCell className="text-center text-sm">
                              {getMessageTimeRemaining(msg)}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {new Date(msg.scheduled_at).toLocaleString('ar-SA')}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {msg.sent_at ? new Date(msg.sent_at).toLocaleString('ar-SA') : '-'}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {msg.error_message || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeachersWhatsappBulkPage;


