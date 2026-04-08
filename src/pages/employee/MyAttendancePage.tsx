import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceApi } from '@/services/api';
import type { Attendance } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MyAttendancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<Attendance[]>([]);

  useEffect(() => {
    if (user?.employee_id) attendanceApi.getByEmployee(user.employee_id).then(setRecords);
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" description="Your attendance history" />
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Date</TableHead><TableHead>Check In</TableHead><TableHead>Check Out</TableHead><TableHead>Hours</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {records.map(a => (
              <TableRow key={a.attendance_id}>
                <TableCell className="font-medium">{a.date}</TableCell>
                <TableCell>{a.check_in || '—'}</TableCell>
                <TableCell>{a.check_out || '—'}</TableCell>
                <TableCell>{a.total_hours != null ? `${a.total_hours}h` : '—'}</TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No attendance records</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MyAttendancePage;
