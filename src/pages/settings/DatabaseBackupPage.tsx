// src/pages/settings/DatabaseBackupPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Database, 
  Download, 
  Trash2, 
  ArrowLeft, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { DatabaseBackupApi, BackupFile } from '@/api/databaseBackupApi';
import { useSnackbar } from 'notistack';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DatabaseBackupPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupFile | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DatabaseBackupApi.list();
      if (response.data.success && response.data.backups) {
        setBackups(response.data.backups);
      } else {
        setError(response.data.message || 'فشل جلب قائمة النسخ الاحتياطية');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء جلب قائمة النسخ الاحتياطية');
      enqueueSnackbar('حدث خطأ أثناء جلب قائمة النسخ الاحتياطية', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    setError(null);
    try {
      const response = await DatabaseBackupApi.create();
      if (response.data.success) {
        enqueueSnackbar(response.data.message || 'تم إنشاء النسخة الاحتياطية بنجاح', { variant: 'success' });
        await fetchBackups();
      } else {
        setError(response.data.message || 'فشل إنشاء النسخة الاحتياطية');
        enqueueSnackbar(response.data.message || 'فشل إنشاء النسخة الاحتياطية', { variant: 'error' });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'حدث خطأ أثناء إنشاء النسخة الاحتياطية';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backup: BackupFile) => {
    setDownloading(backup.path);
    try {
      const response = await DatabaseBackupApi.download(backup.path);
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from path
      const filename = backup.path.split('/').pop() || `backup-${backup.date}.zip`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      enqueueSnackbar('تم تحميل النسخة الاحتياطية بنجاح', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'حدث خطأ أثناء تحميل النسخة الاحتياطية', { variant: 'error' });
    } finally {
      setDownloading(null);
    }
  };

  const handleOpenDeleteDialog = (backup: BackupFile) => {
    setSelectedBackup(backup);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedBackup(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBackup) return;
    
    try {
      const response = await DatabaseBackupApi.delete(selectedBackup.path);
      if (response.data.success) {
        enqueueSnackbar(response.data.message || 'تم حذف النسخة الاحتياطية بنجاح', { variant: 'success' });
        await fetchBackups();
      } else {
        enqueueSnackbar(response.data.message || 'فشل حذف النسخة الاحتياطية', { variant: 'error' });
      }
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'حدث خطأ أثناء حذف النسخة الاحتياطية', { variant: 'error' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  return (
    <section className="min-h-[calc(100vh-112px)] w-full py-6 px-4 md:py-8 md:px-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" dir="rtl">
      <div className="container max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-sky-400 mb-2">
              نسخ احتياطي لقاعدة البيانات
            </h1>
            <p className="text-muted-foreground">
              قم بإنشاء وتحميل وحذف النسخ الاحتياطية لقاعدة البيانات
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create Backup Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              إنشاء نسخة احتياطية جديدة
            </CardTitle>
            <CardDescription>
              قم بإنشاء نسخة احتياطية كاملة لقاعدة البيانات. قد تستغرق هذه العملية بضع دقائق.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCreateBackup} 
              disabled={creating}
              className="w-full sm:w-auto"
            >
              {creating ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Database className="ml-2 h-4 w-4" />
                  إنشاء نسخة احتياطية
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Backups List Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>النسخ الاحتياطية المتاحة</CardTitle>
                <CardDescription>
                  قائمة بجميع النسخ الاحتياطية المحفوظة
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchBackups}
                disabled={loading}
              >
                <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد نسخ احتياطية متاحة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">التاريخ والوقت</TableHead>
                      <TableHead className="text-center">الحجم</TableHead>
                      <TableHead className="text-center">العمر</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{backup.date}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{backup.size_human}</TableCell>
                        <TableCell className="text-center">{backup.age}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(backup)}
                              disabled={downloading === backup.path}
                            >
                              {downloading === backup.path ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDeleteDialog(backup)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذه النسخة الاحتياطية؟ لا يمكن التراجع عن هذا الإجراء.
                <br />
                <strong>التاريخ: {selectedBackup?.date}</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCloseDeleteDialog}>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
};

export default DatabaseBackupPage;

