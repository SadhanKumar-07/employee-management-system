import { useEffect, useState } from 'react';
import { onboardingApi, employeeApi } from '@/services/api';
import type { OnboardingTask, Employee } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

const OnboardingPage = () => {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: '', task_name: '', due_date: '' });

  useEffect(() => {
    Promise.all([onboardingApi.getAll(), employeeApi.getAll()]).then(([t, e]) => {
      setTasks(t); setEmployees(e); setLoading(false);
    });
  }, []);

  const handleAdd = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.employee_id || !form.task_name) { toast.error('Employee and task name required'); return; }
    const created = await onboardingApi.create(form);
    if (created) { setTasks(prev => [created, ...prev]); setOpen(false); toast.success('Task added!'); setForm({ employee_id: '', task_name: '', due_date: '' }); }
    else toast.error('Failed to add task');
  };

  const toggleComplete = async (task: OnboardingTask) => {
    const updated = await onboardingApi.updateTask(task.task_id, !task.completed);
    if (updated) setTasks(prev => prev.map(t => t.task_id === task.task_id ? updated : t));
  };

  const grouped = tasks.reduce<Record<string, OnboardingTask[]>>((acc, t) => {
    const key = t.employee_name || t.employee_id;
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Onboarding" description="Track new employee onboarding tasks">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Onboarding Task</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2"><Label>Employee *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} required>
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.name}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Task Name *</Label><Input value={form.task_name} onChange={e => setForm({ ...form, task_name: e.target.value })} placeholder="Complete orientation paperwork" required /></div>
              <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="gradient-primary text-primary-foreground">Add Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground rounded-xl border border-border bg-card">No onboarding tasks yet. Add tasks for new employees.</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([empName, empTasks]) => {
            const done = empTasks.filter(t => t.completed).length;
            const pct = Math.round((done / empTasks.length) * 100);
            return (
              <div key={empName} className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-card-foreground">{empName}</p>
                    <p className="text-sm text-muted-foreground">{done}/{empTasks.length} tasks completed</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${pct === 100 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{pct}%</span>
                    <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {empTasks.map(t => (
                    <div key={t.task_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <button onClick={() => toggleComplete(t)} className="shrink-0">
                        {t.completed ? <CheckSquare className="w-5 h-5 text-green-600" /> : <Square className="w-5 h-5 text-muted-foreground" />}
                      </button>
                      <span className={`flex-1 text-sm ${t.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>{t.task_name}</span>
                      {t.due_date && <span className="text-xs text-muted-foreground">Due: {t.due_date}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
