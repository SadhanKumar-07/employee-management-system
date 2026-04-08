import { useEffect, useState } from 'react';
import { dashboardApi, employeeApi, leaveApi } from '@/services/api';
import type { DashboardStats, Employee } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Users, Clock, CalendarDays, DollarSign, UserCheck, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HRDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), employeeApi.getAll()]).then(([s, emps]) => {
      setStats(s);
      setRecentEmployees(emps.slice(-5).reverse());
    });
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="HR Manager Dashboard" description="Manage your workforce and HR operations" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={<Users className="w-5 h-5" />} variant="primary" />
        <StatCard title="Active Employees" value={stats.activeEmployees} icon={<UserCheck className="w-5 h-5" />} variant="success" />
        <StatCard title="Present Today" value={stats.presentToday} icon={<Clock className="w-5 h-5" />} variant="info" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={<CalendarDays className="w-5 h-5" />} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="rounded-xl border border-border bg-card shadow-card p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/employees')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground">Manage Employees</p>
              <p className="text-sm text-muted-foreground">Add, edit, remove records</p>
            </div>
          </div>
        </div>
        <div
          className="rounded-xl border border-border bg-card shadow-card p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/interviews')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground">Schedule Interviews</p>
              <p className="text-sm text-muted-foreground">Track new candidates</p>
            </div>
          </div>
        </div>
        <div
          className="rounded-xl border border-border bg-card shadow-card p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/onboarding')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-success-foreground" style={{color: 'hsl(142 71% 45%)'}} />
            </div>
            <div>
              <p className="font-semibold text-card-foreground">Onboarding</p>
              <p className="text-sm text-muted-foreground">Track new hire tasks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Recent Employees</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>View All</Button>
        </div>
        <div className="divide-y divide-border">
          {recentEmployees.map(e => (
            <div key={e.employee_id} className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                {e.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground text-sm">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.designation} · {e.department}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.status === 'Active' ? 'bg-success/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                {e.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
