// src/pages/finances/FinanceDashboard.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRightLeft, Users, BookOpen, DollarSign } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const FinanceDashboard: React.FC = () => {
  return (
    <section className="container mx-auto p-4 sm:p-6 max-w-5xl" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">الايرادات</h2>
              <p className="text-sm text-muted-foreground mt-1">ملخص جميع الايرادات بما في ذلك رسوم الطلاب المسجلين</p>
              <Button asChild className="mt-4">
                <RouterLink to="/finances/revenues">عرض الايرادات</RouterLink>
              </Button>
            </div>
            <Wallet className="h-12 w-12 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">تسجيلات الترحيل</h2>
              <p className="text-sm text-muted-foreground mt-1">ايرادات رسوم الطلاب المسجلين في الترحيل</p>
              <Button asChild className="mt-4" variant="outline">
                <RouterLink to="/finances/deportation-enrollments">عرض تسجيلات الترحيل</RouterLink>
              </Button>
            </div>
            <Users className="h-12 w-12 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">المصروفات</h2>
              <p className="text-sm text-muted-foreground mt-1">ادارة المصروفات وسجل المدفوعات</p>
              <Button asChild className="mt-4" variant="outline">
                <RouterLink to="/finances/expenses">عرض المصروفات</RouterLink>
              </Button>
            </div>
            <ArrowRightLeft className="h-12 w-12 text-amber-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">دفتر الحسابات</h2>
              <p className="text-sm text-muted-foreground mt-1">عرض جميع المعاملات حسب طريقة الدفع</p>
              <Button asChild className="mt-4" variant="outline">
                <RouterLink to="/finances/ledger">عرض دفتر الحسابات</RouterLink>
              </Button>
            </div>
            <BookOpen className="h-12 w-12 text-purple-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">الإيرادات الأخرى</h2>
              <p className="text-sm text-muted-foreground mt-1">إدارة الإيرادات الأخرى المصنفة حسب الفئات</p>
              <Button asChild className="mt-4" variant="outline">
                <RouterLink to="/finances/other-revenues">عرض الإيرادات الأخرى</RouterLink>
              </Button>
            </div>
            <DollarSign className="h-12 w-12 text-emerald-600" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FinanceDashboard;


