import axios from 'axios';
import type {
  Employee, Attendance, LeaveApplication, Payroll, DashboardStats,
  User, Project, ChatMessage, Interview, OnboardingTask, PerformanceRating, Schedule,
  BankAccountDetails, TaxDetails, SalaryRecord, AttendanceDetailReport
} from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Auth ----
export const authApi = {
  login: async (username: string, password: string): Promise<{ token: string; user: User } | null> => {
    try {
      const resp = await apiClient.post('/auth/login', { username, password });
      return resp.data;
    } catch { return null; }
  },
};

// ---- Employees ----
export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const resp = await apiClient.get('/employees');
    return resp.data;
  },
  getById: async (id: string): Promise<Employee | undefined> => {
    try { const resp = await apiClient.get(`/employees/${id}`); return resp.data; }
    catch { return undefined; }
  },
  add: async (employee: any): Promise<Employee | undefined> => {
    try { const resp = await apiClient.post('/employees', employee); return resp.data; }
    catch { return undefined; }
  },
  update: async (id: string, data: Partial<Employee>): Promise<Employee | undefined> => {
    try { const resp = await apiClient.put(`/employees/${id}`, data); return resp.data; }
    catch { return undefined; }
  },
  remove: async (id: string): Promise<boolean> => {
    try { await apiClient.delete(`/employees/${id}`); return true; }
    catch { return false; }
  },
};

// ---- Attendance ----
export const attendanceApi = {
  getAll: async (): Promise<Attendance[]> => {
    const resp = await apiClient.get('/attendance'); return resp.data;
  },
  getByEmployee: async (employeeId: string): Promise<Attendance[]> => {
    const resp = await apiClient.get(`/attendance/employee/${employeeId}`); return resp.data;
  },
  checkIn: async (employeeId: string): Promise<Attendance> => {
    const resp = await apiClient.post('/attendance/check-in', { employee_id: employeeId }); return resp.data;
  },
  checkOut: async (attendanceId: string): Promise<Attendance> => {
    const resp = await apiClient.post('/attendance/check-out', { attendance_id: attendanceId }); return resp.data;
  },
};

// ---- Leave ----
export const leaveApi = {
  getAll: async (): Promise<LeaveApplication[]> => {
    const resp = await apiClient.get('/leaves'); return resp.data;
  },
  getByEmployee: async (employeeId: string): Promise<LeaveApplication[]> => {
    const resp = await apiClient.get(`/leaves/employee/${employeeId}`); return resp.data;
  },
  apply: async (leave: Omit<LeaveApplication, 'leave_id' | 'status' | 'approved_by'>): Promise<LeaveApplication> => {
    const resp = await apiClient.post('/leaves', {
      employee_id: leave.employee_id, leave_type: leave.leave_type,
      start_date: leave.start_date, end_date: leave.end_date, reason: leave.reason
    });
    return resp.data;
  },
  approve: async (leaveId: string): Promise<LeaveApplication> => {
    const resp = await apiClient.post(`/leaves/${leaveId}/approve`); return resp.data;
  },
  reject: async (leaveId: string): Promise<LeaveApplication> => {
    const resp = await apiClient.post(`/leaves/${leaveId}/reject`); return resp.data;
  },
};

// ---- Payroll ----
export const payrollApi = {
  getAll: async (): Promise<Payroll[]> => {
    const resp = await apiClient.get('/payroll'); return resp.data;
  },
  getByEmployee: async (employeeId: string): Promise<Payroll[]> => {
    const resp = await apiClient.get(`/payroll/employee/${employeeId}`); return resp.data;
  },
};

// ---- Dashboard ----
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const resp = await apiClient.get('/dashboard/stats'); return resp.data;
  },
};

// ---- Projects & Chat ----
export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const resp = await apiClient.get('/projects'); return resp.data;
  },
  getById: async (id: string): Promise<Project | undefined> => {
    try { const resp = await apiClient.get(`/projects/${id}`); return resp.data; }
    catch { return undefined; }
  },
  create: async (project: any): Promise<Project> => {
    const resp = await apiClient.post('/projects', project); return resp.data;
  },
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const resp = await apiClient.put(`/projects/${id}`, data); return resp.data;
  },
  updateTeam: async (projectId: string, teamMembers: string[]): Promise<Project> => {
    const resp = await apiClient.put(`/projects/${projectId}/team`, { team_members: teamMembers });
    return resp.data;
  },
  getChatMessages: async (projectId: string, channel: string): Promise<ChatMessage[]> => {
    const resp = await apiClient.get(`/projects/${projectId}/chat/${channel}`); return resp.data;
  },
  sendChatMessage: async (projectId: string, channel: string, data: FormData): Promise<ChatMessage> => {
    const resp = await apiClient.post(`/projects/${projectId}/chat/${channel}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return resp.data;
  },
};

// ---- Interviews (HR Manager) ----
export const interviewApi = {
  getAll: async (): Promise<Interview[]> => {
    const resp = await apiClient.get('/interviews'); return resp.data;
  },
  create: async (data: Omit<Interview, 'interview_id' | 'status' | 'interviewer_name'>): Promise<Interview> => {
    const resp = await apiClient.post('/interviews', data); return resp.data;
  },
  update: async (id: string, status: string, notes: string): Promise<Interview> => {
    const resp = await apiClient.put(`/interviews/${id}`, { status, notes }); return resp.data;
  },
};

// ---- Onboarding (HR Manager) ----
export const onboardingApi = {
  getAll: async (): Promise<OnboardingTask[]> => {
    const resp = await apiClient.get('/onboarding'); return resp.data;
  },
  getByEmployee: async (employeeId: string): Promise<OnboardingTask[]> => {
    const resp = await apiClient.get(`/onboarding/${employeeId}`); return resp.data;
  },
  create: async (data: { employee_id: string; task_name: string; due_date?: string }): Promise<OnboardingTask> => {
    const resp = await apiClient.post('/onboarding', data); return resp.data;
  },
  updateTask: async (taskId: string, completed: boolean): Promise<OnboardingTask> => {
    const resp = await apiClient.put(`/onboarding/task/${taskId}`, { completed }); return resp.data;
  },
};

// ---- Performance Ratings ----
export const performanceApi = {
  getAll: async (): Promise<PerformanceRating[]> => {
    const resp = await apiClient.get('/performance'); return resp.data;
  },
  getByEmployee: async (employeeId: string): Promise<PerformanceRating[]> => {
    const resp = await apiClient.get(`/performance/employee/${employeeId}`); return resp.data;
  },
  getByProject: async (projectId: string): Promise<PerformanceRating[]> => {
    const resp = await apiClient.get(`/performance/project/${projectId}`); return resp.data;
  },
  create: async (data: { employee_id: string; project_id: string; rated_by: string; rating: number; comments?: string }): Promise<PerformanceRating> => {
    const resp = await apiClient.post('/performance', data); return resp.data;
  },
};

// ---- Schedules ----
export const scheduleApi = {
  getAll: async (): Promise<Schedule[]> => {
    const resp = await apiClient.get('/schedules'); return resp.data;
  },
  getByProject: async (projectId: string): Promise<Schedule[]> => {
    const resp = await apiClient.get(`/schedules/project/${projectId}`); return resp.data;
  },
  getByEmployee: async (employeeId: string): Promise<Schedule[]> => {
    const resp = await apiClient.get(`/schedules/employee/${employeeId}`); return resp.data;
  },
  create: async (data: Omit<Schedule, 'schedule_id' | 'project_name'>): Promise<Schedule> => {
    const resp = await apiClient.post('/schedules', data); return resp.data;
  },
  delete: async (id: string): Promise<boolean> => {
    try { await apiClient.delete(`/schedules/${id}`); return true; }
    catch { return false; }
  },
};

// ---- Detailed Attendance Report (GM) ----
export const gmApi = {
  getAttendanceDetailReport: async (): Promise<AttendanceDetailReport[]> => {
    const resp = await apiClient.get('/attendance/report/detail');
    return resp.data;
  },
};

// ---- Salary Management (HR Manager) ----
export const salaryManagementApi = {
  getBankAccount: async (employeeId: string): Promise<BankAccountDetails | {}> => {
    const resp = await apiClient.get(`/bank-accounts/${employeeId}`);
    return resp.data;
  },
  saveBankAccount: async (data: BankAccountRequest): Promise<BankAccountDetails> => {
    const resp = await apiClient.post('/bank-accounts', data);
    return resp.data;
  },
  getTaxDetails: async (employeeId: string): Promise<TaxDetails | {}> => {
    const resp = await apiClient.get(`/tax-details/${employeeId}`);
    return resp.data;
  },
  saveTaxDetails: async (data: TaxDetailRequest): Promise<TaxDetails> => {
    const resp = await apiClient.post('/tax-details', data);
    return resp.data;
  },
  getAllSalaryRecords: async (): Promise<SalaryRecord[]> => {
    const resp = await apiClient.get('/salary-records');
    return resp.data;
  },
  getEmployeeSalaryRecords: async (employeeId: string): Promise<SalaryRecord[]> => {
    const resp = await apiClient.get(`/salary-records/employee/${employeeId}`);
    return resp.data;
  },
  generateSalary: async (data: { employee_id: string; month: string; pay_date: string; working_days?: number }): Promise<SalaryRecord> => {
    const resp = await apiClient.post('/salary-records/generate', data);
    return resp.data;
  },
  creditSalary: async (recordId: string): Promise<SalaryRecord> => {
    const resp = await apiClient.post(`/salary-records/${recordId}/credit`);
    return resp.data;
  },
};

interface BankAccountRequest {
  employee_id: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  account_holder_name: string;
}

interface TaxDetailRequest {
  employee_id: string;
  pan_number: string;
  tax_regime: string;
  annual_tax: number;
  monthly_tax: number;
  pf_monthly: number;
}
