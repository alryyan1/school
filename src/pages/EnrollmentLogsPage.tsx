import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  DollarSign,
  Percent,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { enrollmentLogApi, EnrollmentLog, EnrollmentLogFilters, EnrollmentLogStatistics } from '@/api/enrollmentLogApi';
import { useAuth } from '@/context/authcontext';

const EnrollmentLogsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { userSchoolId } = useAuth();

  const [logs, setLogs] = useState<EnrollmentLog[]>([]);
  const [statistics, setStatistics] = useState<EnrollmentLogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: null,
    to: null,
  });

  const [filters, setFilters] = useState<EnrollmentLogFilters>({
    per_page: 15,
    page: 1,
    school_id: userSchoolId || undefined,
  });

  const [actionTypes] = useState({
    'grade_level_change': 'تغيير المرحلة الدراسية',
    'status_change': 'تغيير حالة التسجيل',
    'classroom_change': 'تغيير الفصل الدراسي',
    'fees_change': 'تغيير الرسوم',
    'discount_change': 'تغيير الخصم',
    'academic_year_change': 'تغيير العام الدراسي',
  });

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await enrollmentLogApi.getLogs(filters);
      setLogs(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'فشل في تحميل سجل التغييرات';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await enrollmentLogApi.getStatistics({
        school_id: userSchoolId || undefined,
        date_from: filters.date_from,
        date_to: filters.date_to,
      });
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  useEffect(() => {
    loadLogs();
    loadStatistics();
  }, [filters]);

  const handleFilterChange = (key: keyof EnrollmentLogFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'grade_level_change':
        return <BookOpen className="w-4 h-4" />;
      case 'status_change':
        return <GraduationCap className="w-4 h-4" />;
      case 'classroom_change':
        return <User className="w-4 h-4" />;
      case 'fees_change':
        return <DollarSign className="w-4 h-4" />;
      case 'discount_change':
        return <Percent className="w-4 h-4" />;
      case 'academic_year_change':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'grade_level_change':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'status_change':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'classroom_change':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fees_change':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'discount_change':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'academic_year_change':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">سجل تغييرات التسجيل</h1>
          <p className="text-muted-foreground mt-2">
            عرض جميع التغييرات التي تمت على تسجيلات الطلاب
          </p>
        </div>
        <Button onClick={loadLogs} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي التغييرات</p>
                  <p className="text-2xl font-bold">{statistics.total_logs}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">تغييرات المرحلة</p>
                  <p className="text-2xl font-bold">{statistics.action_type_stats.grade_level_change || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">تغييرات الحالة</p>
                  <p className="text-2xl font-bold">{statistics.action_type_stats.status_change || 0}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">تغييرات الفصل</p>
                  <p className="text-2xl font-bold">{statistics.action_type_stats.classroom_change || 0}</p>
                </div>
                <User className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            فلاتر البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم الطالب</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="ابحث عن اسم الطالب..."
                  value={filters.student_name || ''}
                  onChange={(e) => handleFilterChange('student_name', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">نوع التغيير</label>
              <Select
                value={filters.action_type || ''}
                onValueChange={(value) => handleFilterChange('action_type', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">جميع الأنواع</SelectItem>
                  {Object.entries(actionTypes).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">من تاريخ</label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">إلى تاريخ</label>
              <Input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل التغييرات</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الطالب</TableHead>
                      <TableHead>نوع التغيير</TableHead>
                      <TableHead>التفاصيل</TableHead>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          لا توجد تغييرات مسجلة
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {log.enrollment?.student?.student_name || 'غير محدد'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {log.enrollment?.gradeLevel?.name} - {log.enrollment?.school?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getActionColor(log.action_type)}>
                              <div className="flex items-center gap-1">
                                {getActionIcon(log.action_type)}
                                {log.action_type_label}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm">{log.description}</p>
                              {log.metadata && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {log.metadata.old_grade_level_name && log.metadata.new_grade_level_name && (
                                    <span>
                                      من {log.metadata.old_grade_level_name} إلى {log.metadata.new_grade_level_name}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {log.user?.name || 'غير محدد'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {formatDate(log.changed_at)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>عرض التفاصيل</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    عرض {pagination.from} إلى {pagination.to} من {pagination.total} نتيجة
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                      السابق
                    </Button>
                    <span className="text-sm px-3 py-1 rounded-md border bg-muted">
                      {pagination.current_page} / {pagination.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentLogsPage;
