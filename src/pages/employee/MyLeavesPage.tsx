import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaveApi } from '@/services/api';
import type { LeaveApplication, LeaveType } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const MyLeavesPage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ leave_type: 'Casual' as LeaveType, start_date: '', end_date: '', reason: '' });

  useEffect(() => {
    if (user?.employee_id) leaveApi.getByEmployee(user.employee_id).then(setLeaves);
  }, [user]);

  const handleApply = async () => {
    if (!form.start_date || !form.end_date || !form.reason.trim()) {
      toast.error('Please fill all fields'); return;
    }
    const result = await leaveApi.apply({
      employee_id: user!.employee_id,
      employee_name: user!.username,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason,
    });
    setLeaves(prev => [result, ...prev]);
    setOpen(false);
    setForm({ leave_type: 'Casual', start_date: '', end_date: '', reason: '' });
    toast.success('Leave application submitted');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Leaves" description="Apply and track your leave requests">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Apply Leave</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select value={form.leave_type} onValueChange={(v: LeaveType) => setForm(f => ({ ...f, leave_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sick">Sick</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Enter reason for leave" />
              </div>
              <Button className="w-full gradient-primary text-primary-foreground" onClick={handleApply}>Submit Application</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Type</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map(l => (
              <TableRow key={l.leave_id}>
                <TableCell className="font-medium">{l.leave_type}</TableCell>
                <TableCell>{l.start_date}</TableCell>
                <TableCell>{l.end_date}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{l.reason}</TableCell>
                <TableCell><StatusBadge status={l.status} /></TableCell>
              </TableRow>
            ))}
            {leaves.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No leave records</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MyLeavesPage;
