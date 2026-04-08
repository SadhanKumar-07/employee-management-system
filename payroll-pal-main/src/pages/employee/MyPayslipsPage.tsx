import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { payrollApi } from '@/services/api';
import type { Payroll } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

const MyPayslipsPage = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<Payroll[]>([]);
  const [selected, setSelected] = useState<Payroll | null>(null);

  useEffect(() => {
    if (user?.employee_id) payrollApi.getByEmployee(user.employee_id).then(setPayslips);
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader title="My Payslips" description="View and download your salary slips" />

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead><TableHead>Gross</TableHead><TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.map(p => (
              <TableRow key={p.payroll_id}>
                <TableCell className="font-medium">{p.month}</TableCell>
                <TableCell>₹{p.gross_salary.toLocaleString()}</TableCell>
                <TableCell className="text-destructive">{p.deductions > 0 ? `₹${p.deductions.toLocaleString()}` : '—'}</TableCell>
                <TableCell className="font-semibold">₹{p.net_salary.toLocaleString()}</TableCell>
                <TableCell><StatusBadge status={p.payment_status} /></TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(p)}>
                    <FileText className="w-4 h-4 mr-1" />View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {payslips.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payslips found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Payslip Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Payslip — {selected?.month}</DialogTitle></DialogHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-muted space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <code className="font-mono text-xs">{selected.transaction_id}</code>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span>{selected.payment_date || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pay Period</span>
                  <span>{selected.pay_period_start} → {selected.pay_period_end}</span>
                </div>
              </div>
              <div className="border border-border rounded-lg divide-y divide-border">
                <div className="flex justify-between p-3 text-sm"><span className="text-muted-foreground">Basic Salary</span><span>₹{(selected.basic ?? 0).toLocaleString()}</span></div>
                <div className="flex justify-between p-3 text-sm"><span className="text-muted-foreground">HRA</span><span>₹{(selected.hra ?? 0).toLocaleString()}</span></div>
                <div className="flex justify-between p-3 text-sm"><span className="text-muted-foreground">Allowances</span><span>₹{(selected.allowances ?? 0).toLocaleString()}</span></div>
                <div className="flex justify-between p-3 text-sm font-medium"><span>Gross Salary</span><span>₹{selected.gross_salary.toLocaleString()}</span></div>
                <div className="flex justify-between p-3 text-sm text-destructive"><span>Deductions</span><span>₹{selected.deductions.toLocaleString()}</span></div>
                <div className="flex justify-between p-3 font-bold text-base"><span>Net Salary</span><span className="text-success">₹{selected.net_salary.toLocaleString()}</span></div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" />Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPayslipsPage;
