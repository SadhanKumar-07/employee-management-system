import { useEffect, useState } from 'react';
import { gmApi } from '@/services/api';
import type { AttendanceDetailReport } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard } from '@/components/shared/StatCard';
import { UserCheck, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const GMAttendanceReportPage = () => {
  const [report, setReport] = useState<AttendanceDetailReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gmApi.getAttendanceDetailReport().then(data => {
      setReport(data);
      setLoading(false);
    });
  }, []);

  const totalEmps = report.length;
  const presentToday = report.filter(r => r.present_today).length;
  const onLeaveToday = report.filter(r => r.on_leave_today).length;
  const availableNow = report.filter(r => r.available_now).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Real-time Attendance Report" description="Overview of today's attendance and availability across the organization" />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={totalEmps} icon={<UserCheck className="w-5 h-5" />} variant="primary" />
        <StatCard title="Present Today" value={presentToday} icon={<CheckCircle2 className="w-5 h-5" />} variant="success" />
        <StatCard title="Available Now" value={availableNow} icon={<Clock className="w-5 h-5" />} variant="info" />
        <StatCard title="On Leave" value={onLeaveToday} icon={<XCircle className="w-5 h-5" />} variant="warning" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Presence</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Today's Stats</TableHead>
              <TableHead className="text-right">Monthly (Days)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading report...</TableCell></TableRow>
            ) : report.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No employee records found.</TableCell></TableRow>
            ) : report.map(r => (
              <TableRow key={r.employee_id}>
                <TableCell>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.designation}</div>
                </TableCell>
                <TableCell>{r.department}</TableCell>
                <TableCell>
                  {r.on_leave_today ? (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1">
                      <Calendar className="w-3 h-3" /> On Leave ({r.leave_type})
                    </Badge>
                  ) : r.present_today ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Present</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Absent</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {r.available_now ? (
                    <Badge className="bg-blue-500 hover:bg-blue-600">Available</Badge>
                  ) : r.present_today ? (
                    <span className="text-xs text-muted-foreground">Checked out at {r.checked_out}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    <div className="flex justify-between w-24"><span>In:</span> <span className="font-mono">{r.checked_in || '--:--'}</span></div>
                    <div className="flex justify-between w-24"><span>Out:</span> <span className="font-mono">{r.checked_out || '--:--'}</span></div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {r.present_days_this_month}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GMAttendanceReportPage;
