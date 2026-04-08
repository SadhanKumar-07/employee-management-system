import { useEffect, useState } from 'react';
import { scheduleApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Schedule } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Bell, Calendar } from 'lucide-react';

const typeColors: Record<string, string> = {
  Meeting: 'bg-blue-100 text-blue-700 border-blue-200',
  Deadline: 'bg-red-100 text-red-700 border-red-200',
  Testing: 'bg-purple-100 text-purple-700 border-purple-200',
  Review: 'bg-green-100 text-green-700 border-green-200',
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.employee_id) return;
    scheduleApi.getByEmployee(user.employee_id).then(data => {
      setSchedules(data.sort((a, b) => a.date.localeCompare(b.date)));
      setLoading(false);
    });
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = schedules.filter(s => s.date >= today);
  const past = schedules.filter(s => s.date < today);

  const renderCard = (s: Schedule, isPast = false) => (
    <div key={s.schedule_id} className={`rounded-xl border bg-card shadow-card p-4 flex items-start gap-4 ${isPast ? 'opacity-60' : ''}`}>
      <div className="shrink-0 text-center min-w-[52px]">
        <p className="text-xs text-muted-foreground uppercase">{new Date(s.date + 'T00:00').toLocaleString('en', { month: 'short' })}</p>
        <p className="text-2xl font-bold text-card-foreground leading-tight">{new Date(s.date + 'T00:00').getDate()}</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[s.schedule_type] ?? 'bg-muted'}`}>{s.schedule_type}</span>
          {s.time && <span className="text-xs text-muted-foreground">{s.time}</span>}
        </div>
        <p className="font-semibold text-card-foreground">{s.title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">Project: {s.project_name}</p>
        {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Meetings, deadlines, and scheduled events for your projects" />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-card-foreground">No notifications</p>
          <p className="text-sm text-muted-foreground">You'll see meeting and deadline notifications here</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Upcoming ({upcoming.length})
              </h3>
              {upcoming.map(s => renderCard(s, false))}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-muted-foreground flex items-center gap-2">Past Events ({past.length})</h3>
              {past.reverse().map(s => renderCard(s, true))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
