import { useEffect, useState } from 'react';
import { attendanceApi, leaveApi, projectApi, scheduleApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Attendance, LeaveApplication, Project, Schedule } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Clock, CalendarDays, Briefcase, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [todayAtt, setTodayAtt] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(false);

  const empId = user?.employee_id ?? '';

  useEffect(() => {
    if (!empId) return;
    Promise.all([
      attendanceApi.getByEmployee(empId),
      leaveApi.getByEmployee(empId),
      projectApi.getAll(),
      scheduleApi.getByEmployee(empId),
    ]).then(([att, lv, proj, sch]) => {
      setAttendance(att);
      setLeaves(lv);
      setProjects(proj.filter(p => p.team_members.includes(empId)));
      setSchedules(sch);
      const today = new Date().toISOString().split('T')[0];
      const todayRec = att.find(a => a.date === today && !a.check_out);
      setTodayAtt(todayRec ?? null);
    });
  }, [empId]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const rec = await attendanceApi.checkIn(empId);
      setTodayAtt(rec);
      setAttendance(prev => [...prev, rec]);
      toast.success('Checked in successfully!');
    } catch { toast.error('Check-in failed'); }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    if (!todayAtt) return;
    setLoading(true);
    try {
      const rec = await attendanceApi.checkOut(todayAtt.attendance_id);
      setTodayAtt(null);
      setAttendance(prev => prev.map(a => a.attendance_id === rec.attendance_id ? rec : a));
      toast.success(`Checked out! Total: ${rec.total_hours}h`);
    } catch { toast.error('Check-out failed'); }
    setLoading(false);
  };

  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  const upcomingEvents = schedules.filter(s => s.date >= new Date().toISOString().split('T')[0]).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  const typeColors: Record<string, string> = {
    Meeting: 'bg-blue-100 text-blue-700',
    Deadline: 'bg-red-100 text-red-700',
    Testing: 'bg-purple-100 text-purple-700',
    Review: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Dashboard" description="Your personal work overview" />

      {/* Attendance CTA */}
      <div className="rounded-xl border border-border bg-card shadow-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-card-foreground text-lg">Attendance</p>
            <p className="text-sm text-muted-foreground mt-1">
              {todayAtt ? `Checked in at ${todayAtt.check_in} — click to check out` : 'You haven\'t checked in today'}
            </p>
          </div>
          <Button
            onClick={todayAtt ? handleCheckOut : handleCheckIn}
            disabled={loading}
            className={todayAtt ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'gradient-primary text-primary-foreground'}
            size="lg"
          >
            <Clock className="w-4 h-4 mr-2" />
            {loading ? 'Processing...' : todayAtt ? 'Check Out' : 'Check In'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="My Projects" value={projects.length} icon={<Briefcase className="w-5 h-5" />} variant="primary" />
        <StatCard title="Pending Leaves" value={pendingLeaves} icon={<CalendarDays className="w-5 h-5" />} variant="warning" />
        <StatCard title="Upcoming Events" value={upcomingEvents.length} icon={<Bell className="w-5 h-5" />} variant="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-card-foreground">Upcoming Notifications</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/notifications')}>View All</Button>
          </div>
          <div className="divide-y divide-border">
            {upcomingEvents.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No upcoming events</p>
            ) : upcomingEvents.map(s => (
              <div key={s.schedule_id} className="flex items-center gap-3 p-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[s.schedule_type] ?? 'bg-muted'}`}>{s.schedule_type}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.project_name} · {s.date} {s.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-card-foreground">My Projects</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>View All</Button>
          </div>
          <div className="divide-y divide-border">
            {projects.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Not assigned to any projects yet</p>
            ) : projects.map(p => (
              <div key={p.project_id} className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.description?.slice(0, 60)}…</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
