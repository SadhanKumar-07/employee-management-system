import { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/api';
import type { Attendance } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const AttendancePage = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    attendanceApi.getAll().then(data => { setAttendance(data); setLoading(false); });
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const filtered = attendance.filter(a =>
    (a.employee_name ?? a.employee_id).toLowerCase().includes(search.toLowerCase()) ||
    a.date.includes(search)
  );

  const presentToday = attendance.filter(a => a.date === today).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Records" description="Monitor employee attendance across the organization">
        <div className="flex gap-3">
          <div className="rounded-lg bg-primary/10 text-primary px-4 py-2 text-sm font-medium">
            {presentToday} Present Today
          </div>
        </div>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or date..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No records found</TableCell></TableRow>
            ) : filtered.map(a => (
              <TableRow key={a.attendance_id}>
                <TableCell className="font-medium">{a.employee_name ?? a.employee_id}</TableCell>
                <TableCell>{a.date}</TableCell>
                <TableCell>{a.check_in ?? '—'}</TableCell>
                <TableCell>{a.check_out ?? '—'}</TableCell>
                <TableCell>{a.total_hours != null ? `${a.total_hours}h` : '—'}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.check_out ? 'bg-green-100 text-green-700' : a.check_in ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {a.check_out ? 'Full Day' : a.check_in ? 'Checked In' : 'Absent'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AttendancePage;
