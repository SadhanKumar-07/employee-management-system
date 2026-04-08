import { useEffect, useState } from 'react';
import { payrollApi } from '@/services/api';
import type { Payroll } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const PayrollPage = () => {
  const [records, setRecords] = useState<Payroll[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    payrollApi.getAll().then(setRecords);
  }, []);

  const filtered = records.filter(r =>
    (r.employee_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    r.transaction_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Payroll" description="View payroll records and payment history" />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or transaction ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead><TableHead>Period</TableHead><TableHead>Gross</TableHead>
              <TableHead>Deductions</TableHead><TableHead>Net Salary</TableHead><TableHead>Transaction ID</TableHead>
              <TableHead>Payment Date</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.payroll_id}>
                <TableCell className="font-medium">{p.employee_name}</TableCell>
                <TableCell>{p.month}</TableCell>
                <TableCell>₹{p.gross_salary.toLocaleString()}</TableCell>
                <TableCell className="text-destructive">{p.deductions > 0 ? `₹${p.deductions.toLocaleString()}` : '—'}</TableCell>
                <TableCell className="font-semibold">₹{p.net_salary.toLocaleString()}</TableCell>
                <TableCell><code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{p.transaction_id}</code></TableCell>
                <TableCell>{p.payment_date || '—'}</TableCell>
                <TableCell><StatusBadge status={p.payment_status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PayrollPage;
