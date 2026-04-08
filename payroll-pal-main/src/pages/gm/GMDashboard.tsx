import { useEffect, useState } from 'react';
import { dashboardApi, projectApi } from '@/services/api';
import type { DashboardStats } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Users, Briefcase, CalendarDays, BarChart2, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const GMDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardApi.getStats().then(setStats);
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  const quickActions = [
    { label: 'Assign Projects', desc: 'Assign PMs to projects', icon: Briefcase, path: '/projects', color: 'gradient-primary' },
    { label: 'Leave Approvals', desc: 'Approve or reject requests', icon: CalendarDays, path: '/gm-leaves', color: 'bg-accent/20', iconColor: 'text-accent' },
    { label: 'Performance Report', desc: 'View org-wide ratings', icon: BarChart2, path: '/gm-performance', color: 'bg-green-100', iconColor: 'text-green-700' },
    { label: 'Attendance Report', desc: 'Monitor all employees', icon: Clock, path: '/gm-attendance', color: 'bg-orange-100', iconColor: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="General Manager Dashboard" description="Overview of organizational performance and operations" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={<Users className="w-5 h-5" />} variant="primary" />
        <StatCard title="Active Projects" value={stats.activeProjects} icon={<Briefcase className="w-5 h-5" />} variant="info" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={<CalendarDays className="w-5 h-5" />} variant="warning" />
        <StatCard title="Present Today" value={stats.presentToday} icon={<TrendingUp className="w-5 h-5" />} variant="success" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map(action => (
          <div
            key={action.label}
            className="rounded-xl border border-border bg-card shadow-card p-5 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
            onClick={() => navigate(action.path)}
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
              <action.icon className={`w-6 h-6 ${action.color === 'gradient-primary' ? 'text-primary-foreground' : action.iconColor}`} />
            </div>
            <p className="font-semibold text-card-foreground">{action.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Organization Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Employees', val: stats.activeEmployees, color: 'text-green-600' },
            { label: 'Absent Today', val: stats.absentToday, color: 'text-red-500' },
            { label: 'Total Projects', val: stats.totalProjects, color: 'text-blue-600' },
            { label: 'Completed Projects', val: (stats.totalProjects ?? 0) - (stats.activeProjects ?? 0), color: 'text-purple-600' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className={`text-2xl font-bold ${item.color}`}>{item.val}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GMDashboard;
