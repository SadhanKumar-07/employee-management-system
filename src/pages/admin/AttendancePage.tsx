import { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/api';
import type { Attendance } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const AttendancePage = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    attendanceApi.getAll().then(setRecords);
  }, []);

  const filtered = records.filter(r =>
    (r.employee_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    r.date.includes(search)
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Records" description="Track employee check-ins and check-outs" />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or date..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead><TableHead>Date</TableHead><TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead><TableHead>Total Hours</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => {
              const status = !a.check_in ? 'Absent' : !a.check_out ? 'Working' : (a.total_hours ?? 0) >= 8 ? 'Full Day' : (a.total_hours ?? 0) >= 4 ? 'Half Day' : 'Partial';
              const statusColor = status === 'Full Day' ? 'text-success' : status === 'Working' ? 'text-info' : status === 'Half Day' ? 'text-warning' : 'text-destructive';
              return (
                <TableRow key={a.attendance_id}>
                  <TableCell className="font-medium">{a.employee_name}</TableCell>
                  <TableCell>{a.date}</TableCell>
                  <TableCell>{a.check_in || '—'}</TableCell>
                  <TableCell>{a.check_out || '—'}</TableCell>
                  <TableCell>{a.total_hours != null ? `${a.total_hours}h` : '—'}</TableCell>
                  <TableCell className={`font-medium ${statusColor}`}>{status}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AttendancePage;
