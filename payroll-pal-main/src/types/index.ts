export type UserRole = 'hr_manager' | 'gm' | 'project_manager' | 'employee';
export type EmployeeType = 'Permanent' | 'Temporary';
export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';
export type LeaveType = 'Sick' | 'Casual' | 'Paid' | 'Emergency';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type PaymentStatus = 'Pending' | 'Credited' | 'Failed';
export type InterviewStatus = 'Scheduled' | 'Done' | 'Cancelled';
export type ScheduleType = 'Meeting' | 'Deadline' | 'Testing' | 'Review';

export interface User {
  user_id: string;
  username: string;
  role: UserRole;
  employee_id: string;
}

export interface SalaryStructure {
  salary_structure_id: string;
  basic: number;
  hra: number;
  allowances: number;
  gross_salary: number;
}

export interface Employee {
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  employee_type: EmployeeType;
  department: string;
  designation: string;
  joining_date: string;
  salary_structure_id: string;
  salary_structure?: SalaryStructure;
  status: EmployeeStatus;
  role: UserRole;
  avatar?: string;
}

export interface Attendance {
  attendance_id: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | null;
}

export interface LeaveApplication {
  leave_id: string;
  employee_id: string;
  employee_name?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  approved_by: string | null;
}

export interface Payroll {
  payroll_id: string;
  employee_id: string;
  employee_name?: string;
  month: string;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  payment_status: PaymentStatus;
  transaction_id: string;
  payment_date: string;
  pay_period_start: string;
  pay_period_end: string;
  generated_at: string;
  basic?: number;
  hra?: number;
  allowances?: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  totalPayroll: number;
  presentToday: number;
  absentToday: number;
  totalProjects: number;
  activeProjects: number;
}

export interface Project {
  project_id: string;
  name: string;
  description: string;
  general_manager_id: string;
  project_manager_id: string;
  team_members: string[];
  status: string;
  deadline?: string;
  assigned_by?: string;
}

export interface ChatMessage {
  message_id: string;
  project_id: string;
  channel: string;
  sender_id: string;
  sender_name: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  timestamp: string;
}

export interface Interview {
  interview_id: string;
  candidate_name: string;
  position: string;
  scheduled_date: string;
  scheduled_time: string;
  interviewer_id: string;
  interviewer_name?: string;
  status: InterviewStatus;
  notes?: string;
}

export interface OnboardingTask {
  task_id: string;
  employee_id: string;
  employee_name?: string;
  task_name: string;
  completed: boolean;
  due_date?: string;
}

export interface PerformanceRating {
  rating_id: string;
  employee_id: string;
  employee_name?: string;
  project_id: string;
  project_name?: string;
  rated_by: string;
  rated_by_name?: string;
  rating: number;
  comments?: string;
  date: string;
}

export interface Schedule {
  schedule_id: string;
  project_id: string;
  project_name?: string;
  title: string;
  schedule_type: ScheduleType;
  date: string;
  time?: string;
  description?: string;
  created_by: string;
}

export interface BankAccountDetails {
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  account_holder_name: string;
}

export interface TaxDetails {
  pan_number: string;
  tax_regime: string;
  annual_tax: number;
  monthly_tax: number;
  pf_monthly: number;
}

export interface SalaryRecord {
  salary_record_id: string;
  employee_id: string;
  employee_name?: string;
  basic: number;
  hra: number;
  allowances: number;
  gross_salary: number;
  tax_deduction: number;
  pf_deduction: number;
  leave_deduction: number;
  total_deductions: number;
  net_salary: number;
  month: string;
  pay_date?: string;
  payment_status: 'Pending' | 'Credited' | 'Failed';
  unpaid_leave_days: number;
  working_days: number;
  per_day_salary: number;
  bank_account?: BankAccountDetails;
  tax_details?: TaxDetails;
}

export interface AttendanceDetailReport {
  employee_id: string;
  name: string;
  department: string;
  designation: string;
  present_today: boolean;
  checked_in?: string;
  checked_out?: string;
  available_now: boolean;
  on_leave_today: boolean;
  leave_type?: string;
  present_days_this_month: number;
}
