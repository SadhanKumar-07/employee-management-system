import { useEffect, useState } from 'react';
import { salaryManagementApi, employeeApi } from '@/services/api';
import type { SalaryRecord, Employee, BankAccountDetails, TaxDetails } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, Receipt, Settings, UserCircle, Calculator, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PayrollPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('process');

  // Form states for Setup
  const [selectedEmpSetup, setSelectedEmpSetup] = useState<string>('');
  const [bankDetails, setBankDetails] = useState<BankAccountDetails>({
    account_number: '', bank_name: '', ifsc_code: '', account_holder_name: ''
  });
  const [taxDetails, setTaxDetails] = useState<TaxDetails>({
    pan_number: '', tax_regime: 'new', annual_tax: 0, monthly_tax: 0, pf_monthly: 1800
  });

  // Form states for Generation
  const [genMonth, setGenMonth] = useState('April 2026');
  const [genPayDate, setGenPayDate] = useState('2026-04-30');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [emps, records] = await Promise.all([
        employeeApi.getAll(),
        salaryManagementApi.getAllSalaryRecords()
      ]);
      setEmployees(emps);
      setSalaryRecords(records);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSetup = async (val: string) => {
    setSelectedEmpSetup(val);
    const [bank, tax] = await Promise.all([
      salaryManagementApi.getBankAccount(val),
      salaryManagementApi.getTaxDetails(val)
    ]);
    if (Object.keys(bank).length > 0) setBankDetails(bank as BankAccountDetails);
    else setBankDetails({ account_number: '', bank_name: '', ifsc_code: '', account_holder_name: '' });
    
    if (Object.keys(tax).length > 0) setTaxDetails(tax as TaxDetails);
    else setTaxDetails({ pan_number: '', tax_regime: 'new', annual_tax: 0, monthly_tax: 0, pf_monthly: 1800 });
  };

  const handleSaveSetup = async () => {
    if (!selectedEmpSetup) return;
    try {
      await Promise.all([
        salaryManagementApi.saveBankAccount({ employee_id: selectedEmpSetup, ...bankDetails }),
        salaryManagementApi.saveTaxDetails({ employee_id: selectedEmpSetup, ...taxDetails })
      ]);
      toast.success("Employee payroll setup saved successfully");
    } catch (error) {
      toast.error("Failed to save setup");
    }
  };

  const handleGenerateSalary = async (employeeId: string) => {
    try {
      await salaryManagementApi.generateSalary({
        employee_id: employeeId,
        month: genMonth,
        pay_date: genPayDate,
        working_days: 26
      });
      toast.success("Salary generated successfully");
      loadData();
    } catch (error) {
      toast.error("Error generating salary. Check if bank/tax details exist.");
    }
  };

  const handleCreditSalary = async (recordId: string) => {
    try {
      await salaryManagementApi.creditSalary(recordId);
      toast.success("Salary credited successfully!");
      loadData();
    } catch (error) {
      toast.error("Failed to credit salary");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Salary Management" description="Automated payroll processing with tax and leave deductions">
        <div className="flex gap-2">
          <Input 
            type="text" 
            value={genMonth} 
            onChange={e => setGenMonth(e.target.value)} 
            className="w-32 h-9" 
            placeholder="Month"
          />
          <Input 
            type="date" 
            value={genPayDate} 
            onChange={e => setGenPayDate(e.target.value)} 
            className="w-40 h-9"
          />
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="process" className="gap-2"><Calculator className="w-4 h-4" /> Process</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><Receipt className="w-4 h-4" /> History</TabsTrigger>
          <TabsTrigger value="setup" className="gap-2"><Settings className="w-4 h-4" /> Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="process" className="mt-6 space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.employee_id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell>
                      {salaryRecords.some(r => r.employee_id === emp.employee_id && r.month === genMonth) ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">Generated</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-500">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-primary hover:bg-primary/10"
                        onClick={() => handleGenerateSalary(emp.employee_id)}
                        disabled={salaryRecords.some(r => r.employee_id === emp.employee_id && r.month === genMonth)}
                      >
                        Generate Salary
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Deductions (Tax+PF+Lv)</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryRecords.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">No salary history found.</TableCell></TableRow>
                ) : salaryRecords.map(r => (
                  <TableRow key={r.salary_record_id}>
                    <TableCell className="font-medium">{r.employee_name}</TableCell>
                    <TableCell>{r.month}</TableCell>
                    <TableCell>₹{r.gross_salary.toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">
                      ₹{r.total_deductions.toLocaleString()} 
                      <span className="text-[10px] block opacity-70">(Tax: {r.tax_deduction}, PF: {r.pf_deduction}, Lv: {r.leave_deduction})</span>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">₹{r.net_salary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={r.payment_status === 'Credited' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {r.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.payment_status === 'Pending' && (
                        <Button size="sm" onClick={() => handleCreditSalary(r.salary_record_id)}>
                          Credit Now
                        </Button>
                      )}
                      {r.payment_status === 'Credited' && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 inline-block" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1 shadow-sm border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Select Employee</CardTitle>
                <CardDescription>Setup bank & tax details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map(emp => (
                    <div 
                      key={emp.employee_id}
                      onClick={() => handleFetchSetup(emp.employee_id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedEmpSetup === emp.employee_id ? 'bg-primary/10 border-primary' : 'hover:bg-muted bg-background'}`}
                    >
                      <div className="text-sm font-medium">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.employee_id}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-3 space-y-6">
              {!selectedEmpSetup ? (
                <div className="h-[400px] border-2 border-dashed rounded-xl flex items-center justify-center flex-col text-muted-foreground bg-muted/20">
                  <UserCircle className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select an employee from the left to configure payroll details.</p>
                </div>
              ) : (
                <>
                  <Card className="shadow-sm">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Bank Account Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Account Holder Name</Label>
                        <Input value={bankDetails.account_holder_name} onChange={e => setBankDetails({...bankDetails, account_holder_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input value={bankDetails.account_number} onChange={e => setBankDetails({...bankDetails, account_number: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input value={bankDetails.bank_name} onChange={e => setBankDetails({...bankDetails, bank_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>IFSC Code</Label>
                        <Input value={bankDetails.ifsc_code} onChange={e => setBankDetails({...bankDetails, ifsc_code: e.target.value})} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Receipt className="w-5 h-5 text-primary" /> Tax & Deduction Setup</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>PAN Number</Label>
                        <Input value={taxDetails.pan_number} onChange={e => setTaxDetails({...taxDetails, pan_number: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Regime</Label>
                        <Select value={taxDetails.tax_regime} onValueChange={v => setTaxDetails({...taxDetails, tax_regime: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="old">Old Regime</SelectItem>
                            <SelectItem value="new">New Regime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Tax (₹)</Label>
                        <Input type="number" value={taxDetails.monthly_tax} onChange={e => setTaxDetails({...taxDetails, monthly_tax: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly PF Contribution (₹)</Label>
                        <Input type="number" value={taxDetails.pf_monthly} onChange={e => setTaxDetails({...taxDetails, pf_monthly: Number(e.target.value)})} />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button size="lg" className="gap-2 px-8" onClick={handleSaveSetup}>
                      <Settings className="w-4 h-4" /> Save Configuration
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollPage;
