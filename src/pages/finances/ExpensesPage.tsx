// src/pages/finances/ExpensesPage.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Placeholder expenses page; wire to a real store/API later
const ExpensesPage: React.FC = () => {
  const expenses = [
    { id: 1, category: 'رواتب', amount: 150000, date: '2025-09-01' },
    { id: 2, category: 'صيانة', amount: 25000, date: '2025-09-02' },
  ];
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <section className="container mx-auto p-4 sm:p-6 max-w-4xl" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>المصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">اجمالي المصروفات: {total.toLocaleString()} جنيه</div>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead className="text-center">البند</TableHead>
                  <TableHead className="text-center">المبلغ</TableHead>
                  <TableHead className="text-center">التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-center">{e.id}</TableCell>
                    <TableCell className="text-center">{e.category}</TableCell>
                    <TableCell className="text-center">{e.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{e.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ExpensesPage;


