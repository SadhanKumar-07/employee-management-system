import { useEffect, useState } from 'react';
import { projectApi, scheduleApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, Schedule } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const typeColors: Record<string, string> = {
  Meeting: 'bg-blue-100 text-blue-700 border-blue-200',
  Deadline: 'bg-red-100 text-red-700 border-red-200',
  Testing: 'bg-purple-100 text-purple-700 border-purple-200',
  Review: 'bg-green-100 text-green-700 border-green-200',
};

const PMSchedulesPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', schedule_type: 'Meeting', date: '', time: '', description: '' });

  useEffect(() => {
    Promise.all([projectApi.getAll(), scheduleApi.getAll()]).then(([p, s]) => {
      const mine = p.filter(proj => proj.project_manager_id === user?.employee_id);
      setProjects(mine);
      if (mine.length > 0) setSelectedProject(mine[0].project_id);
      const ids = mine.map(p => p.project_id);
      setSchedules(s.filter(sc => ids.includes(sc.project_id)));
    });
  }, [user]);

  const handleCreate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.title || !form.date || !selectedProject) { toast.error('Title, date and project required'); return; }
    const created = await scheduleApi.create({ ...form, project_id: selectedProject, created_by: user?.employee_id ?? '' } as any);
    if (created) { setSchedules(prev => [...prev, created]); setOpen(false); toast.success('Schedule created!'); setForm({ title: '', schedule_type: 'Meeting', date: '', time: '', description: '' }); }
    else toast.error('Failed to create');
  };

  const handleDelete = async (id: string) => {
    const ok = await scheduleApi.delete(id);
    if (ok) { setSchedules(prev => prev.filter(s => s.schedule_id !== id)); toast.success('Schedule deleted'); }
    else toast.error('Failed to delete');
  };

  const filtered = schedules.filter(s => s.project_id === selectedProject).sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Schedules" description="Manage meetings, deadlines, and testing phases">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Create Schedule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Schedule</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.project_id} value={p.project_id}>{p.name}</SelectItem>
                    ))}
                    {projects.length === 0 && (
                      <div className="p-2 text-xs text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> No projects assigned to you
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Sprint Review" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                    value={form.schedule_type} 
                    onChange={e => setForm({ ...form, schedule_type: e.target.value })}
                  >
                    {['Meeting','Deadline','Testing','Review'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional details..." /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="gradient-primary text-primary-foreground">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex gap-2 flex-wrap">
        {projects.map(p => (
          <Button key={p.project_id} variant={selectedProject === p.project_id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedProject(p.project_id)}
            className={selectedProject === p.project_id ? 'gradient-primary text-primary-foreground' : ''}>
            {p.name}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground rounded-xl border border-border bg-card">No schedules for this project. Create one!</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const isPast = s.date < today;
            return (
              <div key={s.schedule_id} className={`rounded-xl border bg-card shadow-card p-4 flex items-start gap-4 ${isPast ? 'opacity-60' : ''}`}>
                <div className="shrink-0 text-center min-w-[52px]">
                  <p className="text-xs text-muted-foreground uppercase">{s.date ? new Date(s.date + 'T00:00').toLocaleString('en', { month: 'short' }) : ''}</p>
                  <p className="text-2xl font-bold text-card-foreground leading-tight">{s.date ? new Date(s.date + 'T00:00').getDate() : ''}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[s.schedule_type] ?? 'bg-muted'}`}>{s.schedule_type}</span>
                    {s.time && <span className="text-xs text-muted-foreground">{s.time}</span>}
                  </div>
                  <p className="font-semibold text-card-foreground">{s.title}</p>
                  {s.description && <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>}
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(s.schedule_id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PMSchedulesPage;
