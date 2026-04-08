import { useEffect, useState } from 'react';
import { leaveApi } from '@/services/api';
import type { LeaveApplication } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

const GMLeavesPage = () => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');

  useEffect(() => {
    leaveApi.getAll().then(data => { setLeaves(data); setLoading(false); });
  }, []);

  const handleApprove = async (id: string) => {
    const updated = await leaveApi.approve(id);
    if (updated) { setLeaves(prev => prev.map(l => l.leave_id === id ? updated : l)); toast.success('Leave approved'); }
    else toast.error('Failed to approve');
  };

  const handleReject = async (id: string) => {
    const updated = await leaveApi.reject(id);
    if (updated) { setLeaves(prev => prev.map(l => l.leave_id === id ? updated : l)); toast.success('Leave rejected'); }
    else toast.error('Failed to reject');
  };

  const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter);
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Approvals" description="Approve or reject employee leave applications">
        {pendingCount > 0 && (
          <div className="px-3 py-1.5 rounded-lg bg-warning/10 text-yellow-700 text-sm font-medium border border-warning/20">
            {pendingCount} pending
          </div>
        )}
      </PageHeader>

      <div className="flex gap-2">
        {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}
            className={filter === f ? 'gradient-primary text-primary-foreground' : ''}>
            {f}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No {filter.toLowerCase()} leave requests</TableCell></TableRow>
            ) : filtered.map(l => (
              <TableRow key={l.leave_id}>
                <TableCell className="font-medium">{l.employee_name}</TableCell>
                <TableCell>{l.leave_type}</TableCell>
                <TableCell>{l.start_date}</TableCell>
                <TableCell>{l.end_date}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{l.reason}</TableCell>
                <TableCell><StatusBadge status={l.status} /></TableCell>
                <TableCell className="text-right">
                  {l.status === 'Pending' && (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(l.leave_id)}>
                        <Check className="w-3 h-3 mr-1" />Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(l.leave_id)}>
                        <X className="w-3 h-3 mr-1" />Reject
                      </Button>
                    </div>
                  )}
                  {l.status !== 'Pending' && <span className="text-sm text-muted-foreground">Decided</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GMLeavesPage;
