import { Badge } from '@/components/ui/badge';
import type { LeaveStatus, PaymentStatus, EmployeeStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig = {
  Active: 'bg-success/10 text-success border-success/20',
  Inactive: 'bg-muted text-muted-foreground border-border',
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Approved: 'bg-success/10 text-success border-success/20',
  Rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  Credited: 'bg-success/10 text-success border-success/20',
  Failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const StatusBadge = ({ status }: { status: LeaveStatus | PaymentStatus | EmployeeStatus }) => (
  <Badge variant="outline" className={cn('font-medium text-xs', statusConfig[status])}>
    {status}
  </Badge>
);
