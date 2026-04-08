import { useEffect, useState } from 'react';
import { projectApi, employeeApi, performanceApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, Employee, PerformanceRating } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(i => (
      <Star key={i} className={`w-7 h-7 cursor-pointer transition-colors ${i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-300'}`} onClick={() => onChange(i)} />
    ))}
  </div>
);

const PMTeamPerformancePage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ratings, setRatings] = useState<PerformanceRating[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [rateOpen, setRateOpen] = useState(false);
  const [rateTarget, setRateTarget] = useState<Employee | null>(null);
  const [rateForm, setRateForm] = useState({ rating: 3, comments: '' });

  useEffect(() => {
    Promise.all([projectApi.getAll(), employeeApi.getAll(), performanceApi.getAll()]).then(([p, e, r]) => {
      const mine = p.filter(proj => proj.project_manager_id === user?.employee_id);
      setProjects(mine);
      if (mine.length > 0) setSelectedProject(mine[0].project_id);
      setEmployees(e);
      setRatings(r.filter(rat => rat.rated_by === user?.employee_id));
    });
  }, [user]);

  const currentProject = projects.find(p => p.project_id === selectedProject);
  const teamMembers = employees.filter(e => currentProject?.team_members.includes(e.employee_id));

  const getAvgRating = (empId: string) => {
    const r = ratings.filter(r => r.employee_id === empId && r.project_id === selectedProject);
    return r.length ? r.reduce((s, r) => s + r.rating, 0) / r.length : null;
  };

  const handleRate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!rateTarget || !selectedProject) return;
    const created = await performanceApi.create({ employee_id: rateTarget.employee_id, project_id: selectedProject, rated_by: user?.employee_id ?? '', rating: rateForm.rating, comments: rateForm.comments });
    if (created) { setRatings(prev => [...prev, created]); setRateOpen(false); toast.success(`Rated ${rateTarget.name}`); setRateForm({ rating: 3, comments: '' }); }
    else toast.error('Failed to save rating');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Team Performance" description="Rate and track your team members' performance" />

      {projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground rounded-xl border border-border bg-card">No projects assigned to you</div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {projects.map(p => (
              <Button key={p.project_id} variant={selectedProject === p.project_id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedProject(p.project_id)}
                className={selectedProject === p.project_id ? 'gradient-primary text-primary-foreground' : ''}>
                {p.name}
              </Button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Your Rating</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No team members in this project</TableCell></TableRow>
                ) : teamMembers.map(emp => {
                  const avg = getAvgRating(emp.employee_id);
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
                      <TableCell>{emp.designation}</TableCell>
                      <TableCell>
                        {avg != null ? (
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= avg ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
                            <span className="text-sm text-muted-foreground ml-1">{avg.toFixed(1)}</span>
                          </div>
                        ) : <span className="text-sm text-muted-foreground">Not rated yet</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => { setRateTarget(emp); setRateForm({ rating: 3, comments: '' }); setRateOpen(true); }}>
                          <Star className="w-3 h-3 mr-1" />Rate
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog open={rateOpen} onOpenChange={setRateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rate {rateTarget?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleRate} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <StarPicker value={rateForm.rating} onChange={r => setRateForm({ ...rateForm, rating: r })} />
            </div>
            <div className="space-y-2">
              <Label>Comments</Label>
              <Input value={rateForm.comments} onChange={e => setRateForm({ ...rateForm, comments: e.target.value })} placeholder="Performance notes..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRateOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">Submit Rating</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMTeamPerformancePage;
