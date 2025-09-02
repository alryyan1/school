// src/pages/finances/FinanceDashboard.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRightLeft } from 'lucide-react';
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
              <h2 className="text-lg font-semibold">المصروفات</h2>
              <p className="text-sm text-muted-foreground mt-1">ادارة المصروفات وسجل المدفوعات</p>
              <Button asChild className="mt-4" variant="outline">
                <RouterLink to="/finances/expenses">عرض المصروفات</RouterLink>
              </Button>
            </div>
            <ArrowRightLeft className="h-12 w-12 text-amber-600" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FinanceDashboard;


