import type { Employee, SalaryStructure, Attendance, LeaveApplication, Payroll, User } from '@/types';

export const mockUsers: User[] = [
  { user_id: 'U001', username: 'admin', role: 'admin', employee_id: 'EMP001' },
  { user_id: 'U002', username: 'john.doe', role: 'employee', employee_id: 'EMP002' },
  { user_id: 'U003', username: 'jane.smith', role: 'employee', employee_id: 'EMP003' },
];

export const mockSalaryStructures: SalaryStructure[] = [
  { salary_structure_id: 'SS001', basic: 50000, hra: 20000, allowances: 10000, gross_salary: 80000 },
  { salary_structure_id: 'SS002', basic: 35000, hra: 14000, allowances: 7000, gross_salary: 56000 },
  { salary_structure_id: 'SS003', basic: 25000, hra: 10000, allowances: 5000, gross_salary: 40000 },
  { salary_structure_id: 'SS004', basic: 60000, hra: 24000, allowances: 12000, gross_salary: 96000 },
];

export const mockEmployees: Employee[] = [
  { employee_id: 'EMP001', name: 'Sarah Johnson', email: 'sarah@company.com', phone: '+1-555-0101', employee_type: 'Permanent', department: 'Human Resources', designation: 'HR Manager', joining_date: '2020-03-15', salary_structure_id: 'SS004', status: 'Active' },
  { employee_id: 'EMP002', name: 'John Doe', email: 'john@company.com', phone: '+1-555-0102', employee_type: 'Permanent', department: 'Engineering', designation: 'Senior Developer', joining_date: '2021-06-01', salary_structure_id: 'SS001', status: 'Active' },
  { employee_id: 'EMP003', name: 'Jane Smith', email: 'jane@company.com', phone: '+1-555-0103', employee_type: 'Temporary', department: 'Marketing', designation: 'Content Writer', joining_date: '2023-01-10', salary_structure_id: 'SS003', status: 'Active' },
  { employee_id: 'EMP004', name: 'Mike Wilson', email: 'mike@company.com', phone: '+1-555-0104', employee_type: 'Permanent', department: 'Engineering', designation: 'DevOps Engineer', joining_date: '2022-09-20', salary_structure_id: 'SS001', status: 'Active' },
  { employee_id: 'EMP005', name: 'Emily Chen', email: 'emily@company.com', phone: '+1-555-0105', employee_type: 'Temporary', department: 'Design', designation: 'UI Designer', joining_date: '2023-11-05', salary_structure_id: 'SS002', status: 'Active' },
  { employee_id: 'EMP006', name: 'Robert Brown', email: 'robert@company.com', phone: '+1-555-0106', employee_type: 'Permanent', department: 'Finance', designation: 'Accountant', joining_date: '2019-07-22', salary_structure_id: 'SS002', status: 'Active' },
  { employee_id: 'EMP007', name: 'Lisa Taylor', email: 'lisa@company.com', phone: '+1-555-0107', employee_type: 'Permanent', department: 'Engineering', designation: 'QA Lead', joining_date: '2021-02-14', salary_structure_id: 'SS001', status: 'Active' },
  { employee_id: 'EMP008', name: 'David Kim', email: 'david@company.com', phone: '+1-555-0108', employee_type: 'Temporary', department: 'Support', designation: 'Support Agent', joining_date: '2024-01-08', salary_structure_id: 'SS003', status: 'Inactive' },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const mockAttendance: Attendance[] = [
  { attendance_id: 'ATT001', employee_id: 'EMP002', employee_name: 'John Doe', date: today, check_in: '09:00', check_out: '17:30', total_hours: 8.5 },
  { attendance_id: 'ATT002', employee_id: 'EMP003', employee_name: 'Jane Smith', date: today, check_in: '09:15', check_out: null, total_hours: null },
  { attendance_id: 'ATT003', employee_id: 'EMP004', employee_name: 'Mike Wilson', date: today, check_in: '08:45', check_out: '17:00', total_hours: 8.25 },
  { attendance_id: 'ATT004', employee_id: 'EMP005', employee_name: 'Emily Chen', date: today, check_in: '10:00', check_out: '14:00', total_hours: 4 },
  { attendance_id: 'ATT005', employee_id: 'EMP002', employee_name: 'John Doe', date: yesterday, check_in: '09:00', check_out: '18:00', total_hours: 9 },
  { attendance_id: 'ATT006', employee_id: 'EMP003', employee_name: 'Jane Smith', date: yesterday, check_in: '09:30', check_out: '17:30', total_hours: 8 },
  { attendance_id: 'ATT007', employee_id: 'EMP006', employee_name: 'Robert Brown', date: today, check_in: '08:30', check_out: '17:00', total_hours: 8.5 },
  { attendance_id: 'ATT008', employee_id: 'EMP007', employee_name: 'Lisa Taylor', date: today, check_in: '09:00', check_out: '17:45', total_hours: 8.75 },
];

export const mockLeaves: LeaveApplication[] = [
  { leave_id: 'LV001', employee_id: 'EMP002', employee_name: 'John Doe', leave_type: 'Sick', start_date: '2024-03-18', end_date: '2024-03-19', reason: 'Feeling unwell', status: 'Approved', approved_by: 'EMP001' },
  { leave_id: 'LV002', employee_id: 'EMP003', employee_name: 'Jane Smith', leave_type: 'Casual', start_date: '2024-03-25', end_date: '2024-03-26', reason: 'Personal work', status: 'Pending', approved_by: null },
  { leave_id: 'LV003', employee_id: 'EMP004', employee_name: 'Mike Wilson', leave_type: 'Paid', start_date: '2024-04-01', end_date: '2024-04-05', reason: 'Family vacation', status: 'Pending', approved_by: null },
  { leave_id: 'LV004', employee_id: 'EMP005', employee_name: 'Emily Chen', leave_type: 'Sick', start_date: '2024-03-10', end_date: '2024-03-11', reason: 'Doctor appointment', status: 'Approved', approved_by: 'EMP001' },
  { leave_id: 'LV005', employee_id: 'EMP006', employee_name: 'Robert Brown', leave_type: 'Casual', start_date: '2024-03-20', end_date: '2024-03-20', reason: 'Moving house', status: 'Rejected', approved_by: 'EMP001' },
];

export const mockPayroll: Payroll[] = [
  { payroll_id: 'PR001', employee_id: 'EMP002', employee_name: 'John Doe', month: 'March 2024', gross_salary: 80000, deductions: 0, net_salary: 80000, payment_status: 'Credited', transaction_id: 'TXN_1710288000_EMP002', payment_date: '2024-03-01', pay_period_start: '2024-03-01', pay_period_end: '2024-03-31', generated_at: '2024-03-01T00:00:00Z', basic: 50000, hra: 20000, allowances: 10000 },
  { payroll_id: 'PR002', employee_id: 'EMP003', employee_name: 'Jane Smith', month: 'Week 10, 2024', gross_salary: 10000, deductions: 1250, net_salary: 8750, payment_status: 'Credited', transaction_id: 'TXN_1710288000_EMP003', payment_date: '2024-03-09', pay_period_start: '2024-03-03', pay_period_end: '2024-03-09', generated_at: '2024-03-09T00:00:00Z', basic: 6250, hra: 2500, allowances: 1250 },
  { payroll_id: 'PR003', employee_id: 'EMP004', employee_name: 'Mike Wilson', month: 'March 2024', gross_salary: 80000, deductions: 0, net_salary: 80000, payment_status: 'Credited', transaction_id: 'TXN_1710288000_EMP004', payment_date: '2024-03-01', pay_period_start: '2024-03-01', pay_period_end: '2024-03-31', generated_at: '2024-03-01T00:00:00Z', basic: 50000, hra: 20000, allowances: 10000 },
  { payroll_id: 'PR004', employee_id: 'EMP002', employee_name: 'John Doe', month: 'February 2024', gross_salary: 80000, deductions: 0, net_salary: 80000, payment_status: 'Credited', transaction_id: 'TXN_1706745600_EMP002', payment_date: '2024-02-01', pay_period_start: '2024-02-01', pay_period_end: '2024-02-29', generated_at: '2024-02-01T00:00:00Z', basic: 50000, hra: 20000, allowances: 10000 },
  { payroll_id: 'PR005', employee_id: 'EMP005', employee_name: 'Emily Chen', month: 'Week 10, 2024', gross_salary: 14000, deductions: 875, net_salary: 13125, payment_status: 'Pending', transaction_id: 'TXN_1710288000_EMP005', payment_date: '', pay_period_start: '2024-03-03', pay_period_end: '2024-03-09', generated_at: '2024-03-09T00:00:00Z', basic: 8750, hra: 3500, allowances: 1750 },
];
