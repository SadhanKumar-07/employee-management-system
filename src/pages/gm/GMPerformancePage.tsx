import { useEffect, useState } from 'react';
import { performanceApi, employeeApi } from '@/services/api';
import type { PerformanceRating, Employee } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
    ))}
    <span className="ml-1 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
  </div>
);

const GMPerformancePage = () => {
  const [ratings, setRatings] = useState<PerformanceRating[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([performanceApi.getAll(), employeeApi.getAll()]).then(([r, e]) => {
      setRatings(r); setEmployees(e); setLoading(false);
    });
  }, []);

  // Compute per-employee average rating
  const empAvg = employees.map(emp => {
    const empRatings = ratings.filter(r => r.employee_id === emp.employee_id);
    const avg = empRatings.length ? empRatings.reduce((s, r) => s + r.rating, 0) / empRatings.length : null;
    return { emp, avg, count: empRatings.length };
  }).filter(e => e.count > 0).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));

  return (
    <div className="space-y-6">
      <PageHeader title="Performance Overview" description="Organization-wide employee performance ratings from Project Managers" />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : empAvg.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground rounded-xl border border-border bg-card">No performance ratings have been submitted yet</div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Avg Rating</TableHead>
                <TableHead># Reviews</TableHead>
                <TableHead>Latest Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empAvg.map(({ emp, avg, count }) => {
                const latest = ratings.filter(r => r.employee_id === emp.employee_id).sort((a, b) => b.date.localeCompare(a.date))[0];
                return (
                  <TableRow key={emp.employee_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell><StarRating rating={avg ?? 0} /></TableCell>
                    <TableCell><span className="text-sm font-medium">{count} review{count !== 1 ? 's' : ''}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{latest?.comments || '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default GMPerformancePage;
