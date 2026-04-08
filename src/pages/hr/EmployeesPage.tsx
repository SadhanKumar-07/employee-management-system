import { useEffect, useState } from 'react';
import { employeeApi } from '@/services/api';
import type { Employee } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const emptyForm = { name: '', email: '', phone: '', department: '', designation: '', employee_type: 'Permanent', role: 'employee' };

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    employeeApi.getAll().then(data => { setEmployees(data); setLoading(false); });
  }, []);

  const openAdd = () => { setEditEmp(null); setForm({ ...emptyForm }); setOpen(true); };
  const openEdit = (e: Employee) => { setEditEmp(e); setForm({ name: e.name, email: e.email, phone: e.phone, department: e.department, designation: e.designation, employee_type: e.employee_type, role: e.role }); setOpen(true); };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.name || !form.email) { toast.error('Name & Email are required'); return; }
    setSaving(true);
    if (editEmp) {
      const updated = await employeeApi.update(editEmp.employee_id, form as any);
      if (updated) { setEmployees(prev => prev.map(e => e.employee_id === editEmp.employee_id ? updated : e)); toast.success('Employee updated!'); setOpen(false); }
    } else {
      const joining_date = new Date().toISOString().split('T')[0];
      const created = await employeeApi.add({ ...form, joining_date } as any);
      if (created) { setEmployees(prev => [...prev, created]); toast.success('Employee added!'); setOpen(false); }
      else { toast.error('Failed to add employee. Please check all fields and try again.'); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this employee?')) return;
    const ok = await employeeApi.remove(id);
    if (ok) { setEmployees(prev => prev.filter(e => e.employee_id !== id)); toast.success('Employee removed!'); }
    else toast.error('Failed to remove employee');
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
            <Button className="gradient-primary text-primary-foreground" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editEmp ? 'Edit Employee' : 'Add New Employee'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['name','Name','John Doe'],['email','Email','john@example.com'],['phone','Phone','+1234567890'],['department','Department','Engineering'],['designation','Designation','Software Engineer']].map(([field, label, placeholder]) => (
                  <div key={field} className="space-y-2">
                    <Label>{label}</Label>
                    <Input value={(form as any)[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder} required={field === 'name' || field === 'email'} />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="employee">Employee</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="gm">General Manager</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.employee_type} onChange={e => setForm({ ...form, employee_type: e.target.value })}>
                    <option value="Permanent">Permanent</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="gradient-primary text-primary-foreground">
                  {saving ? 'Saving...' : editEmp ? 'Update Employee' : 'Save Employee'}
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
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No employees found</TableCell></TableRow>
            ) : filtered.map(e => (
              <TableRow key={e.employee_id}>
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
                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)} className="mr-1"><Pencil className="w-4 h-4" /></Button>
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
