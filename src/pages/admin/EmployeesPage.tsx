import { useEffect, useState } from 'react';
import { employeeApi } from '@/services/api';
import type { Employee } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', phone: '', department: '', designation: '', employee_type: 'Permanent', role: 'employee' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    employeeApi.getAll().then(data => { setEmployees(data); setLoading(false); });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email) {
      toast.error('Name & Email are required');
      return;
    }
    setAdding(true);
    const joining_date = new Date().toISOString().split('T')[0];
    const created = await employeeApi.add({ ...newEmp, joining_date } as any);
    setAdding(false);
    if (created) {
      setEmployees(prev => [...prev, created]);
      setOpen(false);
      setNewEmp({ name: '', email: '', phone: '', department: '', designation: '', employee_type: 'Permanent', role: 'employee' });
      toast.success('Employee added successfully!');
    } else {
      toast.error('Failed to add employee. Please check all fields and try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this employee?")) return;
    const success = await employeeApi.remove(id);
    if (success) {
      setEmployees(prev => prev.filter(e => e.employee_id !== id));
      toast.success('Employee removed successfully!');
    } else {
      toast.error('Failed to remove employee');
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Manage your workforce">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} placeholder="john@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={newEmp.phone} onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })} placeholder="+1234567890" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })} placeholder="Engineering" />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input value={newEmp.designation} onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })} placeholder="Software Engineer" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newEmp.role}
                    onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="gm">General Manager</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newEmp.employee_type}
                    onChange={e => setNewEmp({ ...newEmp, employee_type: e.target.value })}
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={adding} className="gradient-primary text-primary-foreground">
                  {adding ? 'Adding...' : 'Save Employee'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No employees found</TableCell></TableRow>
            ) : filtered.map(e => (
              <TableRow key={e.employee_id} className="animate-fade-in">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                      {e.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell>{e.designation}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={e.employee_type === 'Permanent' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-accent/10 text-accent border-accent/20'}>
                    {e.employee_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.joining_date}</TableCell>
                <TableCell className="font-medium">₹{e.salary_structure?.gross_salary?.toLocaleString() ?? '—'}</TableCell>
                <TableCell><StatusBadge status={e.status} /></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(e.employee_id)}>
                    <Trash2 className="w-4 h-4" />
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

export default EmployeesPage;
