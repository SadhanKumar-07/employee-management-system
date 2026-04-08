import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, attendanceApi, leaveApi, payrollApi, employeeApi } from '@/services/api';
import type { DashboardStats, Attendance, LeaveApplication, Payroll, Employee } from '@/types';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Users, UserCheck, Clock, CalendarDays, DollarSign, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveApplication[]>([]);
  const [recentPayroll, setRecentPayroll] = useState<Payroll[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      attendanceApi.getAll(),
      leaveApi.getAll(),
      payrollApi.getAll(),
    ]).then(([s, a, l, p]) => {
      setStats(s);
      setRecentAttendance(a.slice(0, 5));
      setPendingLeaves(l.filter(x => x.status === 'Pending'));
      setRecentPayroll(p.slice(0, 5));
    });
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Overview of your HR operations" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={<Users className="w-5 h-5" />} variant="primary" />
        <StatCard title="Active" value={stats.activeEmployees} icon={<UserCheck className="w-5 h-5" />} variant="success" />
        <StatCard title="Present Today" value={stats.presentToday} icon={<Clock className="w-5 h-5" />} variant="info" />
        <StatCard title="Absent Today" value={stats.absentToday} icon={<AlertTriangle className="w-5 h-5" />} variant="warning" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={<CalendarDays className="w-5 h-5" />} variant="warning" />
        <StatCard title="Total Payroll" value={`₹${(stats.totalPayroll / 1000).toFixed(0)}K`} icon={<DollarSign className="w-5 h-5" />} variant="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leaves */}
        <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-card-foreground">Pending Leave Requests</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/leaves')}>View All</Button>
          </div>
          <div className="p-0">
            {pendingLeaves.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No pending requests</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLeaves.map(l => (
                    <TableRow key={l.leave_id}>
                      <TableCell className="font-medium">{l.employee_name}</TableCell>
                      <TableCell>{l.leave_type}</TableCell>
                      <TableCell className="text-sm">{l.start_date} → {l.end_date}</TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-card-foreground">Today's Attendance</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/attendance')}>View All</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Employee</TableHead><TableHead>Check In</TableHead><TableHead>Check Out</TableHead><TableHead>Hours</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {recentAttendance.map(a => (
                <TableRow key={a.attendance_id}>
                  <TableCell className="font-medium">{a.employee_name}</TableCell>
                  <TableCell>{a.check_in || '—'}</TableCell>
                  <TableCell>{a.check_out || '—'}</TableCell>
                  <TableCell>{a.total_hours != null ? `${a.total_hours}h` : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Payroll */}
      <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Recent Payroll</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/payroll')}>View All</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead><TableHead>Period</TableHead><TableHead>Gross</TableHead>
              <TableHead>Deductions</TableHead><TableHead>Net</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPayroll.map(p => (
              <TableRow key={p.payroll_id}>
                <TableCell className="font-medium">{p.employee_name}</TableCell>
                <TableCell>{p.month}</TableCell>
                <TableCell>₹{p.gross_salary.toLocaleString()}</TableCell>
                <TableCell className="text-destructive">₹{p.deductions.toLocaleString()}</TableCell>
                <TableCell className="font-semibold">₹{p.net_salary.toLocaleString()}</TableCell>
                <TableCell><StatusBadge status={p.payment_status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboard;
