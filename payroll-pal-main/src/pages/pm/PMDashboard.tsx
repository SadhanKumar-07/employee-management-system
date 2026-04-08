import { useEffect, useState } from 'react';
import { projectApi, scheduleApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, Schedule } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Briefcase, ListTodo, Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PMDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([projectApi.getAll(), scheduleApi.getAll()]).then(([p, s]) => {
      const myProjects = p.filter(proj => proj.project_manager_id === user?.employee_id);
      setProjects(myProjects);
      const myProjectIds = myProjects.map(p => p.project_id);
      setSchedules(s.filter(sc => myProjectIds.includes(sc.project_id)));
    });
  }, [user]);

  const upcoming = schedules.filter(s => s.date >= new Date().toISOString().split('T')[0]).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const typeColors: Record<string, string> = {
    Meeting: 'bg-blue-100 text-blue-700',
    Deadline: 'bg-red-100 text-red-700',
    Testing: 'bg-purple-100 text-purple-700',
    Review: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Project Manager Dashboard" description="Manage your projects, team, and schedules" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="My Projects" value={projects.length} icon={<Briefcase className="w-5 h-5" />} variant="primary" />
        <StatCard title="Upcoming Events" value={upcoming.length} icon={<Calendar className="w-5 h-5" />} variant="info" />
        <StatCard title="Total Team Members" value={projects.reduce((s, p) => s + p.team_members.length, 0)} icon={<Star className="w-5 h-5" />} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-card-foreground">My Projects</h3>
            <button className="text-sm text-primary hover:underline" onClick={() => navigate('/projects')}>View All</button>
          </div>
          <div className="divide-y divide-border">
            {projects.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No projects assigned to you yet</p>
            ) : projects.map(p => (
              <div key={p.project_id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.team_members.length} members{p.deadline ? ` · Due ${p.deadline}` : ''}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-card-foreground">Upcoming Schedules</h3>
            <button className="text-sm text-primary hover:underline" onClick={() => navigate('/pm-schedules')}>View All</button>
          </div>
          <div className="divide-y divide-border">
            {upcoming.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No upcoming events</p>
            ) : upcoming.map(s => (
              <div key={s.schedule_id} className="flex items-center gap-4 p-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[s.schedule_type] ?? 'bg-muted text-muted-foreground'}`}>{s.schedule_type}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.project_name} · {s.date} {s.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PMDashboard;
