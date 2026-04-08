import { useEffect, useState } from 'react';
import { leaveApi } from '@/services/api';
import type { LeaveApplication } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

const LeavesPage = () => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);

  useEffect(() => {
    leaveApi.getAll().then(setLeaves);
  }, []);

  const handleApprove = async (id: string) => {
    await leaveApi.approve(id);
    setLeaves(prev => prev.map(l => l.leave_id === id ? { ...l, status: 'Approved' as const } : l));
    toast.success('Leave approved');
  };

  const handleReject = async (id: string) => {
    await leaveApi.reject(id);
    setLeaves(prev => prev.map(l => l.leave_id === id ? { ...l, status: 'Rejected' as const } : l));
    toast.success('Leave rejected');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Requests" description="Review and manage employee leave applications" />

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>From</TableHead>
              <TableHead>To</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map(l => (
              <TableRow key={l.leave_id}>
                <TableCell className="font-medium">{l.employee_name}</TableCell>
                <TableCell>{l.leave_type}</TableCell>
                <TableCell>{l.start_date}</TableCell>
                <TableCell>{l.end_date}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{l.reason}</TableCell>
                <TableCell><StatusBadge status={l.status} /></TableCell>
                <TableCell>
                  {l.status === 'Pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-success border-success/30 hover:bg-success/10" onClick={() => handleApprove(l.leave_id)}>
                        <Check className="w-3 h-3 mr-1" />Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleReject(l.leave_id)}>
                        <X className="w-3 h-3 mr-1" />Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeavesPage;
