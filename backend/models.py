from pydantic import BaseModel
from typing import Optional, List

class User(BaseModel):
    user_id: str
    username: str
    role: str
    employee_id: str
    password: Optional[str] = None

class SalaryStructure(BaseModel):
    salary_structure_id: str
    basic: float
    hra: float
    allowances: float
    gross_salary: float

class Employee(BaseModel):
    employee_id: str
    name: str
    email: str
    phone: str
    employee_type: str
    department: str
    designation: str
    joining_date: str
    salary_structure_id: str
    status: str
    role: Optional[str] = "employee"
    avatar: Optional[str] = None
    salary_structure: Optional[SalaryStructure] = None

class Attendance(BaseModel):
    attendance_id: str
    employee_id: str
    employee_name: Optional[str] = None
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    total_hours: Optional[float] = None

class LeaveApplication(BaseModel):
    leave_id: str
    employee_id: str
    employee_name: Optional[str] = None
    leave_type: str
    start_date: str
    end_date: str
    reason: str
    status: str
    approved_by: Optional[str] = None

class Payroll(BaseModel):
    payroll_id: str
    employee_id: str
    employee_name: Optional[str] = None
    month: str
    gross_salary: float
    deductions: float
    net_salary: float
    payment_status: str
    transaction_id: str
    payment_date: str
    pay_period_start: str
    pay_period_end: str
    generated_at: str
    basic: Optional[float] = None
    hra: Optional[float] = None
    allowances: Optional[float] = None

# Auth schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

class DashboardStats(BaseModel):
    totalEmployees: int
    activeEmployees: int
    pendingLeaves: int
    totalPayroll: float
    presentToday: int
    absentToday: int
    totalProjects: Optional[int] = 0
    activeProjects: Optional[int] = 0

class Project(BaseModel):
    project_id: str
    name: str
    description: str
    general_manager_id: str
    project_manager_id: str
    team_members: List[str] = []
    status: str
    deadline: Optional[str] = None
    assigned_by: Optional[str] = None

class ChatMessage(BaseModel):
    message_id: str
    project_id: str
    channel: str  # 'management' or 'team'
    sender_id: str
    sender_name: str
    content: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    timestamp: str

# Salary Processing (HR Module)
class BankAccountDetails(BaseModel):
    account_number: str
    bank_name: str
    ifsc_code: str
    account_holder_name: str

class TaxDetails(BaseModel):
    pan_number: str
    tax_regime: str  # old / new
    annual_tax: float
    monthly_tax: float
    pf_monthly: float      # Provident Fund deduction per month

class SalaryRecord(BaseModel):
    salary_record_id: str
    employee_id: str
    employee_name: Optional[str] = None
    # Salary structure
    basic: float
    hra: float
    allowances: float
    gross_salary: float
    # Deductions
    tax_deduction: float
    pf_deduction: float
    leave_deduction: float
    total_deductions: float
    net_salary: float
    # Period
    month: str          # e.g. "April 2026"
    pay_date: Optional[str] = None
    payment_status: str  # Pending / Credited / Failed
    # Related details (denormalized for audit)
    unpaid_leave_days: int = 0
    working_days: int = 26
    per_day_salary: float = 0.0
    bank_account: Optional[BankAccountDetails] = None
    tax_details: Optional[TaxDetails] = None

# New models for HR Manager
class Interview(BaseModel):
    interview_id: str
    candidate_name: str
    position: str
    scheduled_date: str
    scheduled_time: str
    interviewer_id: str
    interviewer_name: Optional[str] = None
    status: str  # Scheduled / Done / Cancelled
    notes: Optional[str] = None

class OnboardingTask(BaseModel):
    task_id: str
    employee_id: str
    employee_name: Optional[str] = None
    task_name: str
    completed: bool = False
    due_date: Optional[str] = None

# New models for PM / GM
class PerformanceRating(BaseModel):
    rating_id: str
    employee_id: str
    employee_name: Optional[str] = None
    project_id: str
    project_name: Optional[str] = None
    rated_by: str   # PM's employee_id
    rated_by_name: Optional[str] = None
    rating: float   # 1.0 – 5.0
    comments: Optional[str] = None
    date: str

class Schedule(BaseModel):
    schedule_id: str
    project_id: str
    project_name: Optional[str] = None
    title: str
    schedule_type: str  # Meeting / Deadline / Testing
    date: str
    time: Optional[str] = None
    description: Optional[str] = None
    created_by: Optional[str] = None  # PM's employee_id
