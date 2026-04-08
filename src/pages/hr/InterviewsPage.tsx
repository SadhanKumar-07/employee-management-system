import { useEffect, useState } from 'react';
import { interviewApi, employeeApi } from '@/services/api';
import type { Interview, Employee } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  Done: 'bg-green-100 text-green-700 border-green-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const InterviewsPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selected, setSelected] = useState<Interview | null>(null);
  const [form, setForm] = useState({ candidate_name: '', position: '', scheduled_date: '', scheduled_time: '10:00', interviewer_id: '', notes: '' });
  const [updateForm, setUpdateForm] = useState({ status: 'Done', notes: '' });

  useEffect(() => {
    Promise.all([interviewApi.getAll(), employeeApi.getAll()]).then(([i, e]) => {
      setInterviews(i); setEmployees(e); setLoading(false);
    });
  }, []);

  const handleSchedule = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.candidate_name || !form.position || !form.scheduled_date) { toast.error('Fill required fields'); return; }
    const created = await interviewApi.create(form as any);
    if (created) { setInterviews(prev => [created, ...prev]); setOpen(false); toast.success('Interview scheduled!'); setForm({ candidate_name: '', position: '', scheduled_date: '', scheduled_time: '10:00', interviewer_id: '', notes: '' }); }
    else toast.error('Failed to schedule interview');
  };

  const handleUpdate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selected) return;
    const updated = await interviewApi.update(selected.interview_id, updateForm.status, updateForm.notes);
    if (updated) { setInterviews(prev => prev.map(i => i.interview_id === selected.interview_id ? updated : i)); setUpdateOpen(false); toast.success('Interview updated!'); }
    else toast.error('Failed to update');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Interviews" description="Schedule and track candidate interviews">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Schedule Interview</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule New Interview</DialogTitle></DialogHeader>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2"><Label>Candidate Name *</Label><Input value={form.candidate_name} onChange={e => setForm({ ...form, candidate_name: e.target.value })} placeholder="Jane Smith" required /></div>
                <div className="space-y-2"><Label>Position *</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="Software Engineer" required /></div>
                <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.scheduled_time} onChange={e => setForm({ ...form, scheduled_time: e.target.value })} /></div>
                <div className="space-y-2"><Label>Interviewer</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.interviewer_id} onChange={e => setForm({ ...form, interviewer_id: e.target.value })}>
                    <option value="">Select interviewer</option>
                    {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="gradient-primary text-primary-foreground">Schedule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Interview — {selected?.candidate_name}</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2"><Label>Status</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}>
                <option value="Scheduled">Scheduled</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Input value={updateForm.notes} onChange={e => setUpdateForm({ ...updateForm, notes: e.target.value })} placeholder="Outcome notes..." /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Interviewer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : interviews.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No interviews scheduled yet</TableCell></TableRow>
            ) : interviews.map(i => (
              <TableRow key={i.interview_id}>
                <TableCell className="font-medium">{i.candidate_name}</TableCell>
                <TableCell>{i.position}</TableCell>
                <TableCell className="text-sm">{i.scheduled_date} at {i.scheduled_time}</TableCell>
                <TableCell>{i.interviewer_name || '—'}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[i.status]}>{i.status}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{i.notes || '—'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => { setSelected(i); setUpdateForm({ status: i.status, notes: i.notes || '' }); setUpdateOpen(true); }}>
                    <UserCheck className="w-4 h-4 mr-1" />Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InterviewsPage;
